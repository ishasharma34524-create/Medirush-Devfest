import { Router } from "express";
import healthRoutes from "./health.routes";
import prescriptionRoutes from "./prescription.routes";
import orderRoutes from "./orderRoutes";
import pharmacyRoutes from "./pharmacyRoutes";
import aiRoutes from "./aiRoutes";

const apiRouter = Router();

// Root API sub-routes
apiRouter.use(healthRoutes);
apiRouter.use(prescriptionRoutes);
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/pharmacies", pharmacyRoutes);
apiRouter.use("/ai", aiRoutes);

export default apiRouter;
