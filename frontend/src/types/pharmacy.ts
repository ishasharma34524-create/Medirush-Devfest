import type { ExtractedMedicine } from './prescription';

export interface Pharmacy {
  id: string;
  name: string;
  chain: string;
  address: string;
  distanceKm: number;
  rating: number;
  isVerified: boolean;
  hasColdChainStorage: boolean;
  contactNumber: string;
  // Medicine IDs in stock for demo scenarios
  inventoryMedicineIds: string[];
}

export interface PharmacyFulfillmentMatch {
  pharmacy: Pharmacy;
  items: ExtractedMedicine[];
  matchedCount: number;
}

export interface BroadcastLogItem {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  distanceKm: number;
  status: 'pending' | 'checking' | 'matched_full' | 'matched_partial' | 'skipped';
  itemsFound: ExtractedMedicine[];
  itemsNeeded: ExtractedMedicine[];
  message: string;
}

export interface FulfillmentPlan {
  isComplete: boolean;
  scenarioUsed: 'scenario-a-multi' | 'scenario-b-single';
  matches: PharmacyFulfillmentMatch[];
  totalPharmaciesUsed: number;
  totalDistanceKm: number;
  estimatedDeliveryMins: number;
  broadcastLogs: BroadcastLogItem[];
  uncontactedPharmacies: Pharmacy[];
}
