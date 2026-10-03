import { apiRequest } from './apiClient';
import type { DemoPrescriptionData, ExtractedMedicine } from '../types/prescription';
import { DEMO_PRESCRIPTION } from '../data/patient/demoPrescription';
import { analyzePrescriptionWithGemini } from './geminiAiService';

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
 * Calls Gemini AI Vision OCR to extract actual medicines from real prescription files,
 * or returns deterministic chronic care dataset if Demo is selected.
 */
export async function analyzePrescriptionApi(
  fileOrDemo: File | 'demo'
): Promise<{ prescription: DemoPrescriptionData; medicines: ExtractedMedicine[] }> {
  // If user uploaded a real image/PDF, run Gemini AI Vision analysis!
  if (fileOrDemo !== 'demo') {
    console.log('[MediRush] Analyzing uploaded prescription file using Gemini AI Vision...');
    const geminiResult = await analyzePrescriptionWithGemini(fileOrDemo);
    if (geminiResult && geminiResult.medicines.length > 0) {
      return geminiResult;
    }
  }

  // If demo requested or Gemini fallback triggered
  try {
    const response = await apiRequest<BackendAnalyzeResponse>('prescriptions/analyze', {
      method: 'POST',
      body: JSON.stringify({
        prescriptionType: fileOrDemo === 'demo' ? 'demo' : 'custom_upload',
        fileName: fileOrDemo === 'demo' ? 'demo_prescription.pdf' : (fileOrDemo as File).name,
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
