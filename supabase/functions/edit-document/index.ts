import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TextEdit {
  label: string;
  originalValue: string;
  newValue: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType, textEdits } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the edit instruction based on text changes
    const editInstructions = (textEdits as TextEdit[])
      .filter(edit => edit.originalValue !== edit.newValue && edit.newValue)
      .map(edit => `Change "${edit.label}" from "${edit.originalValue}" to "${edit.newValue}"`)
      .join(". ");

    if (!editInstructions) {
      console.log("No edits needed, returning original image");
      return new Response(
        JSON.stringify({ 
          success: true, 
          editedImageBase64: imageBase64,
          message: "No changes detected"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Applying document edits:", editInstructions);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Edit this passport/ID document image by making the following text changes: ${editInstructions}. 
                
IMPORTANT RULES:
- Keep the exact same document layout, design, and format
- Only change the text values specified above
- Maintain the same font style, size, and positioning
- Keep all other elements (photo, borders, logos) exactly the same
- The result should look like an authentic document with the new text values`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to edit document" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Extract the generated image from the response
    const editedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!editedImageUrl) {
      console.error("No edited image in response");
      // Return original image if editing fails
      return new Response(
        JSON.stringify({ 
          success: true, 
          editedImageBase64: imageBase64,
          message: "Could not apply edits, returning original"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 from data URL
    const base64Match = editedImageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
    const editedBase64 = base64Match ? base64Match[1] : editedImageUrl;

    console.log("Document editing complete");

    return new Response(
      JSON.stringify({ 
        success: true, 
        editedImageBase64: editedBase64,
        editedImageUrl: editedImageUrl
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in edit-document:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
