import mongoose, { Document, Schema } from "mongoose";

export interface IMedicine extends Document {
  brandName: string;
  salt: string;
  strength: string;
  mrp: number;
  isColdChain: boolean;
  scheduleType: string;
  genericAlternatives: string[];
  createdAt: Date;
}

const MedicineSchema = new Schema<IMedicine>(
  {
    brandName: { type: String, required: true, trim: true, index: true },
    salt: { type: String, required: true, trim: true, index: true },
    strength: { type: String, required: true, trim: true },
    mrp: { type: Number, required: true, min: 0 },
    isColdChain: { type: Boolean, default: false },
    scheduleType: { type: String, default: "H" },
    genericAlternatives: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Medicine = mongoose.model<IMedicine>("Medicine", MedicineSchema);
