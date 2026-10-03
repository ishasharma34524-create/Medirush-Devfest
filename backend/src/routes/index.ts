import { Router } from "express";
import healthRoutes from "./health.routes";
import prescriptionRoutes from "./prescription.routes";

const apiRouter = Router();

// Root API sub-routes
apiRouter.use(healthRoutes);
apiRouter.use(prescriptionRoutes);

export default apiRouter;
