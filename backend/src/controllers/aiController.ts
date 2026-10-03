import { Request, Response, NextFunction } from "express";
import {
  getGenericAlternativesWithGemini,
  checkDrugInteractionsWithGemini,
  explainPrescriptionInHinglish,
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
