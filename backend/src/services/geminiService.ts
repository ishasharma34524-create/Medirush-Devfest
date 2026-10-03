import { getGeminiClient } from "../config/gemini";

export interface ExtractedMedicine {
  brandName: string;
  salt: string;
  strength: string;
  quantity: number;
  coldChain: boolean;
  scheduleType: string;
  confidence: number;
}

export interface ParsePrescriptionResult {
  medicines: ExtractedMedicine[];
  isFallback: boolean;
  source: string;
  rawNote?: string;
}

// Realistic Tier-2/Tier-3 Indian city emergency prescription fallback
export const FALLBACK_PRESCRIPTION_MEDICINES: ExtractedMedicine[] = [
  {
    brandName: "Lantus",
    salt: "Insulin Glargine",
    strength: "100 IU/mL",
    quantity: 1,
    coldChain: true,
    scheduleType: "H",
    confidence: 0.94,
  },
  {
    brandName: "Augmentin",
    salt: "Amoxicillin + Clavulanic Acid",
    strength: "625 mg",
    quantity: 10,
    coldChain: false,
    scheduleType: "H",
    confidence: 0.91,
  },
];

/**
 * Parses a prescription image using Gemini Vision via the official @google/genai SDK.
 * Implements strict fault tolerance for demo resilience:
 * Returns realistic fallback data if Gemini API key is missing, network is down, or OCR fails.
 */
export const parsePrescriptionWithGemini = async (
  fileBuffer?: Buffer,
  mimeType: string = "image/jpeg"
): Promise<ParsePrescriptionResult> => {
  const client = getGeminiClient();

  // If API key is not configured, safely return documented fallback
  if (!client) {
    return {
      medicines: FALLBACK_PRESCRIPTION_MEDICINES,
      isFallback: true,
      source: "Demo Fallback (GEMINI_API_KEY is not configured in .env)",
    };
  }

  // If no image file provided
  if (!fileBuffer) {
    return {
      medicines: FALLBACK_PRESCRIPTION_MEDICINES,
      isFallback: true,
      source: "Demo Fallback (No image file attached in request)",
    };
  }

  try {
    const prompt = `You are a medical OCR specialist. Analyze this doctor's prescription image.
Extract all prescribed medicines into a strict JSON object with NO markdown formatting, NO backticks, and NO commentary.
JSON Structure:
{
  "medicines": [
    {
      "brandName": "Brand Name or Medicine Name",
      "salt": "Active chemical constituent/salt",
      "strength": "e.g., 500mg, 100 IU/mL, 650mg",
      "quantity": 1,
      "coldChain": true or false,
      "scheduleType": "H" or "H1" or "X" or "OTC",
      "confidence": 0.95
    }
  ]
}`;

    const base64Data = fileBuffer.toString("base64");

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
          ],
        },
      ],
    });

    const responseText = response.text || "";

    // Clean any markdown formatting if present
    const cleanedText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    if (parsed && Array.isArray(parsed.medicines) && parsed.medicines.length > 0) {
      return {
        medicines: parsed.medicines.map((m: any) => ({
          brandName: String(m.brandName || "Unknown Medicine"),
          salt: String(m.salt || "Active Salt"),
          strength: String(m.strength || "Standard"),
          quantity: Number(m.quantity) || 1,
          coldChain: Boolean(m.coldChain),
          scheduleType: String(m.scheduleType || "H"),
          confidence: Number(m.confidence) || 0.9,
        })),
        isFallback: false,
        source: "Gemini Vision AI (@google/genai)",
      };
    }

    throw new Error("Invalid structure returned by Gemini");
  } catch (error: any) {
    console.warn(
      `[Prescription AI] Gemini processing encountered an error: ${error?.message || error}. Falling back to demo data.`
    );
    return {
      medicines: FALLBACK_PRESCRIPTION_MEDICINES,
      isFallback: true,
      source: "Demo Fallback (AI processing failed or rate limited)",
      rawNote: error?.message,
    };
  }
};
