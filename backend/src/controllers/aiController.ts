import { Request, Response, NextFunction } from "express";
import {
  getGenericAlternativesWithGemini,
  checkDrugInteractionsWithGemini,
  explainPrescriptionInHinglish,
  simplifyMedicalReportWithGemini,
  getHomeRemediesWithGemini,
} from "../services/geminiService";

/**
 * Controller for POST /api/ai/alternatives
 * Evaluates generic equivalents (Jan Aushadhi) and projected cost savings.
 */
export const getGenericAlternativesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const medicines = req.body.medicines || [];
    const result = await getGenericAlternativesWithGemini(medicines);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for POST /api/ai/interactions
 * Checks for drug-drug interactions and safety precautions.
 */
export const checkDrugInteractionsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const medicines = req.body.medicines || [];
    const result = await checkDrugInteractionsWithGemini(medicines);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for POST /api/ai/explain
 * Provides culturally aware, easy-to-understand Hinglish patient counseling.
 */
export const explainPrescriptionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const medicines = req.body.medicines || [];
    const patientNotes = req.body.patientNotes;
    const result = await explainPrescriptionInHinglish(medicines, patientNotes);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for POST /api/ai/simplify-report
 * Analyzes lab report (text or uploaded image) and provides simple Hinglish breakdown.
 */
export const simplifyReportHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reportText = req.body.reportText;
    const fileBuffer = req.file?.buffer;
    const mimeType = req.file?.mimetype || "image/jpeg";

    const result = await simplifyMedicalReportWithGemini(reportText, fileBuffer, mimeType);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for POST /api/ai/home-remedies
 * Fetches traditional Ayurvedic and home remedies with preparation and red flags.
 */
export const getHomeRemediesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const condition = req.body.condition || "cough";
    const result = await getHomeRemediesWithGemini(condition);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

