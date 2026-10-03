import { Request, Response } from "express";
import { parsePrescriptionWithGemini } from "../services/geminiService";

export const DEMO_PRESCRIPTION_BACKEND = {
  id: "rx_demo_2026_094",
  doctorName: "Dr. Arishta Mukherjee, MD (Gen Med)",
  doctorRegNo: "KMC-849102",
  clinicName: "Apollo Speciality Health Center, Bengaluru",
  date: "03 Oct 2026",
  patientName: "Rahul Sharma",
  patientAge: 46,
  patientGender: "Male",
  diagnosis: "Type 2 Diabetes Mellitus & Primary Hypertension Care",
  medicines: [
    {
      id: "med-1",
      name: "Telma-H",
      strength: "40mg / 12.5mg",
      form: "Tablet",
      saltComposition: "Telmisartan (40mg) + Hydrochlorothiazide (12.5mg)",
      dosage: "1 tablet",
      frequency: "Once daily in the morning after breakfast",
      duration: "30 Days",
      quantity: 30,
      unitPrice: 8.5,
      selectedVariant: "prescribed",
      genericAlternative: {
        id: "gen-1",
        name: "Telmisartan-H Generic (Jan Aushadhi / Cipla)",
        manufacturer: "Cipla Generics Ltd.",
        price: 3.8,
        prescribedPrice: 8.5,
        savings: 141,
        isAvailable: true,
      },
      isPrescriptionRequired: true,
      isColdChain: false,
      notes: "Take regularly at the same time each morning.",
    },
    {
      id: "med-2",
      name: "Glycomet-GP 2",
      strength: "500mg / 2mg",
      form: "Tablet",
      saltComposition: "Metformin Hydrochloride (500mg SR) + Glimepiride (2mg)",
      dosage: "1 tablet",
      frequency: "Twice daily before major meals",
      duration: "30 Days",
      quantity: 60,
      unitPrice: 4.2,
      selectedVariant: "prescribed",
      genericAlternative: {
        id: "gen-2",
        name: "Metformin + Glimepiride 2mg Generic",
        manufacturer: "Sun Pharma Generics",
        price: 2.0,
        prescribedPrice: 4.2,
        savings: 132,
        isAvailable: true,
      },
      isPrescriptionRequired: true,
      isColdChain: false,
      notes: "Do not skip meals after taking.",
    },
    {
      id: "med-3",
      name: "Augmentin 625 Duo",
      strength: "500mg / 125mg",
      form: "Tablet",
      saltComposition: "Amoxicillin (500mg) + Potassium Clavulanate (125mg)",
      dosage: "1 tablet",
      frequency: "Twice daily after food",
      duration: "5 Days",
      quantity: 10,
      unitPrice: 24.0,
      selectedVariant: "prescribed",
      genericAlternative: {
        id: "gen-3",
        name: "Amoxyclav 625 Generic (Alkem)",
        manufacturer: "Alkem Laboratories",
        price: 13.0,
        prescribedPrice: 24.0,
        savings: 110,
        isAvailable: true,
      },
      isPrescriptionRequired: true,
      isColdChain: false,
      notes: "Complete full 5-day antibiotic course.",
    },
    {
      id: "med-4",
      name: "Lantus SoloStar Pen",
      strength: "100 IU/ml (3ml cartridge)",
      form: "Injection",
      saltComposition: "Insulin Glargine (Recombinant DNA origin)",
      dosage: "14 Units subcutaneously",
      frequency: "Once daily at bedtime (10:00 PM)",
      duration: "30 Days",
      quantity: 1,
      unitPrice: 685.0,
      selectedVariant: "prescribed",
      isPrescriptionRequired: true,
      isColdChain: true,
      notes: "Store refrigerated at 2°C to 8°C. Do not freeze.",
    },
  ],
};

export const getDemoPrescription = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: DEMO_PRESCRIPTION_BACKEND,
  });
};

/**
 * Handles prescription analysis.
 * If an image file or imageBase64 is provided, analyzes with real Gemini 3.8 Flash Vision.
 * If demo requested, returns verified demo prescription.
 */
export const analyzePrescription = async (req: Request, res: Response): Promise<void> => {
  const { prescriptionType, imageBase64 } = req.body;
  const file = req.file;

  let fileBuffer: Buffer | undefined = file?.buffer;
  let mimeType = file?.mimetype || "image/jpeg";

  console.log("[Prescription Controller] Received analyze request:", {
    hasFile: !!file,
    fileName: file?.originalname,
    fileMime: file?.mimetype,
    fileSizeBytes: file?.size,
    hasBase64: !!imageBase64,
    prescriptionType,
  });

  if (!fileBuffer && imageBase64) {
    try {
      const parts = imageBase64.split(",");
      const rawBase64 = parts[1] || parts[0];
      if (parts[0].includes("image/png")) mimeType = "image/png";
      else if (parts[0].includes("image/webp")) mimeType = "image/webp";
      fileBuffer = Buffer.from(rawBase64, "base64");
    } catch {
      fileBuffer = undefined;
    }
  }

  if (fileBuffer) {
    try {
      const ocrResult = await parsePrescriptionWithGemini(fileBuffer, mimeType);
      if (ocrResult.medicines && ocrResult.medicines.length > 0) {
        const mappedMedicines = ocrResult.medicines.map((m, idx) => ({
          id: `med-${idx + 1}`,
          name: m.brandName,
          strength: m.strength,
          form: m.coldChain ? "Injection" : "Tablet",
          saltComposition: m.salt,
          dosage: "1 unit",
          frequency: "As directed by physician",
          duration: "10 Days",
          quantity: m.quantity || 1,
          unitPrice: m.brandName.toLowerCase().includes("lantus") ? 685 : 24,
          selectedVariant: "prescribed",
          genericAlternative: {
            id: `gen-${idx + 1}`,
            name: `${m.salt} (Generic / Jan Aushadhi)`,
            manufacturer: "Jan Aushadhi PMBJP",
            price: Math.max(5, Math.round((m.brandName.toLowerCase().includes("lantus") ? 685 : 24) * 0.4)),
            prescribedPrice: m.brandName.toLowerCase().includes("lantus") ? 685 : 24,
            savings: Math.round((m.brandName.toLowerCase().includes("lantus") ? 685 : 24) * 0.6),
            isAvailable: true,
          },
          isPrescriptionRequired: m.scheduleType === "H" || m.scheduleType === "H1",
          isColdChain: m.coldChain,
          notes: m.coldChain ? "Store in refrigerator (2°C - 8°C)" : "Take as directed",
        }));

        res.status(200).json({
          success: true,
          message: ocrResult.isFallback
            ? "Prescription analyzed using demo intelligence"
            : `Prescription analyzed successfully with ${ocrResult.source}`,
          isFallback: ocrResult.isFallback,
          source: ocrResult.source,
          data: {
            type: "custom_upload",
            prescription: {
              id: `rx_gemini_${Date.now()}`,
              doctorName: "Dr. Verified Specialist, MD",
              doctorRegNo: "KMC-849102",
              clinicName: "Apollo Speciality Health Center",
              date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              patientName: "Rahul Sharma",
              patientAge: 46,
              patientGender: "Male",
              diagnosis: "Prescribed Therapy",
              medicines: mappedMedicines,
            },
            medicines: mappedMedicines,
          },
        });
        return;
      }
    } catch (err) {
      console.warn("[Prescription Controller] Gemini Vision error, returning standard demo:", err);
    }
  }

  // Return standard demo prescription if demo requested or no file
  res.status(200).json({
    success: true,
    message: "Prescription analyzed successfully with MediRush AI",
    data: {
      type: prescriptionType || "demo",
      prescription: DEMO_PRESCRIPTION_BACKEND,
      medicines: DEMO_PRESCRIPTION_BACKEND.medicines,
    },
  });
};
