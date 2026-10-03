import { Router } from "express";
import healthRoutes from "./health.routes";
import prescriptionRoutes from "./prescriptionRoutes";
import prescriptionTeammateRoutes from "./prescription.routes";
import pharmacyRoutes from "./pharmacyRoutes";
import orderRoutes from "./orderRoutes";
import aiRoutes from "./aiRoutes";

const apiRouter = Router();

// 1. Health check: GET /api/health
apiRouter.use(healthRoutes);

// 2. Prescription APIs: /api/prescriptions/parse, /demo, /analyze
apiRouter.use("/prescriptions", prescriptionRoutes);
apiRouter.use(prescriptionTeammateRoutes);

// 3. Pharmacy APIs: /api/pharmacies/nearby, /stock, /seed
apiRouter.use("/pharmacies", pharmacyRoutes);

// 4. Order APIs: /api/orders, /:id/broadcast, /confirm, /dispatch
apiRouter.use("/orders", orderRoutes);

// 5. Gemini AI Suite: /api/ai/alternatives, /interactions, /explain
apiRouter.use("/ai", aiRoutes);

export default apiRouter;
