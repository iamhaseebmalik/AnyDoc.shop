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
    const validEdits = (textEdits as TextEdit[])
      .filter(edit => edit.originalValue !== edit.newValue && edit.newValue);
    
    if (validEdits.length === 0) {
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

    const editInstructions = validEdits
      .map(edit => `Replace the text "${edit.originalValue}" with "${edit.newValue}"`)
      .join(". ");

    console.log("Applying document edits:", editInstructions);

    // Use the image editing model with the source image
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
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`
                }
              },
              {
                type: "text",
                text: `Edit this document image. ${editInstructions}. 
                
Keep the exact same document design, layout, colors, and formatting. Only modify the specified text fields while preserving everything else exactly as it appears in the original image.`
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
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
      return new Response(
        JSON.stringify({ error: "Failed to edit document", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received, checking for images...");
    
    // Extract the generated image from the response
    const images = data.choices?.[0]?.message?.images;
    const editedImageUrl = images?.[0]?.image_url?.url;
    
    if (!editedImageUrl) {
      console.error("No edited image in response. Full response:", JSON.stringify(data));
      // Return original image if editing fails
      return new Response(
        JSON.stringify({ 
          success: true, 
          editedImageBase64: imageBase64,
          editedImageUrl: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
          message: "AI could not generate edited image, returning original"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 from data URL if needed
    let editedBase64 = editedImageUrl;
    let finalUrl = editedImageUrl;
    
    const base64Match = editedImageUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
    if (base64Match) {
      editedBase64 = base64Match[1];
      finalUrl = editedImageUrl;
    } else {
      // If it's just base64 without data URL prefix
      finalUrl = `data:image/png;base64,${editedImageUrl}`;
      editedBase64 = editedImageUrl;
    }

    console.log("Document editing complete successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        editedImageBase64: editedBase64,
        editedImageUrl: finalUrl
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
