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

export interface ActiveOrderItem {
  id: string;
  name: string;
  quantity: number;
  strength?: string;
}

export interface ActiveOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'searching' | 'matched' | 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered';
  items: ActiveOrderItem[];
  estimatedDeliveryTime?: string;
  pharmacyCount?: number;
  totalAmount?: number;
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
  | 'my-orders'
  | 'nearby-pharmacy'
  | 'symptom-checker';
