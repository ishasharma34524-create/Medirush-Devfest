import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware";
import {
  getGenericAlternativesHandler,
  checkDrugInteractionsHandler,
  explainPrescriptionHandler,
  simplifyReportHandler,
  getHomeRemediesHandler,
} from "../controllers/aiController";

const router = Router();

// POST /api/ai/alternatives
router.post("/alternatives", getGenericAlternativesHandler);

// POST /api/ai/interactions
router.post("/interactions", checkDrugInteractionsHandler);

// POST /api/ai/explain
router.post("/explain", explainPrescriptionHandler);

// POST /api/ai/simplify-report
router.post("/simplify-report", upload.single("image"), simplifyReportHandler);

// POST /api/ai/home-remedies
router.post("/home-remedies", getHomeRemediesHandler);

export default router;

