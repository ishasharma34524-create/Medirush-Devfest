import { Request, Response, NextFunction } from "express";
import {
  createOrder,
  getOrderById,
  broadcastOrder,
  confirmOrder,
  dispatchOrder,
} from "../services/orderService";

/**
 * Controller for POST /api/orders.
 * Creates a new emergency order with CREATED status.
 */
export const createOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { patientId, medicines, deliveryLocation, payout } = req.body;

    const order = await createOrder({
      patientId,
      medicines,
      deliveryLocation,
      payout,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Failed to create order",
    });
  }
};

/**
 * Controller for GET /api/orders/:id.
 * Retrieves single order details.
 */
export const getOrderByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: `Order with ID '${id}' not found.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Invalid order ID",
    });
  }
};

/**
 * Controller for POST /api/orders/:id/broadcast.
 * Transitions order status to BROADCASTING and finds matching nearby online pharmacies.
 */
export const broadcastOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const radiusKm = req.body.radiusKm ? Number(req.body.radiusKm) : 10;

    const { order, matchingPharmacies } = await broadcastOrder(id, radiusKm);

    res.status(200).json({
      success: true,
      message: "Order broadcasted to matching nearby pharmacies",
      orderId: order._id,
      status: order.status,
      matchingPharmaciesCount: matchingPharmacies.length,
      matchingPharmacies,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Failed to broadcast order",
    });
  }
};

/**
 * Controller for POST /api/orders/:id/confirm.
 * A pharmacy confirms the order. Prevents duplicate acceptance.
 */
export const confirmOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { pharmacyId } = req.body;

    if (!pharmacyId) {
      res.status(400).json({
        success: false,
        message: "Field 'pharmacyId' is required to confirm the order",
      });
      return;
    }

    const updatedOrder = await confirmOrder(id, pharmacyId);

    res.status(200).json({
      success: true,
      message: "Order confirmed by pharmacy",
      order: updatedOrder,
    });
  } catch (error: any) {
    const isConflict = error?.message?.includes("already been accepted");
    res.status(isConflict ? 409 : 400).json({
      success: false,
      message: error?.message || "Failed to confirm order",
    });
  }
};

/**
 * Controller for POST /api/orders/:id/dispatch.
 * Assigns demo rider and moves status to OUT_FOR_DELIVERY.
 */
export const dispatchOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const dispatchedOrder = await dispatchOrder(id);

    res.status(200).json({
      success: true,
      message: "Order dispatched with assigned rider",
      order: dispatchedOrder,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || "Failed to dispatch order",
    });
  }
};
