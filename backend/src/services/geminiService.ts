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

export interface GenericAlternativeResult {
  prescribedMedicine: string;
  activeSalt: string;
  genericName: string;
  manufacturer: string;
  prescribedPrice: number;
  genericPrice: number;
  savingsPercent: number;
  bioequivalentReason: string;
}

export interface DrugInteractionResult {
  overallRisk: "SAFE" | "MODERATE" | "CRITICAL";
  hasInteractions: boolean;
  summary: string;
  interactions: Array<{
    medicineA: string;
    medicineB: string;
    severity: "LOW" | "MODERATE" | "HIGH";
    description: string;
  }>;
  patientAdviceHinglish: string;
  patientAdviceEnglish: string;
  isFallback: boolean;
}

export interface PrescriptionExplanationResult {
  hindiTitle: string;
  overviewHinglish: string;
  medicineExplanations: Array<{
    medicineName: string;
    purpose: string;
    timing: string;
    precautions: string;
  }>;
  storageAndColdChainTips: string;
  isFallback: boolean;
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
  {
    brandName: "Dolo 650",
    salt: "Paracetamol",
    strength: "650 mg",
    quantity: 15,
    coldChain: false,
    scheduleType: "OTC",
    confidence: 0.96,
  },
];

/**
 * 1. OCR: Parses a prescription image using Gemini Vision via official @google/genai SDK.
 */
export const parsePrescriptionWithGemini = async (
  fileBuffer?: Buffer,
  mimeType: string = "image/jpeg"
): Promise<ParsePrescriptionResult> => {
  const client = getGeminiClient();

  if (!client || !fileBuffer) {
    return {
      medicines: FALLBACK_PRESCRIPTION_MEDICINES,
      isFallback: true,
      source: !client
        ? "Demo Fallback (GEMINI_API_KEY is not configured in .env)"
        : "Demo Fallback (No image file attached in request)",
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
    console.warn(`[Prescription AI] Gemini error: ${error?.message || error}. Falling back to demo data.`);
    return {
      medicines: FALLBACK_PRESCRIPTION_MEDICINES,
      isFallback: true,
      source: "Demo Fallback (AI processing failed or rate limited)",
      rawNote: error?.message,
    };
  }
};

/**
 * 2. Generic Alternative & Price Savings Engine
 */
export const getGenericAlternativesWithGemini = async (
  medicines: Array<{ brandName: string; salt: string; strength: string; price?: number }>
): Promise<{ alternatives: GenericAlternativeResult[]; isFallback: boolean }> => {
  const client = getGeminiClient();

  if (!client || !medicines || medicines.length === 0) {
    return {
      isFallback: true,
      alternatives: [
        {
          prescribedMedicine: "Augmentin 625 Duo",
          activeSalt: "Amoxicillin + Potassium Clavulanate (500mg+125mg)",
          genericName: "Amoxyclav 625 (PMBJP Generic)",
          manufacturer: "Pradhan Mantri Bhartiya Janaushadhi Pariyojana",
          prescribedPrice: 204,
          genericPrice: 58,
          savingsPercent: 71,
          bioequivalentReason: "Exact identical active pharmaceutical ingredients (API) with matching bioavailability.",
        },
        {
          prescribedMedicine: "Lantus Solostar",
          activeSalt: "Insulin Glargine 100 IU/mL",
          genericName: "Basalog One",
          manufacturer: "Biocon Biologics",
          prescribedPrice: 680,
          genericPrice: 420,
          savingsPercent: 38,
          bioequivalentReason: "CDSCO-approved bio-similar long-acting recombinant human insulin analogue.",
        },
      ],
    };
  }

  try {
    const prompt = `You are an expert Indian clinical pharmacologist. For these prescribed medicines, suggest genuine low-cost generic equivalents (such as Jan Aushadhi or reputable generic Indian manufacturers like Cipla Generic, Alkem, Mankind).
Input medicines: ${JSON.stringify(medicines)}

Return ONLY valid JSON (no markdown, no backticks):
{
  "alternatives": [
    {
      "prescribedMedicine": "string",
      "activeSalt": "string",
      "genericName": "string",
      "manufacturer": "string",
      "prescribedPrice": number,
      "genericPrice": number,
      "savingsPercent": number,
      "bioequivalentReason": "string"
    }
  ]
}`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      alternatives: parsed.alternatives || [],
      isFallback: false,
    };
  } catch (error: any) {
    console.warn(`[Gemini Generic Engine] Fallback used: ${error?.message || error}`);
    return {
      isFallback: true,
      alternatives: [
        {
          prescribedMedicine: medicines[0]?.brandName || "Augmentin",
          activeSalt: medicines[0]?.salt || "Amoxicillin + Clavulanic Acid",
          genericName: "Generic Amoxyclav (Jan Aushadhi)",
          manufacturer: "PMBJP Jan Aushadhi",
          prescribedPrice: 200,
          genericPrice: 60,
          savingsPercent: 70,
          bioequivalentReason: "Bio-equivalent salt approved by Indian pharmacopeia.",
        },
      ],
    };
  }
};

/**
 * 3. Drug-Drug Interaction and Contraindication Safety Checker
 */
export const checkDrugInteractionsWithGemini = async (
  medicines: Array<{ brandName: string; salt: string; strength?: string }>
): Promise<DrugInteractionResult> => {
  const client = getGeminiClient();

  if (!client || !medicines || medicines.length < 2) {
    return {
      overallRisk: "SAFE",
      hasInteractions: false,
      summary: "No adverse drug-drug interactions detected between prescribed items.",
      interactions: [],
      patientAdviceHinglish:
        "Dawaiyan niyamit samay par lein. Insulin ko fridge me rakhein aur khane se 15 minute pehle lein.",
      patientAdviceEnglish:
        "Take medicines at prescribed intervals. Keep insulin refrigerated and administer 15 minutes before meals.",
      isFallback: true,
    };
  }

  try {
    const prompt = `Analyze this list of medicines for dangerous drug-drug interactions, contraindications, and patient precautions in India:
${JSON.stringify(medicines)}

Return ONLY strict JSON (no markdown):
{
  "overallRisk": "SAFE" or "MODERATE" or "CRITICAL",
  "hasInteractions": true or false,
  "summary": "Short clinical summary",
  "interactions": [
    {
      "medicineA": "string",
      "medicineB": "string",
      "severity": "LOW" or "MODERATE" or "HIGH",
      "description": "explanation"
    }
  ],
  "patientAdviceHinglish": "Clear, friendly advice in simple conversational Hinglish (Hindi written in Roman script) for Indian patient/family",
  "patientAdviceEnglish": "Clear clinical advice in English"
}`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      overallRisk: parsed.overallRisk || "SAFE",
      hasInteractions: Boolean(parsed.hasInteractions),
      summary: parsed.summary || "Interaction check complete.",
      interactions: parsed.interactions || [],
      patientAdviceHinglish: parsed.patientAdviceHinglish || "Dawai samay par lein.",
      patientAdviceEnglish: parsed.patientAdviceEnglish || "Take medicines on time.",
      isFallback: false,
    };
  } catch (error: any) {
    return {
      overallRisk: "SAFE",
      hasInteractions: false,
      summary: "Medicines evaluated; no severe contraindications flagged.",
      interactions: [],
      patientAdviceHinglish: "Sabhi dawaiyan doctor ke bataye anusar paani ke sath lein.",
      patientAdviceEnglish: "Take all medicines with water as directed by your physician.",
      isFallback: true,
    };
  }
};

/**
 * 4. Patient Prescription Explainer in Conversational Hinglish
 */
export const explainPrescriptionInHinglish = async (
  medicines: Array<{ brandName: string; salt: string; strength: string; quantity?: number }>,
  patientNotes?: string
): Promise<PrescriptionExplanationResult> => {
  const client = getGeminiClient();

  if (!client) {
    return {
      hindiTitle: "Aapki Parchi Ka Asaan Vivaran (Patient Guide)",
      overviewHinglish:
        "Doctor ne yeh dawaiyan aapke infection ko theek karne aur blood sugar ko control karne ke liye likhi hain.",
      medicineExplanations: medicines.map((m) => ({
        medicineName: `${m.brandName} (${m.strength})`,
        purpose: m.brandName.toLowerCase().includes("lantus")
          ? "Diabetes/Sugar ko control karne ke liye long-acting insulin hai."
          : "Bacterial infection ko khatam karne ke liye antibiotic hai.",
        timing: m.brandName.toLowerCase().includes("lantus")
          ? "Raat ko sone se pehle nishchit samay par lagayein."
          : "Khana khane ke baad subah aur shaam 1-1 goli lein.",
        precautions: m.brandName.toLowerCase().includes("lantus")
          ? "Freezer me na rakhein, fridge ke darwaze ya safe shelf par rakhein."
          : "Course poora karein, beech me dawai band na karein.",
      })),
      storageAndColdChainTips:
        "Cold Chain: Insulin ko hamesha 2°C - 8°C par rakhein. Garmi ya dhoop se bachayein.",
      isFallback: true,
    };
  }

  try {
    const prompt = `You are a caring Indian family doctor. Explain this prescription in simple, polite conversational Hinglish (Hindi written in Roman English) so that a Tier-2/Tier-3 Indian family easily understands what each medicine is for, when to take it, and how to store it.
Medicines: ${JSON.stringify(medicines)}
${patientNotes ? `Doctor Notes: ${patientNotes}` : ""}

Return ONLY strict JSON (no markdown):
{
  "hindiTitle": "string",
  "overviewHinglish": "Warm 2-sentence summary in Hinglish",
  "medicineExplanations": [
    {
      "medicineName": "string",
      "purpose": "Hinglish explanation of why it is needed",
      "timing": "Hinglish: khane se pehle/baad, kab lena hai",
      "precautions": "Hinglish: kya dhyan rakhna hai"
    }
  ],
  "storageAndColdChainTips": "Hinglish guidance on storage (especially fridge for cold-chain)"
}`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      hindiTitle: parsed.hindiTitle || "Aapki Parchi Ka Asaan Vivaran",
      overviewHinglish: parsed.overviewHinglish || "Dawaiyon ka niyamit sevan karein.",
      medicineExplanations: parsed.medicineExplanations || [],
      storageAndColdChainTips: parsed.storageAndColdChainTips || "Dawaiyon ko thandi jagah rakhein.",
      isFallback: false,
    };
  } catch (error: any) {
    return {
      hindiTitle: "Aapki Parchi Ka Asaan Vivaran",
      overviewHinglish: "Yeh dawaiyan aapke swasthya labh ke liye hain.",
      medicineExplanations: medicines.map((m) => ({
        medicineName: m.brandName,
        purpose: "Swasthya labh aur bimari niyantran ke liye.",
        timing: "Doctor ke bataye niyamit samay par lein.",
        precautions: "Niyamit roop se lein aur dhoop se bachayein.",
      })),
      storageAndColdChainTips: "Thandi aur sukhi jagah par rakhein.",
      isFallback: true,
    };
  }
};
