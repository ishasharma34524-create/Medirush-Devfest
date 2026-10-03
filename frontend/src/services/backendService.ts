import { apiRequest } from "./apiClient";

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface ParsedMedicine {
  brandName: string;
  salt: string;
  strength: string;
  quantity: number;
  coldChain: boolean;
  scheduleType: string;
  confidence: number;
}

export interface ParsePrescriptionResponse {
  success: boolean;
  prescriptionId?: string;
  isFallback: boolean;
  source: string;
  medicines: ParsedMedicine[];
}

export interface PharmacyNearbyItem {
  pharmacy: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isOnline: boolean;
  };
  distanceKm: number;
  isOnline: boolean;
  relevantStock: Array<{
    medicineName: string;
    quantity: number;
    available: boolean;
  }>;
}

export interface NearbyPharmaciesResponse {
  success: boolean;
  count: number;
  radiusKm: number;
  pharmacies: PharmacyNearbyItem[];
}

export interface CreateOrderPayload {
  patientId: string;
  medicines: Array<{
    brandName: string;
    salt?: string;
    strength?: string;
    quantity: number;
  }>;
  deliveryLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

export interface OrderResponse {
  success: boolean;
  order: any;
  message?: string;
}

/**
 * Health check verification
 */
export const checkBackendHealth = async (): Promise<HealthResponse> => {
  return apiRequest<HealthResponse>("health");
};

/**
 * Sends prescription image or triggers OCR parsing on backend
 */
export const parsePrescriptionApi = async (
  file?: File,
  patientId: string = "patient_demo_101"
): Promise<ParsePrescriptionResponse> => {
  const formData = new FormData();
  if (file) {
    formData.append("image", file);
  }
  formData.append("patientId", patientId);

  return apiRequest<ParsePrescriptionResponse>("prescriptions/parse", {
    method: "POST",
    body: formData,
  });
};

/**
 * Searches nearby online pharmacies with live medicine stock match
 */
export const fetchNearbyPharmacies = async (
  latitude: number = 22.7244,
  longitude: number = 75.8839,
  radius: number = 10
): Promise<NearbyPharmaciesResponse> => {
  return apiRequest<NearbyPharmaciesResponse>(
    `pharmacies/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
  );
};

/**
 * Creates emergency order in backend MongoDB
 */
export const createOrderApi = async (
  payload: CreateOrderPayload
): Promise<OrderResponse> => {
  return apiRequest<OrderResponse>("orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * Broadcasts order to nearby pharmacies
 */
export const broadcastOrderApi = async (
  orderId: string,
  radiusKm: number = 10
): Promise<any> => {
  return apiRequest(`orders/${orderId}/broadcast`, {
    method: "POST",
    body: JSON.stringify({ radiusKm }),
  });
};

/**
 * Pharmacy confirms order
 */
export const confirmOrderApi = async (
  orderId: string,
  pharmacyId: string
): Promise<any> => {
  return apiRequest(`orders/${orderId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ pharmacyId }),
  });
};

/**
 * Dispatches order with live rider
 */
export const dispatchOrderApi = async (orderId: string): Promise<any> => {
  return apiRequest(`orders/${orderId}/dispatch`, {
    method: "POST",
  });
};

/**
 * Gemini AI: Generic Equivalent & Cost Savings Engine
 */
export const fetchGenericAlternatives = async (medicines: any[]): Promise<any> => {
  return apiRequest("ai/alternatives", {
    method: "POST",
    body: JSON.stringify({ medicines }),
  });
};

/**
 * Gemini AI: Drug-Drug Interaction and Contraindication Safety Checker
 */
export const checkDrugInteractions = async (medicines: any[]): Promise<any> => {
  return apiRequest("ai/interactions", {
    method: "POST",
    body: JSON.stringify({ medicines }),
  });
};

/**
 * Gemini AI: Patient Prescription Explainer in Conversational Hinglish
 */
export const explainPrescriptionHinglish = async (
  medicines: any[],
  patientNotes?: string
): Promise<any> => {
  return apiRequest("ai/explain", {
    method: "POST",
    body: JSON.stringify({ medicines, patientNotes }),
  });
};

