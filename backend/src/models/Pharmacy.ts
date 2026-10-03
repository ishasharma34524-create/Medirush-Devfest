import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPharmacyStock {
  medicineId?: Types.ObjectId;
  medicineName: string;
  quantity: number;
  available: boolean;
}

export interface IPharmacy extends Document {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isOnline: boolean;
  stock: IPharmacyStock[];
  createdAt: Date;
}

const PharmacyStockSchema = new Schema<IPharmacyStock>(
  {
    medicineId: { type: Schema.Types.ObjectId, ref: "Medicine", required: false },
    medicineName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    available: { type: Boolean, default: true },
  },
  { _id: false }
);

const PharmacySchema = new Schema<IPharmacy>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    isOnline: { type: Boolean, default: true, index: true },
    stock: { type: [PharmacyStockSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Pharmacy = mongoose.model<IPharmacy>("Pharmacy", PharmacySchema);
