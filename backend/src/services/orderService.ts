import mongoose, { Types } from "mongoose";
import { Order, IOrder, OrderStatus, IOrderItem, IDeliveryLocation } from "../models/Order";
import { findNearbyPharmacies, NearbyPharmacyResult, DEMO_PHARMACIES_LIST } from "./pharmacyService";

export interface CreateOrderInput {
  patientId: string;
  medicines: IOrderItem[];
  deliveryLocation: IDeliveryLocation;
  payout?: number;
}

// In-memory demo store used when MongoDB is offline
const inMemoryOrders = new Map<string, any>();

/**
 * Creates and stores a new order with CREATED status.
 */
export const createOrder = async (input: CreateOrderInput): Promise<any> => {
  if (!input.patientId || !input.patientId.trim()) {
    throw new Error("patientId is required");
  }

  if (!input.medicines || !Array.isArray(input.medicines) || input.medicines.length === 0) {
    throw new Error("At least one medicine is required to create an order");
  }

  if (
    !input.deliveryLocation ||
    typeof input.deliveryLocation.latitude !== "number" ||
    typeof input.deliveryLocation.longitude !== "number" ||
    !input.deliveryLocation.address
  ) {
    throw new Error("Valid deliveryLocation with address, latitude, and longitude is required");
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const order = new Order({
        patientId: input.patientId,
        medicines: input.medicines,
        deliveryLocation: input.deliveryLocation,
        status: OrderStatus.CREATED,
        payout: input.payout || 50,
        etaMinutes: 25,
      });
      return await order.save();
    } catch (dbErr) {
      console.warn("[Order Service] MongoDB save failed, falling back to memory store:", dbErr);
    }
  }

  // Resilient in-memory fallback
  const mockId = new Types.ObjectId().toString();
  const mockOrder = {
    _id: mockId,
    patientId: input.patientId,
    medicines: input.medicines,
    deliveryLocation: input.deliveryLocation,
    status: OrderStatus.CREATED,
    payout: input.payout || 50,
    etaMinutes: 25,
    createdAt: new Date(),
  };

  inMemoryOrders.set(mockId, mockOrder);
  return mockOrder;
};

/**
 * Retrieves an order by ID.
 */
export const getOrderById = async (orderId: string): Promise<any | null> => {
  if (mongoose.connection.readyState === 1 && Types.ObjectId.isValid(orderId)) {
    try {
      const order = await Order.findById(orderId).populate(
        "pharmacyId",
        "name address latitude longitude isOnline"
      );
      if (order) return order;
    } catch {
      // Fall through to memory store
    }
  }

  return inMemoryOrders.get(orderId) || null;
};

/**
 * Broadcasts an order to nearby online pharmacies matching stock requirements.
 * Updates order status to BROADCASTING.
 */
export const broadcastOrder = async (
  orderId: string,
  radiusKm: number = 10
): Promise<{ order: any; matchingPharmacies: NearbyPharmacyResult[] }> => {
  let order: any = null;

  if (mongoose.connection.readyState === 1 && Types.ObjectId.isValid(orderId)) {
    try {
      order = await Order.findById(orderId);
    } catch {
      order = null;
    }
  }

  if (!order) {
    order = inMemoryOrders.get(orderId);
  }

  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("Cannot broadcast a cancelled order");
  }

  // Update order status to BROADCASTING
  order.status = OrderStatus.BROADCASTING;
  if (typeof order.save === "function") {
    await order.save();
  } else {
    inMemoryOrders.set(orderId, order);
  }

  // Extract medicine names to check stock matches
  const medicineNames = (order.medicines || []).map(
    (m: any) => m.brandName || m.name || m.salt || ""
  );

  // Find online nearby pharmacies with matched stock
  const allNearby = await findNearbyPharmacies(
    order.deliveryLocation.latitude,
    order.deliveryLocation.longitude,
    radiusKm,
    medicineNames
  );

  const matchingPharmacies = allNearby.filter((p) => p.isOnline);

  return { order, matchingPharmacies };
};

/**
 * Confirms order acceptance by a specific pharmacy.
 * Enforces single acceptance: prevents duplicate acceptance if already accepted.
 */
export const confirmOrder = async (
  orderId: string,
  pharmacyId: string
): Promise<any> => {
  let order: any = null;

  if (mongoose.connection.readyState === 1 && Types.ObjectId.isValid(orderId)) {
    try {
      order = await Order.findById(orderId);
    } catch {
      order = null;
    }
  }

  if (!order) {
    order = inMemoryOrders.get(orderId);
  }

  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  // Prevent duplicate acceptance
  if (
    order.status === OrderStatus.PHARMACY_ACCEPTED ||
    order.status === OrderStatus.PACKING ||
    order.status === OrderStatus.RIDER_ASSIGNED ||
    order.status === OrderStatus.OUT_FOR_DELIVERY ||
    order.status === OrderStatus.DELIVERED
  ) {
    throw new Error("Order has already been accepted by a pharmacy and is no longer available");
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("Cannot confirm a cancelled order");
  }

  order.pharmacyId = pharmacyId;
  order.status = OrderStatus.PHARMACY_ACCEPTED;

  if (typeof order.save === "function") {
    return await order.save();
  } else {
    inMemoryOrders.set(orderId, order);
    return order;
  }
};

/**
 * Dispatches the order for delivery.
 * Assigns demo rider and realistic ETA, sets status to OUT_FOR_DELIVERY.
 */
export const dispatchOrder = async (orderId: string): Promise<any> => {
  let order: any = null;

  if (mongoose.connection.readyState === 1 && Types.ObjectId.isValid(orderId)) {
    try {
      order = await Order.findById(orderId);
    } catch {
      order = null;
    }
  }

  if (!order) {
    order = inMemoryOrders.get(orderId);
  }

  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("Cannot dispatch a cancelled order");
  }

  // Demo rider information requested for hackathon
  order.rider = {
    name: "Rahul",
    phone: "+91-9876543210",
    vehicle: "Hero Splendor",
    vehicleNumber: "MP-43-E-2101",
  };

  order.etaMinutes = 15;
  order.status = OrderStatus.OUT_FOR_DELIVERY;

  if (typeof order.save === "function") {
    return await order.save();
  } else {
    inMemoryOrders.set(orderId, order);
    return order;
  }
};

/**
 * Retrieves all active / live orders for chemist portal monitoring.
 */
export const getAllOrders = async (): Promise<any[]> => {
  const list: any[] = [];
  if (mongoose.connection.readyState === 1) {
    try {
      const dbOrders = await Order.find().sort({ createdAt: -1 }).limit(20);
      list.push(...dbOrders);
    } catch {
      // Fall through to in-memory orders
    }
  }

  for (const [, order] of inMemoryOrders) {
    if (!list.some((o) => String(o._id) === String(order._id))) {
      list.push(order);
    }
  }

  return list;
};

/**
 * Handles partial confirmation by a chemist and cascades remaining medicines to the next nearest chemist.
 */
export const partialConfirmAndForwardOrder = async (
  orderId: string,
  pharmacyId: string,
  acceptedMedicines: any[],
  remainingMedicines: any[]
): Promise<{ primaryOrder: any; forwardedOrder?: any; nextPharmacy?: any }> => {
  let order = await getOrderById(orderId);
  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  order.pharmacyId = pharmacyId;
  order.medicines = acceptedMedicines;
  order.status = OrderStatus.PHARMACY_ACCEPTED;

  if (typeof order.save === "function") {
    await order.save();
  } else {
    inMemoryOrders.set(orderId, order);
  }

  let forwardedOrder: any = null;
  let nextPharmacy: any = null;

  if (remainingMedicines && remainingMedicines.length > 0) {
    const nextPharmacies = DEMO_PHARMACIES_LIST.filter(
      (p) => String(p._id) !== String(pharmacyId)
    );
    nextPharmacy = nextPharmacies[0] || DEMO_PHARMACIES_LIST[1];

    forwardedOrder = await createOrder({
      patientId: order.patientId,
      medicines: remainingMedicines,
      deliveryLocation: order.deliveryLocation,
      payout: 40,
    });

    forwardedOrder.status = OrderStatus.BROADCASTING;
    forwardedOrder.pharmacyId = nextPharmacy?._id;
    if (typeof forwardedOrder.save === "function") {
      await forwardedOrder.save();
    } else {
      inMemoryOrders.set(String(forwardedOrder._id), forwardedOrder);
    }
  }

  return { primaryOrder: order, forwardedOrder, nextPharmacy };
};

