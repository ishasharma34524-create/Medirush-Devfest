import { Router } from "express";
import {
  getNearbyPharmaciesHandler,
  getPharmacyStockHandler,
  seedPharmaciesHandler,
} from "../controllers/pharmacyController";

const router = Router();

// GET /api/pharmacies/nearby?latitude=22.72&longitude=75.88&radius=10
router.get("/nearby", getNearbyPharmaciesHandler);

// GET /api/pharmacies/:id/stock
router.get("/:id/stock", getPharmacyStockHandler);

// POST /api/pharmacies/seed (Hackathon demo initialization helper)
router.post("/seed", seedPharmaciesHandler);

export default router;
