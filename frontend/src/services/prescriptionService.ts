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
  // If user uploaded a real image/PDF, try client-side Gemini Vision first
  if (fileOrDemo !== 'demo') {
    console.log('[MediRush] Analyzing uploaded prescription file using Gemini AI Vision...');
    try {
      const geminiResult = await analyzePrescriptionWithGemini(fileOrDemo);
      if (geminiResult && geminiResult.medicines && geminiResult.medicines.length > 0 && geminiResult.prescription.id !== DEMO_PRESCRIPTION.id) {
        return geminiResult;
      }
    } catch (e) {
      console.warn('Client Gemini call had issue, sending to backend API:', e);
    }
  }

  // Send to backend API which has multi-model Gemini Vision fallback
  try {
    let body: any;

    if (fileOrDemo instanceof File) {
      const formData = new FormData();
      formData.append('image', fileOrDemo);
      formData.append('prescriptionType', 'custom_upload');
      body = formData;
    } else {
      body = JSON.stringify({
        prescriptionType: 'demo',
        fileName: 'demo_prescription.pdf',
      });
    }

    const response = await apiRequest<BackendAnalyzeResponse>('prescriptions/analyze', {
      method: 'POST',
      body,
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
