import { Router } from "express";
import {
  createOrderHandler,
  getOrderByIdHandler,
  broadcastOrderHandler,
  confirmOrderHandler,
  dispatchOrderHandler,
} from "../controllers/orderController";

const router = Router();

// POST /api/orders
router.post("/", createOrderHandler);

// GET /api/orders/:id
router.get("/:id", getOrderByIdHandler);

// POST /api/orders/:id/broadcast
router.post("/:id/broadcast", broadcastOrderHandler);

// POST /api/orders/:id/confirm
router.post("/:id/confirm", confirmOrderHandler);

// POST /api/orders/:id/dispatch
router.post("/:id/dispatch", dispatchOrderHandler);

export default router;
