import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware";
import { parsePrescriptionHandler } from "../controllers/prescriptionController";

const router = Router();

// POST /api/prescriptions/parse
router.post("/parse", upload.single("image"), parsePrescriptionHandler);

export default router;
