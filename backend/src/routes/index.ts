import { Router } from "express";
import healthRoutes from "./health.routes";

const apiRouter = Router();

// Root API sub-routes
apiRouter.use(healthRoutes);

export default apiRouter;
