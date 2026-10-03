export interface GenericAlternative {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  prescribedPrice: number;
  savings: number;
  isAvailable: boolean;
}

export interface ExtractedMedicine {
  id: string;
  name: string;
  strength: string;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler';
  saltComposition: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unitPrice: number;
  selectedVariant: 'prescribed' | 'generic';
  genericAlternative?: GenericAlternative;
  isPrescriptionRequired: boolean;
  isColdChain: boolean;
  notes?: string;
}

export interface DemoPrescriptionData {
  id: string;
  doctorName: string;
  doctorRegNo: string;
  clinicName: string;
  date: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  diagnosis: string;
  medicines: ExtractedMedicine[];
}

export type PrescriptionStep = 
  | 'upload'
  | 'analyzing'
  | 'review'
  | 'fulfillment-ready';
