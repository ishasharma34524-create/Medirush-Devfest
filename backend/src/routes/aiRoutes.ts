import { Router } from "express";
import {
  getGenericAlternativesHandler,
  checkDrugInteractionsHandler,
  explainPrescriptionHandler,
} from "../controllers/aiController";

const router = Router();

// POST /api/ai/alternatives
router.post("/alternatives", getGenericAlternativesHandler);

// POST /api/ai/interactions
router.post("/interactions", checkDrugInteractionsHandler);

// POST /api/ai/explain
router.post("/explain", explainPrescriptionHandler);

export default router;
