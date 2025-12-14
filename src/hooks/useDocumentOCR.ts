import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      
      console.log("Sending document for OCR extraction...");
      
      const { data, error: fnError } = await supabase.functions.invoke("extract-document-text", {
        body: {
          imageBase64: base64,
          mimeType: file.type,
        },
      });

      if (fnError) {
        console.error("OCR function error:", fnError);
        throw new Error(fnError.message);
      }

      if (!data.success) {
        console.error("OCR extraction failed:", data.error);
        throw new Error(data.error || "Failed to extract text");
      }

      console.log("OCR extraction successful:", data.data);
      setExtractedData(data.data);
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to extract document text";
      console.error("OCR error:", errorMessage);
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
