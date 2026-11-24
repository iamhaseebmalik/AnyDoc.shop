import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { readEdgeFunctionFailure } from "@/lib/edgeFunctionErrors";

export interface AdditionalField {
  label: string;
  value: string;
}

export interface DetectedTextItem {
  label: string;
  value: string;
  position?: string;
}

export interface ExtractedDocumentData {
  // All detected text - primary source
  allDetectedText?: DetectedTextItem[];
  
  // Personal Information
  documentType?: string;
  fullName?: string;
  surname?: string;
  givenNames?: string;
  nationality?: string;
  nationalityCode?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  gender?: string;
  
  // Document Details
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  placeOfIssue?: string;
  issuingAuthority?: string;
  issuingCountry?: string;
  
  // Additional Fields
  address?: string;
  height?: string;
  eyeColor?: string;
  signature?: string;
  licenseClass?: string;
  restrictions?: string;
  bloodType?: string;
  emergencyContact?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  occupation?: string;
  maritalStatus?: string;
  
  // MRZ
  mrz?: string[];
  
  // Additional detected fields
  additionalFields?: AdditionalField[];
  
  // Raw text fallback
  rawText?: string;
}

export interface DocumentOCRResult {
  data: ExtractedDocumentData | null;
  error: string | null;
  blockedStatus: number | null;
}

export const useDocumentOCR = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockedStatus, setBlockedStatus] = useState<number | null>(null);

  const extractTextFromDocument = async (
    file: File,
    resumeAfterAccessRestored = false,
  ): Promise<DocumentOCRResult> => {
    setIsExtracting(true);
    setError(null);
    setBlockedStatus(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      console.log("Sending document for OCR extraction...");
      
      const { data, error: fnError } = await supabase.functions.invoke("extract-document-text", {
        body: {
          imageBase64: base64,
          mimeType: file.type,
          resumeAfterAccessRestored,
        },
      });

      if (fnError) {
        const failure = await readEdgeFunctionFailure(
          fnError,
          "Text extraction is unavailable. Please try again later.",
        );
        const blocked = failure.status === 402 || failure.status === 403 ? failure.status : null;
        setError(failure.message);
        setBlockedStatus(blocked);
        return { data: null, error: failure.message, blockedStatus: blocked };
      }

      if (!data.success) {
        const errorMessage = typeof data.error === "string" && data.error
          ? data.error
          : "Failed to extract text from the document.";
        setError(errorMessage);
        return { data: null, error: errorMessage, blockedStatus: null };
      }

      setExtractedData(data.data);
      return { data: data.data, error: null, blockedStatus: null };
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "The document could not be prepared for text extraction.";
      setError(errorMessage);
      return { data: null, error: errorMessage, blockedStatus: null };
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
    blockedStatus,
  };
};
