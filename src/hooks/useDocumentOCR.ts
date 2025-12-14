import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ExtractedDocumentData {
  documentType?: string;
  fullName?: string;
  surname?: string;
  givenNames?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  placeOfBirth?: string;
  placeOfIssue?: string;
  mrz?: string[];
  rawText?: string;
}

export const useDocumentOCR = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractTextFromDocument = async (file: File): Promise<ExtractedDocumentData | null> => {
    setIsExtracting(true);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      const { data, error: fnError } = await supabase.functions.invoke("extract-document-text", {
        body: {
          imageBase64: base64,
          mimeType: file.type,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to extract text");
      }

      setExtractedData(data.data);
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to extract document text";
      setError(errorMessage);
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return {
    extractTextFromDocument,
    isExtracting,
    extractedData,
    setExtractedData,
    error,
  };
};
