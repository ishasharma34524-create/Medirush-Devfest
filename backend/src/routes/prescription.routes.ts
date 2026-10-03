import { Router } from "express";
import { getDemoPrescription, analyzePrescription } from "../controllers/prescription.controller";

const router = Router();

// GET /api/prescriptions/demo
router.get("/prescriptions/demo", getDemoPrescription);

// POST /api/prescriptions/analyze
router.post("/prescriptions/analyze", analyzePrescription);

export default router;
