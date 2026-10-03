import type { ExtractedMedicine } from './prescription';
import type { PharmacyFulfillmentMatch } from './pharmacy';

export interface PatientProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  defaultLocation: {
    address: string;
    city: string;
    landmark?: string;
    postalCode: string;
  };
  unreadNotificationsCount: number;
}

export type OrderStatus = 
  | 'placed'
  | 'verification'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  time?: string;
  isComplete: boolean;
  isCurrent: boolean;
}

export interface ActiveOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  medicines: ExtractedMedicine[];
  pharmacyMatches: PharmacyFulfillmentMatch[];
  estimatedDeliveryMinutes: number;
  deliveryAddress: string;
  totalAmount: number;
  deliveryOtp: string;
  hasColdChain: boolean;
  timeline: OrderTimelineStep[];
}

export interface HistoricalOrder {
  id: string;
  orderNumber: string;
  date: string;
  medicinesCount: number;
  medicinesSummary: string;
  totalAmount: number;
  status: 'delivered' | 'cancelled';
  pharmaciesCount: number;
}

export interface PrescribedMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  prescribedDate: string;
  scheduleCategory?: 'Schedule H' | 'Schedule H1' | 'Schedule X' | 'OTC';
  isColdChain?: boolean;
}

export type PatientView = 
  | 'dashboard'
  | 'upload-prescription'
  | 'finding-medicines'
  | 'order-tracking'
  | 'my-orders'
  | 'nearby-pharmacy'
  | 'symptom-checker';
