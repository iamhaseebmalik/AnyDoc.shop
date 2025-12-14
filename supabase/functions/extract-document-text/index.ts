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

    console.log("Processing document for OCR extraction...");

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
            content: `You are an expert OCR system specialized in extracting text from passport and ID documents. 
            
Extract ALL text fields visible in the document and return them in a structured JSON format. 

For passport/ID documents, look for these common fields:
- Full Name (given name + surname)
- Nationality / Country
- Date of Birth
- Gender / Sex
- Document Number (Passport No., ID No., etc.)
- Issue Date
- Expiry Date
- Place of Birth
- Place of Issue
- MRZ (Machine Readable Zone) if visible

Return ONLY a valid JSON object with the extracted fields. Use null for fields that are not visible or readable.

Example output format:
{
  "documentType": "PASSPORT",
  "fullName": "JOHN DOE",
  "surname": "DOE",
  "givenNames": "JOHN",
  "nationality": "UNITED STATES",
  "dateOfBirth": "15 JAN 1990",
  "gender": "M",
  "documentNumber": "123456789",
  "issueDate": "01 FEB 2020",
  "expiryDate": "01 FEB 2030",
  "placeOfBirth": "NEW YORK",
  "placeOfIssue": "WASHINGTON D.C.",
  "mrz": ["P<USADOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<", "1234567890USA9001150M3002015<<<<<<<<<<<<<<00"]
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text fields from this passport/ID document. Return the data as a JSON object."
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

    // Parse the JSON response from the AI
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const jsonString = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extractedData = JSON.parse(jsonString);
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
