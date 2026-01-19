import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SaveHistoryParams {
  documentName: string;
  documentType?: string;
  editedFields?: Record<string, { original: string; new: string }>;
}

export const useEditingHistory = () => {
  const { user, isAuthenticated } = useAuth();

  const saveToHistory = async ({
    documentName,
    documentType,
    editedFields,
  }: SaveHistoryParams): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      const { error } = await supabase.from("editing_history").insert({
        user_id: user.id,
        document_name: documentName,
        document_type: documentType || null,
        edited_fields: editedFields || null,
      });

      if (error) {
        console.error("Failed to save editing history:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error saving editing history:", err);
      return false;
    }
  };

  return {
    saveToHistory,
    isAuthenticated,
  };
};
