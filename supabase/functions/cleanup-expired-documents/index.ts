import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const authHeader = req.headers.get("Authorization") ?? "";
    if (authHeader !== `Bearer ${supabaseServiceKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting cleanup of expired documents...");

    // Get all expired documents
    const { data: expiredDocs, error: fetchError } = await supabase
      .from("document_uploads")
      .select("*")
      .lt("expires_at", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching expired documents:", fetchError);
      throw fetchError;
    }

    if (!expiredDocs || expiredDocs.length === 0) {
      console.log("No expired documents found");
      return new Response(
        JSON.stringify({ message: "No expired documents to clean up", deleted: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${expiredDocs.length} expired documents to delete`);

    let deletedCount = 0;
    const errors: string[] = [];

    // Delete each expired document from storage and database
    for (const doc of expiredDocs) {
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([doc.storage_path]);

        if (storageError) {
          console.error(`Error deleting file ${doc.storage_path}:`, storageError);
          errors.push(`Storage: ${doc.storage_path}`);
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from("document_uploads")
          .delete()
          .eq("id", doc.id);

        if (dbError) {
          console.error(`Error deleting record ${doc.id}:`, dbError);
          errors.push(`DB: ${doc.id}`);
        } else {
          deletedCount++;
        }
      } catch (err) {
        console.error(`Error processing document ${doc.id}:`, err);
        errors.push(doc.id);
      }
    }

    console.log(`Cleanup complete. Deleted ${deletedCount} documents.`);

    return new Response(
      JSON.stringify({ 
        message: "Cleanup complete", 
        deleted: deletedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
