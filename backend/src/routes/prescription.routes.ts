import { Router } from "express";
import { getDemoPrescription, analyzePrescription } from "../controllers/prescription.controller";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

// GET /api/prescriptions/demo
router.get("/prescriptions/demo", getDemoPrescription);

// POST /api/prescriptions/analyze (Supports both multipart file upload and JSON)
router.post("/prescriptions/analyze", upload.single("image"), analyzePrescription);

export default router;
