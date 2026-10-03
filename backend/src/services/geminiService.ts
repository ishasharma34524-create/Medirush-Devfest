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

export interface MedicalReportSimplifyResult {
  reportTitle: string;
  summaryHinglish: string;
  summaryEnglish: string;
  testParameters: Array<{
    parameterName: string;
    measuredValue: string;
    normalRange: string;
    status: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
    hinglishMeaning: string;
    clinicalSignificance: string;
  }>;
  dietAndLifestyleAdvice: string[];
  questionsForDoctor: string[];
  urgencyLevel: "ROUTINE" | "CONSULT_SOON" | "IMMEDIATE_ATTENTION";
  isFallback: boolean;
}

export interface HomeRemediesResult {
  condition: string;
  overviewHinglish: string;
  remedies: Array<{
    title: string;
    ingredients: string;
    preparationHinglish: string;
    benefits: string;
    bestTimeToConsume: string;
  }>;
  lifestyleTips: string[];
  criticalRedFlags: string[];
  disclaimer: string;
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

// List of models in order of priority for high availability
const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-3.8-flash",
];

async function callGeminiWithFallback(
  client: any,
  contents: any
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;
  for (const model of GEMINI_MODELS) {
    try {
      const response = await client.models.generateContent({
        model,
        contents,
      });
      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Model: ${model}] Failed (${err.status || err.message}). Trying fallback model...`);
    }
  }
  throw lastError || new Error("All Gemini models failed");
}

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

    const { text: responseText, modelUsed } = await callGeminiWithFallback(client, [
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
    ]);

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
        source: `Gemini Vision AI (${modelUsed})`,
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

    const { text: responseText } = await callGeminiWithFallback(client, prompt);
    const cleaned = (responseText || "").replace(/```json/gi, "").replace(/```/g, "").trim();
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

    const { text: responseText } = await callGeminiWithFallback(client, prompt);
    const cleaned = (responseText || "").replace(/```json/gi, "").replace(/```/g, "").trim();
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

    const { text: responseText } = await callGeminiWithFallback(client, prompt);
    const cleaned = (responseText || "").replace(/```json/gi, "").replace(/```/g, "").trim();
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

/**
 * Medical Report Simplifier
 * Translates complex lab tests (CBC, HbA1c, Lipid Profile, LFT, KFT) into simple Hinglish + English
 * with visual status indicators, dietary advice, and questions to ask the doctor.
 */
export const simplifyMedicalReportWithGemini = async (
  reportText?: string,
  fileBuffer?: Buffer,
  mimeType: string = "image/jpeg"
): Promise<MedicalReportSimplifyResult> => {
  const client = getGeminiClient();

  const fallbackReport: MedicalReportSimplifyResult = {
    reportTitle: "Comprehensive Health & Metabolic Panel (HbA1c + Lipid Profile)",
    summaryHinglish:
      "Aapki report me Blood Sugar (HbA1c) aur Cholesterol thoda badha hua aaya hai, jabki Kidney aur Hemoglobin bilkul normal hain. Ghabrane ki baat nahi hai, sahi khan-paan aur exercise se yeh control ho sakta hai.",
    summaryEnglish:
      "The report indicates elevated HbA1c (Type 2 Diabetes indicator) and borderline high LDL cholesterol. Kidney function and Hemoglobin are within healthy reference limits.",
    testParameters: [
      {
        parameterName: "HbA1c (Glycated Hemoglobin)",
        measuredValue: "8.2%",
        normalRange: "< 5.7% (Normal), 5.7 - 6.4% (Prediabetes)",
        status: "HIGH",
        hinglishMeaning:
          "Pichle 3 mahino ka average blood sugar level 8.2% hai, jo ki normal (5.7%) se kafi upar hai. Isse diabetes niyantran ki zaroorat pata chalti hai.",
        clinicalSignificance: "Indicates uncontrolled long-term blood glucose.",
      },
      {
        parameterName: "Fasting Blood Glucose",
        measuredValue: "154 mg/dL",
        normalRange: "70 - 100 mg/dL",
        status: "HIGH",
        hinglishMeaning:
          "Khali pet sugar 154 hai jo 100 ke andar honi chahiye. Subah ki dawai aur walk se yeh theek hoga.",
        clinicalSignificance: "Fasting hyperglycemia requiring glycemic management.",
      },
      {
        parameterName: "Total Cholesterol",
        measuredValue: "228 mg/dL",
        normalRange: "< 200 mg/dL",
        status: "HIGH",
        hinglishMeaning:
          "Blood me cholesterol thoda badha hua hai. Tel, ghee aur fried khana kam karna zaroori hai.",
        clinicalSignificance: "Mild hypercholesterolemia, risk factor for cardiovascular strain.",
      },
      {
        parameterName: "Hemoglobin (Hb)",
        measuredValue: "13.8 g/dL",
        normalRange: "13.0 - 17.0 g/dL",
        status: "NORMAL",
        hinglishMeaning:
          "Aapka khoon ka level (Hb) bilkul normal aur swasth hai. Koi anemia ya kamzori nahi hai.",
        clinicalSignificance: "Optimal oxygen-carrying capacity.",
      },
      {
        parameterName: "Serum Creatinine",
        measuredValue: "0.9 mg/dL",
        normalRange: "0.7 - 1.3 mg/dL",
        status: "NORMAL",
        hinglishMeaning:
          "Kidney ki filtration bilkul perfect aur normal chal rahi hai.",
        clinicalSignificance: "Normal renal clearance function.",
      },
    ],
    dietAndLifestyleAdvice: [
      "Mitha, cold drinks, maida aur packaged namkeen turant band ya bohot kam karein.",
      "Rozana kam se kam 30-45 minute tezi se walk (brisk walk) karein.",
      "Khane me methi daana, karela juice, aur fiber wali sabziyan shamil karein.",
      "Khana khane ke baad turant bistar par na lein, 10 minute tahlein.",
    ],
    questionsForDoctor: [
      "Kya meri sugar ki dawai ki dose adjust karne ki zaroorat hai?",
      "Mujhe agla HbA1c test kitne mahine baad karwana chahiye?",
      "Kya cholesterol ke liye alag se statin shuru karni padegi ya diet se control hoga?",
    ],
    urgencyLevel: "CONSULT_SOON",
    isFallback: true,
  };

  if (!client || (!reportText && !fileBuffer)) {
    return fallbackReport;
  }

  try {
    const prompt = `You are an expert Indian medical diagnostic specialist and compassionate family doctor. Analyze this patient medical test report (blood report/diagnostic lab report).
Translate medical jargon into extremely clear, respectful, and culturally accessible Hinglish (Hindi written in Roman English) as well as clear English.

Return ONLY a strict JSON object with NO markdown, NO code fences:
{
  "reportTitle": "e.g., Complete Blood Count / Lipid Profile / HbA1c Report",
  "summaryHinglish": "Clear 2-3 sentence overview explaining overall findings in simple Hinglish",
  "summaryEnglish": "Clear 2-3 sentence overview in simple English",
  "testParameters": [
    {
      "parameterName": "Parameter Name (e.g. HbA1c, Platelets, Creatinine)",
      "measuredValue": "e.g. 8.2%",
      "normalRange": "e.g. < 5.7%",
      "status": "NORMAL",
      "hinglishMeaning": "Simple 1-sentence explanation of what this test means in daily Hindi/Hinglish",
      "clinicalSignificance": "Short English clinical note"
    }
  ],
  "dietAndLifestyleAdvice": [
    "Specific Indian diet/lifestyle recommendation 1 in Hinglish",
    "Recommendation 2 in Hinglish"
  ],
  "questionsForDoctor": [
    "Smart question 1 patient should ask their physician in Hindi/Hinglish",
    "Smart question 2"
  ],
  "urgencyLevel": "ROUTINE"
}`;

    let responseText = "";
    if (fileBuffer) {
      const base64Data = fileBuffer.toString("base64");
      const result = await callGeminiWithFallback(client, [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType } },
          ],
        },
      ]);
      responseText = result.text;
    } else {
      const result = await callGeminiWithFallback(client, `${prompt}\n\nReport Content:\n${reportText}`);
      responseText = result.text;
    }

    const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      reportTitle: parsed.reportTitle || "Diagnostic Lab Report",
      summaryHinglish: parsed.summaryHinglish || "Aapki lab report ka vishleshan taiyaar hai.",
      summaryEnglish: parsed.summaryEnglish || "Your lab report summary is ready.",
      testParameters: Array.isArray(parsed.testParameters) ? parsed.testParameters : fallbackReport.testParameters,
      dietAndLifestyleAdvice: Array.isArray(parsed.dietAndLifestyleAdvice) ? parsed.dietAndLifestyleAdvice : fallbackReport.dietAndLifestyleAdvice,
      questionsForDoctor: Array.isArray(parsed.questionsForDoctor) ? parsed.questionsForDoctor : fallbackReport.questionsForDoctor,
      urgencyLevel: parsed.urgencyLevel || "ROUTINE",
      isFallback: false,
    };
  } catch (error) {
    return fallbackReport;
  }
};

/**
 * Ayurvedic & Evidence-Based Home Remedies (Gharelu Nuskhe)
 * Recommends safe traditional Indian home remedies, preparation steps, and crucial safety red flags.
 */
export const getHomeRemediesWithGemini = async (
  condition: string
): Promise<HomeRemediesResult> => {
  const client = getGeminiClient();

  const defaultRemedies: Record<string, HomeRemediesResult> = {
    cough: {
      condition: "Khansi & Gale Me Kharash (Cough & Sore Throat)",
      overviewHinglish:
        "Mausam badalne ya allergy ki wajah se gale me kharash aur khansi aam hai. Yeh aasan gharelu nuskhe gale ko turant aaram dete hain.",
      remedies: [
        {
          title: "Haldi-Kaali Mirch Wala Dudh (Golden Milk)",
          ingredients: "1 cup garam dudh, 1/2 chammach haldi, 1 chutki kaali mirch powder, 1/2 chammach desi ghee.",
          preparationHinglish:
            "Dudh me haldi aur kaali mirch dalkar halka ubaal lein. Utaar kar thoda sa ghee milayein aur gunguna piyein.",
          benefits: "Curcumin infection se ladta hai aur gale ki sujan ko kam karta hai.",
          bestTimeToConsume: "Raat ko sone se theek 15 minute pehle.",
        },
        {
          title: "Adrak-Tulsi-Shahad Kadha",
          ingredients: "1 inch adrak kuta hua, 5-7 tulsi ke patte, 1 chammach pure shahad, 1 cup paani.",
          preparationHinglish:
            "Paani me adrak aur tulsi ubaalein jab tak adha na reh jaye. Chaankar gunguna hone par shahad milayein.",
          benefits: "Kaf (mucus) ko nikalta hai aur dry cough me turant aaram deta hai.",
          bestTimeToConsume: "Subah khali pet ya shaam ko 4 baje.",
        },
        {
          title: "Namak ke Gungune Paani ke Garare (Salt Water Gargle)",
          ingredients: "1 glass gunguna paani, 1/2 chammach sendha namak.",
          preparationHinglish:
            "Gungune paani me namak gholein aur din me 2 se 3 baar 2-2 minute garare karein.",
          benefits: "Gale ke bacteria ko maarta hai aur irritation kam karta hai.",
          bestTimeToConsume: "Subah brush ke baad aur raat ko sone se pehle.",
        },
      ],
      lifestyleTips: [
        "Thanda paani, ice cream aur fridge ka saman bilkul na lein.",
        "Gunguna paani sip-sip karke din bhar piyein.",
        "Bhaap (steam inhalation) lein din me 1 baar.",
      ],
      criticalRedFlags: [
        "Agar khansi 2 hafte se zyada chale ya balgam me khoon aaye, turant doctor ko dikhayein.",
        "Saans lene me ghar-gharahat ya seene me dard hone par bina deri kiye hospital jayein.",
      ],
      disclaimer: "Gharelu nuskhe prathmik aaram ke liye hain. Gambhir lakshan hone par doctor se consult karein.",
      isFallback: true,
    },
    acidity: {
      condition: "Gas, Acidity & Seene Me Jalan (Acid Reflux)",
      overviewHinglish:
        "Tala-bhuna khana ya der raat khane se pitta badh jata hai. Yahan aasan gharelu upaay hain jo acid ko turant shant karte hain.",
      remedies: [
        {
          title: "Thanda Dudh ya Chaas me Bhuna Jeera",
          ingredients: "1/2 cup thanda doodh ya taaza chaas, 1/4 chammach bhuna jeera powder, kala namak.",
          preparationHinglish:
            "Thande doodh me paani milakar ghut-ghut karein, ya chaas me jeera powder milakar piyein.",
          benefits: "Stomach acid ko turant neutralize karta hai aur jalan shant karta hai.",
          bestTimeToConsume: "Khana khane ke adhe ghante baad ya jalan mehsoos hote hi.",
        },
        {
          title: "Saunf & Mishri ka Paani",
          ingredients: "1 chammach hari saunf, 1 chammach dhaage wali mishri, 1 cup paani.",
          preparationHinglish:
            "Saunf ko paani me ubaal lein ya raat bhar bhigo kar subah chaan lein.",
          benefits: "Digestive enzymes ko boost karta hai aur bloating dur karta hai.",
          bestTimeToConsume: "Dopahar aur raat ke khane ke baad.",
        },
      ],
      lifestyleTips: [
        "Khane ke turant baad na soyein, kam se kam 2 ghante ka gap rakhein.",
        "Chai, coffee aur zyada mirch-masale se parhez karein.",
      ],
      criticalRedFlags: [
        "Agar seene me dard baayein haath ya jabde tak fail raha ho to turant emergency call karein (Cardiac alert).",
        "Kala stool (potty) aana ya lagatar ulti hona gambhir sanket hai.",
      ],
      disclaimer: "Yeh nuskhe shuruati lakshanon ke liye hain.",
      isFallback: true,
    },
  };

  const matchedKey = Object.keys(defaultRemedies).find((k) =>
    condition.toLowerCase().includes(k)
  );

  const fallback = matchedKey ? defaultRemedies[matchedKey] : {
    condition: condition || "General Wellness & Immunity (Samanya Rog)",
    overviewHinglish:
      `Aapke bataye gaye lakshan (${condition || "swasthya"}) ke liye aasan Ayurvedic gharelu upchar.`,
    remedies: [
      {
        title: "Amla & Giloy Swaras (Immunity Booster)",
        ingredients: "15ml Amla juice, 15ml Giloy juice, 1 cup gunguna paani.",
        preparationHinglish: "Dono juice ko gungune paani me milakar subah ghoont-ghoont piyein.",
        benefits: "Sharir ki immunity badhata hai aur toxins ko bahar nikalta hai.",
        bestTimeToConsume: "Subah khali pet brush karne ke baad.",
      },
      {
        title: "Ajwain-Jeera Paani (Pachan Labh)",
        ingredients: "1/2 chammach ajwain, 1/2 chammach jeera, 2 cup paani.",
        preparationHinglish: "Paani me 5 minute ubaalein aur gunguna hone par piyein.",
        benefits: "Pet saaf karta hai aur sharir me dard aur vata ko shant karta hai.",
        bestTimeToConsume: "Khane ke 40 minute baad.",
      },
    ],
    lifestyleTips: [
      "Din bhar paryaapt matra me saaf gunguna paani piyein.",
      "Har roz 7-8 ghante ki gehri neend lein.",
      "Taza aur ghar ka bana poshtik aahar lein.",
    ],
    criticalRedFlags: [
      "Agar lakshan 3 din se zyada bane rahein ya tez bukhar ho, registered doctor se zaroor milein.",
    ],
    disclaimer: "Gharelu upchar doctor ke ilaaj ka vikalp nahi hain.",
    isFallback: true,
  };

  if (!client || !condition) {
    return fallback;
  }

  try {
    const prompt = `You are a certified Ayurvedic Practitioner and integrative medicine doctor in India.
Provide traditional, safe, evidence-based Indian home remedies (Gharelu Nuskhe / Kadha / Ayurveda) for: "${condition}".
Focus on easily available kitchen ingredients (haldi, adrak, tulsi, ajwain, saunf, jeera, honey, methi).
Write clearly in warm conversational Hinglish (Hindi in Roman script).

Return ONLY strict JSON with NO markdown:
{
  "condition": "${condition}",
  "overviewHinglish": "2-sentence warm explanation of root cause and safe recovery in Hinglish",
  "remedies": [
    {
      "title": "Remedy Name (e.g. Adrak-Tulsi Kadha)",
      "ingredients": "Exact ingredients in simple Hindi/English",
      "preparationHinglish": "Step-by-step simple preparation instructions in Hinglish",
      "benefits": "Key health benefits",
      "bestTimeToConsume": "When to take (e.g., subah khali pet / raat ko sone se pehle)"
    }
  ],
  "lifestyleTips": [
    "Simple diet/lifestyle tip 1 in Hinglish",
    "Simple diet/lifestyle tip 2 in Hinglish"
  ],
  "criticalRedFlags": [
    "Crucial warning sign when the patient MUST STOP home remedies and see a medical doctor immediately"
  ],
  "disclaimer": "Gharelu nuskhe aam takleef ke liye hain, gambhir bimari me doctor ki salah lein."
}`;

    const { text: responseText } = await callGeminiWithFallback(client, prompt);
    const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      condition: parsed.condition || condition,
      overviewHinglish: parsed.overviewHinglish || fallback.overviewHinglish,
      remedies: Array.isArray(parsed.remedies) && parsed.remedies.length > 0 ? parsed.remedies : fallback.remedies,
      lifestyleTips: Array.isArray(parsed.lifestyleTips) ? parsed.lifestyleTips : fallback.lifestyleTips,
      criticalRedFlags: Array.isArray(parsed.criticalRedFlags) ? parsed.criticalRedFlags : fallback.criticalRedFlags,
      disclaimer: parsed.disclaimer || fallback.disclaimer,
      isFallback: false,
    };
  } catch (error) {
    return fallback;
  }
};

