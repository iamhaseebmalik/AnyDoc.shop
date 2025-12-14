import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UploadedDocument {
  id: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  signedUrl: string;
  expiresAt: string;
}

// Generate a unique session ID for anonymous users
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("document_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("document_session_id", sessionId);
  }
  return sessionId;
};

export const useDocumentStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = async (file: File): Promise<UploadedDocument | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const sessionId = getSessionId();
      const fileExt = file.name.split(".").pop();
      const fileName = `${sessionId}/${crypto.randomUUID()}.${fileExt}`;

      setUploadProgress(20);

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setUploadProgress(60);

      // Create tracking record
      const { data: recordData, error: recordError } = await supabase
        .from("document_uploads")
        .insert({
          storage_path: uploadData.path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          session_id: sessionId,
        })
        .select()
        .single();

      if (recordError) {
        // Clean up uploaded file if record creation fails
        await supabase.storage.from("documents").remove([uploadData.path]);
        throw new Error(recordError.message);
      }

      setUploadProgress(80);

      // Get signed URL for viewing (valid for 24 hours)
      const { data: signedData, error: signedError } = await supabase.storage
        .from("documents")
        .createSignedUrl(uploadData.path, 86400); // 24 hours

      if (signedError) {
        throw new Error(signedError.message);
      }

      setUploadProgress(100);

      return {
        id: recordData.id,
        storagePath: uploadData.path,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        signedUrl: signedData.signedUrl,
        expiresAt: recordData.expires_at,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload document";
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (storagePath: string, recordId: string): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([storagePath]);

      if (storageError) {
        throw new Error(storageError.message);
      }

      // Delete tracking record
      const { error: recordError } = await supabase
        .from("document_uploads")
        .delete()
        .eq("id", recordId);

      if (recordError) {
        throw new Error(recordError.message);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete document";
      setError(errorMessage);
      return false;
    }
  };

  const getSignedUrl = async (storagePath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(storagePath, 86400);

      if (error) {
        throw new Error(error.message);
      }

      return data.signedUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get signed URL";
      setError(errorMessage);
      return null;
    }
  };

  return {
    uploadDocument,
    deleteDocument,
    getSignedUrl,
    isUploading,
    uploadProgress,
    error,
  };
};
