import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TextEdit {
  label: string;
  originalValue: string;
  newValue: string;
}

export const useDocumentEditor = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyEdits = async (
    file: File,
    originalFields: { id: string; label: string; value: string }[],
    editedFields: { id: string; label: string; value: string }[]
  ): Promise<string | null> => {
    setIsEditing(true);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Build text edits array
      const textEdits: TextEdit[] = originalFields.map((original, index) => ({
        label: original.label,
        originalValue: original.value,
        newValue: editedFields[index]?.value || original.value,
      })).filter(edit => edit.originalValue !== edit.newValue);

      if (textEdits.length === 0) {
        // No edits, return original file as data URL
        const originalUrl = `data:${file.type};base64,${base64}`;
        setEditedImageUrl(originalUrl);
        return originalUrl;
      }

      const { data, error: fnError } = await supabase.functions.invoke("edit-document", {
        body: {
          imageBase64: base64,
          mimeType: file.type,
          textEdits,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to edit document");
      }

      const resultUrl = data.editedImageUrl || `data:image/png;base64,${data.editedImageBase64}`;
      setEditedImageUrl(resultUrl);
      return resultUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to edit document";
      setError(errorMessage);
      return null;
    } finally {
      setIsEditing(false);
    }
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
  };

  return {
    applyEdits,
    isEditing,
    editedImageUrl,
    resetEditedImage,
    error,
  };
};
