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
  facePhotoBase64?: string;
  attempt?: number;
}

const buildEditPrompt = (edits: TextEdit[], hasFacePhoto: boolean, attempt: number = 1): string => {
  const editInstructions = edits.length > 0
    ? edits.map((edit, i) => `${i + 1}. Find "${edit.originalValue}" → Replace with "${edit.newValue}"`).join('\n')
    : '';

  let prompt = `You are a professional document image editor. Edit this official ID document with the following changes:

`;

  if (hasFacePhoto) {
    prompt += `FACE PHOTO REPLACEMENT:
- Replace the existing face/portrait photo in the document with the NEW face photo provided
- The new face photo is the SECOND image in this request
- Fit the new face naturally into the photo area, maintaining proper aspect ratio
- Match the lighting and style of the document
- Ensure the face photo looks authentic and professionally placed

`;
  }

  if (edits.length > 0) {
    prompt += `TEXT CHANGES REQUIRED:
${editInstructions}

`;
  }

  prompt += `CRITICAL OUTPUT REQUIREMENTS:
1. PRESERVE EXACT DIMENSIONS - Output MUST be the EXACT same width and height as the input image
2. DO NOT resize, shrink, or scale the document in any way
3. OUTPUT ONLY THE ID DOCUMENT - NO extra background, borders, shadows, or decorative elements
4. The output must be the ID card/document ONLY, cropped exactly to its edges
5. HIGH DEFINITION OUTPUT - Generate at the highest possible resolution and quality
6. Maintain sharp, crisp text and clear photo quality
7. Do NOT add any frame, background color, gradient, or padding around the document

EDITING RULES:
1. DIMENSIONS: Keep the EXACT same image dimensions as the original - same width, height, aspect ratio
2. FONT MATCHING: Use the EXACT same font family, weight, size, and color as the original text
3. POSITIONING: Keep text in the EXACT same position - do not shift or move anything
4. PRESERVATION: Keep ALL other elements unchanged:
   - Stamps, watermarks, seals, borders, lines, original document background
   - All other text not listed above
5. AUTHENTICITY: The result must look like an unaltered official document
6. QUALITY: Output in maximum resolution with sharp details`;

  if (attempt > 1) {
    prompt += `

IMPORTANT: This is attempt #${attempt}. Previous attempts may not have been perfect.
Please be EXTRA careful to:
- MAINTAIN EXACT ORIGINAL DIMENSIONS - same width, height, no resizing
- Output ONLY the ID document with NO extra background or borders
- Generate in HIGH DEFINITION with maximum clarity
- Match fonts EXACTLY (look at the thickness, spacing, and style)
- Place new text in the PRECISE location of the original
- Ensure the face photo blends seamlessly with the document
- Ensure no visual artifacts or blending issues
- The document must look completely authentic`;
  }

  return prompt;
};

const callAIGateway = async (
  imageBase64: string, 
  mimeType: string, 
  prompt: string,
  apiKey: string,
  facePhotoBase64?: string
): Promise<Response> => {
  // Build content array with document image first
  const content: Array<{ type: string; image_url?: { url: string }; text?: string }> = [
    {
      type: "image_url",
      image_url: {
        url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`
      }
    }
  ];

  // Add face photo as second image if provided
  if (facePhotoBase64) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${facePhotoBase64}`
      }
    });
  }

  // Add the prompt text
  content.push({
    type: "text",
    text: prompt
  });

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
          content
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
    const { imageBase64, mimeType, textEdits, facePhotoBase64, attempt = 1 } = await req.json() as EditRequest;

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
    const validEdits = (textEdits as TextEdit[] || [])
      .filter(edit => edit.originalValue !== edit.newValue && edit.newValue?.trim());
    
    const hasFacePhoto = !!facePhotoBase64;
    
    if (validEdits.length === 0 && !hasFacePhoto) {
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

    console.log(`Attempt ${attempt}: Applying ${validEdits.length} text edits, face photo: ${hasFacePhoto}`);
    if (validEdits.length > 0) {
      console.log("Text edits:", validEdits.map(e => `"${e.originalValue}" → "${e.newValue}"`).join(", "));
    }

    const prompt = buildEditPrompt(validEdits, hasFacePhoto, attempt);
    const response = await callAIGateway(imageBase64, mimeType, prompt, LOVABLE_API_KEY, facePhotoBase64);

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
