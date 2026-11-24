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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType, resumeAfterAccessRestored = false } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing document for comprehensive OCR extraction...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a highly accurate OCR system. Your ONLY task is to extract EVERY piece of visible text from identity documents (passports, ID cards, driving licenses).

CRITICAL INSTRUCTIONS:
1. Read EVERY text element visible on the document - labels AND their values
2. Extract the EXACT text as shown - do not translate, correct, or modify anything
3. Include ALL text: headers, labels, values, codes, dates, numbers, stamps, watermarks
4. For each piece of text, identify what it represents

Return a JSON object with these fields. Use null for fields not visible:

{
  "allDetectedText": [
    {"label": "LABEL_AS_SHOWN", "value": "VALUE_AS_SHOWN", "position": "top/middle/bottom/left/right"}
  ],
  "documentType": "PASSPORT/ID CARD/DRIVING LICENSE/etc",
  "surname": "exact surname text",
  "givenNames": "exact given names text", 
  "fullName": "full name if shown as single field",
  "dateOfBirth": "exact date format shown",
  "placeOfBirth": "exact place text",
  "gender": "M/F/MALE/FEMALE as shown",
  "nationality": "exact nationality text",
  "nationalityCode": "country code if shown",
  "documentNumber": "exact document number",
  "issueDate": "exact issue date",
  "expiryDate": "exact expiry date",
  "placeOfIssue": "exact place of issue",
  "issuingAuthority": "issuing authority text",
  "issuingCountry": "country name",
  "address": "full address if shown",
  "height": "height if shown",
  "eyeColor": "eye color if shown",
  "bloodType": "blood type if shown",
  "licenseClass": "license class/category",
  "restrictions": "restrictions if shown",
  "fatherName": "father name if shown",
  "motherName": "mother name if shown",
  "spouseName": "spouse name if shown",
  "occupation": "occupation if shown",
  "maritalStatus": "marital status if shown",
  "mrz": ["MRZ_LINE_1", "MRZ_LINE_2", "MRZ_LINE_3"],
  "additionalFields": [{"label": "Other Field Label", "value": "Other Field Value"}]
}

The "allDetectedText" array is MANDATORY - it must contain EVERY text element you can see.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract EVERY piece of text visible on this document. Read all labels, values, codes, dates, and numbers. Be extremely thorough - I need to see all text to choose which fields to edit."
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
      }),
    });

    if (!response.ok) {
      const fallbackMessage = response.status === 402
        ? "AI usage limit reached. Please add credits to continue."
        : response.status === 403
          ? "AI access is blocked. Please restore access before retrying."
          : response.status === 429
            ? "Rate limit exceeded. Please try again later."
            : "AI document extraction failed. Please try again.";
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
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No text extracted from document" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Raw AI response:", content.substring(0, 500));

    // Parse the JSON response from the AI
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const jsonString = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extractedData = JSON.parse(jsonString);
      console.log("Successfully parsed extracted data with", Object.keys(extractedData).length, "fields");
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return raw content if parsing fails
      extractedData = { rawText: content };
    }

    console.log("Document text extraction complete");

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in extract-document-text:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
