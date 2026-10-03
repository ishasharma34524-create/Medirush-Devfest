import { apiRequest } from './apiClient';
import type { DemoPrescriptionData, ExtractedMedicine } from '../types/prescription';
import { DEMO_PRESCRIPTION } from '../data/patient/demoPrescription';

export interface BackendAnalyzeResponse {
  success: boolean;
  message?: string;
  data: {
    type: string;
    prescription: DemoPrescriptionData;
    medicines: ExtractedMedicine[];
  };
}

export interface BackendHealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await apiRequest<BackendHealthResponse>('health');
    return res.success;
  } catch (err) {
    console.warn('Backend health check returned warning (using local layer):', err);
    return false;
  }
}

/**
 * Calls the MediRush backend API to analyze a prescription
 */
export async function analyzePrescriptionApi(
  fileOrDemo: File | 'demo'
): Promise<{ prescription: DemoPrescriptionData; medicines: ExtractedMedicine[] }> {
  try {
    const isDemo = fileOrDemo === 'demo';
    const response = await apiRequest<BackendAnalyzeResponse>('prescriptions/analyze', {
      method: 'POST',
      body: JSON.stringify({
        prescriptionType: isDemo ? 'demo' : 'custom_upload',
        fileName: isDemo ? 'demo_prescription.pdf' : (fileOrDemo as File).name,
      }),
    });

    if (response.success && response.data?.prescription) {
      return {
        prescription: response.data.prescription,
        medicines: response.data.medicines || response.data.prescription.medicines,
      };
    }
  } catch (error) {
    console.warn('Direct backend call fallback to local dataset:', error);
  }

  // Graceful fallback to deterministic local dataset if needed
  return {
    prescription: DEMO_PRESCRIPTION,
    medicines: JSON.parse(JSON.stringify(DEMO_PRESCRIPTION.medicines)),
  };
}
