import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { readEdgeFunctionFailure } from "@/lib/edgeFunctionErrors";

interface TextEdit {
  label: string;
  originalValue: string;
  newValue: string;
}

interface AppliedEdit {
  label: string;
  from: string;
  to: string;
}

interface EditResult {
  success: boolean;
  editedImageUrl: string | null;
  editsApplied: AppliedEdit[];
  attempt: number;
  canRetry: boolean;
  message: string;
}

export const useDocumentEditor = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastEditResult, setLastEditResult] = useState<EditResult | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [blockedStatus, setBlockedStatus] = useState<number | null>(null);

  const applyEdits = async (
    file: File,
    originalFields: { id: string; label: string; value: string }[],
    editedFields: { id: string; label: string; value: string }[],
    facePhotoBase64?: string | null,
    attempt: number = 1,
    resumeAfterAccessRestored = false,
  ): Promise<string | null> => {
    setIsEditing(true);
    setError(null);
    setBlockedStatus(null);
    setCurrentAttempt(attempt);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Build text edits array
      const textEdits: TextEdit[] = originalFields.map((original, index) => ({
        label: original.label,
        originalValue: original.value,
        newValue: editedFields[index]?.value || original.value,
      })).filter(edit => edit.originalValue !== edit.newValue);

      const hasTextEdits = textEdits.length > 0;
      const hasFacePhoto = !!facePhotoBase64;

      if (!hasTextEdits && !hasFacePhoto) {
        // No edits, return original file as data URL
        const originalUrl = `data:${file.type};base64,${base64}`;
        setEditedImageUrl(originalUrl);
        setLastEditResult({
          success: true,
          editedImageUrl: originalUrl,
          editsApplied: [],
          attempt,
          canRetry: false,
          message: "No changes to apply"
        });
        return originalUrl;
      }

      console.log(`Attempt ${attempt}: Calling edit-document with ${textEdits.length} text edits, face photo: ${hasFacePhoto}`);
      
      const { data, error: fnError } = await supabase.functions.invoke("edit-document", {
        body: {
          imageBase64: base64,
          mimeType: file.type,
          textEdits,
          facePhotoBase64,
          attempt,
          resumeAfterAccessRestored,
        },
      });

      if (fnError) {
        const failure = await readEdgeFunctionFailure(
          fnError,
          "Document editing is unavailable. Please try again later.",
        );
        const blocked = failure.status === 402 || failure.status === 403 ? failure.status : null;
        setError(failure.message);
        setBlockedStatus(blocked);
        setLastEditResult({
          success: false,
          editedImageUrl: null,
          editsApplied: [],
          attempt,
          canRetry: false,
          message: failure.message,
        });
        return null;
      }

      if (!data.success) {
        console.error("Edit failed:", data.error || data.message);
        setLastEditResult({
          success: false,
          editedImageUrl: null,
          editsApplied: [],
          attempt,
          canRetry: data.canRetry !== false,
          message: data.error || data.message || "Failed to edit document"
        });
        throw new Error(data.error || data.message || "Failed to edit document");
      }

      const resultUrl = data.editedImageUrl || `data:image/png;base64,${data.editedImageBase64}`;
      setEditedImageUrl(resultUrl);
      setLastEditResult({
        success: true,
        editedImageUrl: resultUrl,
        editsApplied: data.editsApplied || [],
        attempt: data.attempt || attempt,
        canRetry: true,
        message: data.message || "Edits applied successfully"
      });
      
      return resultUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to edit document";
      setError(errorMessage);
      return null;
    } finally {
      setIsEditing(false);
    }
  };

  const retryEdits = async (
    file: File,
    originalFields: { id: string; label: string; value: string }[],
    editedFields: { id: string; label: string; value: string }[],
    facePhotoBase64?: string | null
  ): Promise<string | null> => {
    const nextAttempt = currentAttempt + 1;
    return applyEdits(file, originalFields, editedFields, facePhotoBase64, nextAttempt, true);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const resetEditedImage = () => {
    setEditedImageUrl(null);
    setError(null);
    setLastEditResult(null);
    setCurrentAttempt(0);
    setBlockedStatus(null);
  };

  return {
    applyEdits,
    retryEdits,
    isEditing,
    editedImageUrl,
    resetEditedImage,
    error,
    blockedStatus,
    lastEditResult,
    currentAttempt,
  };
};
