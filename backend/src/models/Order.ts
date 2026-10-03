import mongoose, { Document, Schema, Types } from "mongoose";

export enum OrderStatus {
  CREATED = "CREATED",
  BROADCASTING = "BROADCASTING",
  PHARMACY_ACCEPTED = "PHARMACY_ACCEPTED",
  PACKING = "PACKING",
  RIDER_ASSIGNED = "RIDER_ASSIGNED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface IOrderItem {
  brandName: string;
  salt?: string;
  strength?: string;
  quantity: number;
  price?: number;
}

export interface IDeliveryLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface IRiderInfo {
  name: string;
  phone?: string;
  vehicle: string;
  vehicleNumber: string;
}

export interface IOrder extends Document {
  patientId: string;
  pharmacyId?: Types.ObjectId;
  medicines: IOrderItem[];
  status: OrderStatus;
  deliveryLocation: IDeliveryLocation;
  rider?: IRiderInfo;
  etaMinutes?: number;
  payout?: number;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    brandName: { type: String, required: true },
    salt: { type: String, default: "" },
    strength: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const DeliveryLocationSchema = new Schema<IDeliveryLocation>(
  {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const RiderInfoSchema = new Schema<IRiderInfo>(
  {
    name: { type: String, required: true },
    phone: { type: String, default: "+91-9876543210" },
    vehicle: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    patientId: { type: String, required: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: false },
    medicines: { type: [OrderItemSchema], required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.CREATED,
      index: true,
    },
    deliveryLocation: { type: DeliveryLocationSchema, required: true },
    rider: { type: RiderInfoSchema, required: false },
    etaMinutes: { type: Number, default: 20 },
    payout: { type: Number, default: 50 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
