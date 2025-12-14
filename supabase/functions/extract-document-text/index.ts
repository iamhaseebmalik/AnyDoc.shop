import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

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
            content: `You are an expert OCR system specialized in extracting ALL text from passport, ID cards, driving licenses, and other identity documents.

Your task is to extract EVERY piece of text visible in the document. Be extremely thorough.

Extract and return ALL of the following fields (use null if not visible):

PERSONAL INFORMATION:
- surname (family name / last name)
- givenNames (first name / middle names)
- fullName (complete name as shown)
- dateOfBirth (in original format shown)
- placeOfBirth (city/country of birth)
- gender (M/F/Male/Female as shown)
- nationality (country of citizenship)
- nationalityCode (country code like USA, GBR, etc.)

DOCUMENT DETAILS:
- documentType (PASSPORT, ID CARD, DRIVING LICENSE, etc.)
- documentNumber (passport number, ID number, license number)
- issueDate (date document was issued)
- expiryDate (expiration date)
- placeOfIssue (issuing authority/location)
- issuingAuthority (who issued the document)
- issuingCountry (country that issued document)

ADDITIONAL FIELDS:
- address (if shown on document)
- height (if shown)
- eyeColor (if shown)
- signature (text near signature if any)
- licenseClass (for driving licenses)
- restrictions (for driving licenses)
- bloodType (if shown)
- emergencyContact (if shown)
- fatherName (if shown)
- motherName (if shown)
- spouseName (if shown)
- occupation (if shown)
- maritalStatus (if shown)

MACHINE READABLE ZONE:
- mrz (array of MRZ lines if visible at bottom of document)

ADDITIONAL TEXT:
- additionalFields (array of any other text fields found with format: [{label: "Field Name", value: "Field Value"}])

Return ONLY a valid JSON object. Extract the EXACT text as it appears on the document.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract ALL text fields from this identity document. Be thorough and extract every visible piece of text. Return as a comprehensive JSON object with all fields."
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
        JSON.stringify({ error: "Failed to process document" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
