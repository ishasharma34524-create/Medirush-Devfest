import React, { useState } from 'react';
import { PrescriptionUpload } from '../../components/prescription/PrescriptionUpload';
import { AiAnalysisScreen } from '../../components/prescription/AiAnalysisScreen';
import { MedicineReview } from '../../components/prescription/MedicineReview';
import { FulfillmentReadyView } from '../../components/prescription/FulfillmentReadyView';
import { DEMO_PRESCRIPTION } from '../../data/patient/demoPrescription';
import type { ExtractedMedicine, PrescriptionStep, DemoPrescriptionData } from '../../types/prescription';

interface PrescriptionFlowProps {
  onBackToDashboard: () => void;
}

export const PrescriptionFlow: React.FC<PrescriptionFlowProps> = ({ onBackToDashboard }) => {
  const [step, setStep] = useState<PrescriptionStep>('upload');
  const [prescriptionData] = useState<DemoPrescriptionData>(DEMO_PRESCRIPTION);
  const [medicines, setMedicines] = useState<ExtractedMedicine[]>(() =>
    JSON.parse(JSON.stringify(DEMO_PRESCRIPTION.medicines))
  );

  const handleStartAnalysis = () => {
    // Reset to fresh demo data on start
    setMedicines(JSON.parse(JSON.stringify(DEMO_PRESCRIPTION.medicines)));
    setStep('analyzing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = () => {
    setStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, quantity: Math.max(1, newQty) } : med))
    );
  };

  const handleToggleVariant = (id: string, variant: 'prescribed' | 'generic') => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, selectedVariant: variant } : med))
    );
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((med) => med.id !== id));
  };

  const handleOrderMedicines = () => {
    setStep('fulfillment-ready');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReupload = () => {
    setStep('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {step === 'upload' && (
        <PrescriptionUpload
          onSelectDemo={handleStartAnalysis}
          onFileUpload={handleStartAnalysis}
          onBack={onBackToDashboard}
        />
      )}

      {step === 'analyzing' && (
        <AiAnalysisScreen onComplete={handleAnalysisComplete} />
      )}

      {step === 'review' && (
        <MedicineReview
          prescription={prescriptionData}
          medicines={medicines}
          onUpdateQuantity={handleUpdateQuantity}
          onToggleVariant={handleToggleVariant}
          onRemoveMedicine={handleRemoveMedicine}
          onOrderMedicines={handleOrderMedicines}
          onReupload={handleReupload}
        />
      )}

      {step === 'fulfillment-ready' && (
        <FulfillmentReadyView
          prescription={prescriptionData}
          medicines={medicines}
          onBackToDashboard={onBackToDashboard}
          onRestartDemo={handleStartAnalysis}
        />
      )}
    </div>
  );
};
