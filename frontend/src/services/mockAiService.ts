import { DEMO_PRESCRIPTION } from '../data/patient/demoPrescription';
import type { ExtractedMedicine, DemoPrescriptionData } from '../types/prescription';

export interface AnalysisState {
  stepIndex: number;
  steps: string[];
  isComplete: boolean;
}

export const ANALYSIS_STEPS = [
  'Prescription detected',
  'Reading medicines & dosages',
  'Identifying salt compositions',
  'Checking safety & generic alternatives',
  'Preparing medicine review'
];

/**
 * Simulates AI prescription OCR extraction and medicine intelligence.
 * Kept fast and snappy for hackathon demo (~1.5s total).
 */
export async function analyzePrescription(
  _fileOrDemo: File | 'demo',
  onProgress?: (stepIndex: number) => void
): Promise<{ prescription: DemoPrescriptionData; medicines: ExtractedMedicine[] }> {
  const stepDelayMs = 350;

  for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
    if (onProgress) {
      onProgress(i);
    }
    await new Promise((resolve) => setTimeout(resolve, stepDelayMs));
  }

  // Deep clone demo medicines so patient edits are isolated
  const medicines: ExtractedMedicine[] = JSON.parse(JSON.stringify(DEMO_PRESCRIPTION.medicines));

  return {
    prescription: DEMO_PRESCRIPTION,
    medicines
  };
}
