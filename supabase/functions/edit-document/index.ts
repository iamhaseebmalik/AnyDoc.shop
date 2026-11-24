import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  clearAiGatewayPause,
  getAiGatewayPause,
  pauseAiGateway,
  readAiGatewayFailure,
} from "../_shared/aiGatewayPause.ts";

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
  resumeAfterAccessRestored?: boolean;
}

const buildEditPrompt = (edits: TextEdit[], hasFacePhoto: boolean, attempt: number = 1): string => {
  const editInstructions = edits.length > 0
    ? edits.map((edit, i) => `${i + 1}. Find "${edit.originalValue}" → Replace with "${edit.newValue}"`).join('\n')
    : '';

  let prompt = `You are a professional document image editor. Edit this official ID document with the following changes:

`;

  if (hasFacePhoto) {
    prompt += `FACE PHOTO REPLACEMENT - MAKE IT LOOK LIKE A REAL PRINTED ID PHOTO:
The new face photo is the SECOND image provided. Replace the existing photo with it, but make it look like an ORIGINAL PRINTED ID PHOTO, NOT a digital overlay.

CRITICAL REALISM REQUIREMENTS:
1. SIZE & POSITION: Match the EXACT size, position, and boundaries of the original photo area
2. PRINT QUALITY: Apply subtle print texture/grain to match how photos look when printed on ID cards
3. COLOR GRADING: Adjust to typical ID photo colors - slightly desaturated, neutral tones, not overly vibrant
4. LIGHTING: Flatten the lighting to match standard ID photo lighting (even, front-lit, minimal shadows)
5. SKIN TONES: Normalize to look like a passport/ID photo (natural but not overly warm or cool)
6. EDGES: Integrate edges naturally - ID photos have clean edges that blend with the card
7. PHOTO BORDER: Maintain any existing photo borders, frames, or rounded corners from the original
8. BACKGROUND: If face has different background, blend it to match ID standards (plain, light colored)
9. TEXTURE MATCHING: The photo should have the same texture/quality as the rest of the document
10. NO DIGITAL ARTIFACTS: No sharp cutout edges, no obvious overlays, no mismatched lighting

The photo MUST look like it was ORIGINALLY PRINTED on this ID during manufacturing, not edited later.

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
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image",
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
    const {
      imageBase64,
      mimeType,
      textEdits,
      facePhotoBase64,
      attempt = 1,
      resumeAfterAccessRestored = false,
    } = await req.json() as EditRequest;

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

    if (resumeAfterAccessRestored) {
      await clearAiGatewayPause();
    } else {
      let pausedState;
      try {
        pausedState = await getAiGatewayPause();
      } catch {
        return new Response(
          JSON.stringify({ error: "AI availability could not be checked. Please try again later." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (pausedState) {
        return new Response(
          JSON.stringify({ error: pausedState.message, paused: true, canRetry: false }),
          { status: pausedState.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    console.log(`Attempt ${attempt}: Applying ${validEdits.length} text edits, face photo: ${hasFacePhoto}`);

    const prompt = buildEditPrompt(validEdits, hasFacePhoto, attempt);
    const response = await callAIGateway(imageBase64, mimeType, prompt, LOVABLE_API_KEY, facePhotoBase64);

    if (!response.ok) {
      const fallbackMessage = response.status === 402
        ? "AI usage limit reached. Please add credits to continue."
        : response.status === 403
          ? "AI access is blocked. Please restore access before retrying."
          : response.status === 429
            ? "Rate limit exceeded. Please try again later."
            : "Failed to edit document. Please try again.";
      const message = await readAiGatewayFailure(response, fallbackMessage);

      if (response.status === 402 || response.status === 403) {
        try {
          await pauseAiGateway(response.status, message);
        } catch {
          console.error("Could not persist the AI access pause");
        }
      }

      const responseHeaders: Record<string, string> = {
        ...corsHeaders,
        "Content-Type": "application/json",
      };
      const retryAfter = response.headers.get("Retry-After");
      if (retryAfter) responseHeaders["Retry-After"] = retryAfter;

      return new Response(
        JSON.stringify({
          error: message,
          paused: response.status === 402 || response.status === 403,
          canRetry: response.status === 429 || response.status >= 500,
        }),
        { status: response.status, headers: responseHeaders },
      );
    }

    const data = await response.json();
    console.log("AI response received, extracting edited image...");
    
    // Extract the generated image from the response
    const images = data.choices?.[0]?.message?.images;
    const editedImageUrl = images?.[0]?.image_url?.url;
    
    if (!editedImageUrl) {
      console.error("No edited image in response");
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
