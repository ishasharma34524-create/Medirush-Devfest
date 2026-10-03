import { Request, Response, NextFunction } from "express";
import { parsePrescriptionWithGemini } from "../services/geminiService";
import { Prescription } from "../models/Prescription";

/**
 * Controller to handle POST /api/prescriptions/parse.
 * Accepts uploaded prescription image, calls Gemini Vision OCR,
 * and falls back safely to demo data if the API key is missing or fails.
 */
export const parsePrescriptionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;
    const patientId = (req.body.patientId as string) || "patient_demo_101";

    // Call resilient Gemini vision service (guaranteed not to throw/crash)
    const result = await parsePrescriptionWithGemini(file?.buffer, file?.mimetype);

    // Persist parsed prescription to MongoDB
    let prescriptionId = "";
    try {
      const prescriptionDoc = new Prescription({
        patientId,
        image: file ? `uploaded_${Date.now()}_${file.originalname}` : "demo_prescription.jpg",
        medicines: result.medicines,
        aiConfidence: result.medicines[0]?.confidence || 0.94,
        doctorVerified: false,
      });
      const saved = await prescriptionDoc.save();
      prescriptionId = saved._id.toString();
    } catch (dbErr) {
      console.warn("[Prescription Controller] Optional DB log skipped:", dbErr);
    }

    // Return strict structured medicines JSON as required
    res.status(200).json({
      success: true,
      prescriptionId: prescriptionId || undefined,
      isFallback: result.isFallback,
      source: result.source,
      medicines: result.medicines,
    });
  } catch (error) {
    next(error);
  }
};
