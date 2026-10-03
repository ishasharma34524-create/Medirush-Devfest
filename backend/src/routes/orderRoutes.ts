import { Router } from "express";
import {
  createOrderHandler,
  getOrderByIdHandler,
  broadcastOrderHandler,
  confirmOrderHandler,
  dispatchOrderHandler,
  getAllOrdersHandler,
  partialConfirmOrderHandler,
} from "../controllers/orderController";

const router = Router();

// GET /api/orders (List all live/broadcast orders for Chemist Portal)
router.get("/", getAllOrdersHandler);

// POST /api/orders
router.post("/", createOrderHandler);

// GET /api/orders/:id
router.get("/:id", getOrderByIdHandler);

// POST /api/orders/:id/broadcast
router.post("/:id/broadcast", broadcastOrderHandler);

// POST /api/orders/:id/confirm (Full accept)
router.post("/:id/confirm", confirmOrderHandler);

// POST /api/orders/:id/partial-confirm (Partial accept & forward remaining)
router.post("/:id/partial-confirm", partialConfirmOrderHandler);

// POST /api/orders/:id/dispatch
router.post("/:id/dispatch", dispatchOrderHandler);

export default router;
