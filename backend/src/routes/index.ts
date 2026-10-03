import { Router } from "express";
import healthRoutes from "./health.routes";
import prescriptionRoutes from "./prescriptionRoutes";
import pharmacyRoutes from "./pharmacyRoutes";
import orderRoutes from "./orderRoutes";

const apiRouter = Router();

// Health check endpoint: GET /api/health
apiRouter.use(healthRoutes);

// Prescription parsing: POST /api/prescriptions/parse
apiRouter.use("/prescriptions", prescriptionRoutes);

// Pharmacy discovery: GET /api/pharmacies/nearby, GET /api/pharmacies/:id/stock
apiRouter.use("/pharmacies", pharmacyRoutes);

// Order lifecycle: POST /api/orders, GET /api/orders/:id, broadcast, confirm, dispatch
apiRouter.use("/orders", orderRoutes);

export default apiRouter;
