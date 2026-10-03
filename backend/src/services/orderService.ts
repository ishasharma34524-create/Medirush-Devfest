import { Types } from "mongoose";
import { Order, IOrder, OrderStatus, IOrderItem, IDeliveryLocation } from "../models/Order";
import { Pharmacy } from "../models/Pharmacy";
import { findNearbyPharmacies, NearbyPharmacyResult } from "./pharmacyService";

export interface CreateOrderInput {
  patientId: string;
  medicines: IOrderItem[];
  deliveryLocation: IDeliveryLocation;
  payout?: number;
}

/**
 * Creates and stores a new order with CREATED status.
 */
export const createOrder = async (input: CreateOrderInput): Promise<IOrder> => {
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

  const order = new Order({
    patientId: input.patientId,
    medicines: input.medicines,
    deliveryLocation: input.deliveryLocation,
    status: OrderStatus.CREATED,
    payout: input.payout || 50,
    etaMinutes: 25,
  });

  return await order.save();
};

/**
 * Retrieves an order by ID with optional pharmacy population.
 */
export const getOrderById = async (orderId: string): Promise<IOrder | null> => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid Order ID format");
  }
  return await Order.findById(orderId).populate("pharmacyId", "name address latitude longitude isOnline");
};

/**
 * Broadcasts an order to nearby online pharmacies matching stock requirements.
 * Updates order status to BROADCASTING.
 */
export const broadcastOrder = async (
  orderId: string,
  radiusKm: number = 10
): Promise<{ order: IOrder; matchingPharmacies: NearbyPharmacyResult[] }> => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new Error(`Order with ID ${orderId} not found`);
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("Cannot broadcast a cancelled order");
  }

  // Update order status to BROADCASTING
  order.status = OrderStatus.BROADCASTING;
  await order.save();

  // Extract medicine names to check stock matches
  const medicineNames = order.medicines.map((m) => m.brandName || m.salt || "");

  // Find online nearby pharmacies with matched stock
  const allNearby = await findNearbyPharmacies(
    order.deliveryLocation.latitude,
    order.deliveryLocation.longitude,
    radiusKm,
    medicineNames
  );

  // Filter only online pharmacies that have matching or relevant stock
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
): Promise<IOrder> => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid Order ID format");
  }
  if (!Types.ObjectId.isValid(pharmacyId)) {
    throw new Error("Invalid Pharmacy ID format");
  }

  const order = await Order.findById(orderId);
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

  // Verify pharmacy exists
  const pharmacy = await Pharmacy.findById(pharmacyId);
  if (!pharmacy) {
    throw new Error(`Pharmacy with ID ${pharmacyId} not found`);
  }

  order.pharmacyId = new Types.ObjectId(pharmacyId);
  order.status = OrderStatus.PHARMACY_ACCEPTED;

  return await order.save();
};

/**
 * Dispatches the order for delivery.
 * Assigns demo rider and realistic ETA, sets status to OUT_FOR_DELIVERY.
 */
export const dispatchOrder = async (orderId: string): Promise<IOrder> => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid Order ID format");
  }

  const order = await Order.findById(orderId);
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

  return await order.save();
};
