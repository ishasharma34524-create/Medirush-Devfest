import mongoose, { Document, Schema } from "mongoose";

export interface IPrescriptionMedicine {
  brandName: string;
  salt: string;
  strength: string;
  quantity: number;
  coldChain: boolean;
  scheduleType: string;
  confidence: number;
}

export interface IPrescription extends Document {
  patientId: string;
  image: string;
  medicines: IPrescriptionMedicine[];
  aiConfidence: number;
  doctorVerified: boolean;
  createdAt: Date;
}

const PrescriptionMedicineSchema = new Schema<IPrescriptionMedicine>(
  {
    brandName: { type: String, required: true },
    salt: { type: String, required: true },
    strength: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    coldChain: { type: Boolean, default: false },
    scheduleType: { type: String, default: "H" },
    confidence: { type: Number, default: 1.0 },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    patientId: { type: String, required: true, index: true },
    image: { type: String, default: "" },
    medicines: { type: [PrescriptionMedicineSchema], default: [] },
    aiConfidence: { type: Number, default: 0.9 },
    doctorVerified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Prescription = mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
