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

interface EditRequest {
  imageBase64: string;
  mimeType: string;
  textEdits: TextEdit[];
  attempt?: number;
}

const buildEditPrompt = (edits: TextEdit[], attempt: number = 1): string => {
  const editInstructions = edits
    .map((edit, i) => `${i + 1}. Find "${edit.originalValue}" → Replace with "${edit.newValue}"`)
    .join('\n');

  // More detailed prompt for retry attempts
  const basePrompt = `You are a professional document image editor. Edit this official document with PRECISE text replacements:

TEXT CHANGES REQUIRED:
${editInstructions}

CRITICAL EDITING RULES:
1. FONT MATCHING: Use the EXACT same font family, weight, size, and color as the original text
2. POSITIONING: Keep text in the EXACT same position - do not shift or move anything
3. PRESERVATION: Keep ALL other elements unchanged:
   - Photos, stamps, watermarks, seals
   - Borders, lines, backgrounds
   - All other text not listed above
4. AUTHENTICITY: The result must look like an unaltered official document
5. QUALITY: Maintain the same image resolution and clarity`;

  if (attempt > 1) {
    return `${basePrompt}

IMPORTANT: This is attempt #${attempt}. Previous attempts may not have been perfect.
Please be EXTRA careful to:
- Match fonts EXACTLY (look at the thickness, spacing, and style)
- Place new text in the PRECISE location of the original
- Ensure no visual artifacts or blending issues
- The document must look completely authentic`;
  }

  return basePrompt;
};

const callAIGateway = async (
  imageBase64: string, 
  mimeType: string, 
  prompt: string,
  apiKey: string
): Promise<Response> => {
  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image-preview",
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
              text: prompt
            }
          ]
        }
      ],
      modalities: ["image", "text"]
    }),
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType, textEdits, attempt = 1 } = await req.json() as EditRequest;

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

    // Filter valid edits
    const validEdits = (textEdits as TextEdit[])
      .filter(edit => edit.originalValue !== edit.newValue && edit.newValue?.trim());
    
    if (validEdits.length === 0) {
      console.log("No edits needed, returning original image");
      return new Response(
        JSON.stringify({ 
          success: true, 
          editedImageBase64: imageBase64,
          editedImageUrl: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
          message: "No changes detected",
          editsApplied: []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Attempt ${attempt}: Applying ${validEdits.length} edits with google/gemini-3-pro-image-preview`);
    console.log("Edits:", validEdits.map(e => `"${e.originalValue}" → "${e.newValue}"`).join(", "));

    const prompt = buildEditPrompt(validEdits, attempt);
    const response = await callAIGateway(imageBase64, mimeType, prompt, LOVABLE_API_KEY);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again in a few moments.",
            canRetry: true 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "AI usage limit reached. Please add credits to continue.",
            canRetry: false
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ 
          error: "Failed to edit document", 
          details: errorText,
          canRetry: true
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received, extracting edited image...");
    
    // Extract the generated image from the response
    const images = data.choices?.[0]?.message?.images;
    const editedImageUrl = images?.[0]?.image_url?.url;
    
    if (!editedImageUrl) {
      console.error("No edited image in response. Full response:", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ 
          success: false, 
          editedImageBase64: imageBase64,
          editedImageUrl: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
          message: "AI could not generate edited image",
          canRetry: true,
          editsApplied: []
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
      finalUrl = `data:image/png;base64,${editedImageUrl}`;
      editedBase64 = editedImageUrl;
    }

    console.log(`Document editing complete on attempt ${attempt}. Edits applied:`, validEdits.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        editedImageBase64: editedBase64,
        editedImageUrl: finalUrl,
        editsApplied: validEdits.map(e => ({ 
          label: e.label, 
          from: e.originalValue, 
          to: e.newValue 
        })),
        attempt,
        message: `Successfully applied ${validEdits.length} edit(s)`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in edit-document:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        canRetry: true
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
