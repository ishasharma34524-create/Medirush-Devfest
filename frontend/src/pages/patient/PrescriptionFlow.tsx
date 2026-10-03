import React, { useState } from 'react';
import { PrescriptionUpload } from '../../components/prescription/PrescriptionUpload';
import { AiAnalysisScreen } from '../../components/prescription/AiAnalysisScreen';
import { MedicineReview } from '../../components/prescription/MedicineReview';
import { FindingMedicinesScreen } from '../../components/fulfillment/FindingMedicinesScreen';
import { DEMO_PRESCRIPTION } from '../../data/patient/demoPrescription';
import { createOrderFromFulfillment } from '../../services/orderService';
import type { ExtractedMedicine, PrescriptionStep, DemoPrescriptionData } from '../../types/prescription';
import type { FulfillmentPlan } from '../../types/pharmacy';
import type { ActiveOrder } from '../../types/patient';

interface PrescriptionFlowProps {
  onBackToDashboard: () => void;
  onOrderConfirmed: (order: ActiveOrder) => void;
}

export const PrescriptionFlow: React.FC<PrescriptionFlowProps> = ({ 
  onBackToDashboard,
  onOrderConfirmed,
}) => {
  const [step, setStep] = useState<PrescriptionStep>('upload');
  const [uploadPayload, setUploadPayload] = useState<File | 'demo'>('demo');
  const [prescriptionData, setPrescriptionData] = useState<DemoPrescriptionData>(DEMO_PRESCRIPTION);
  const [medicines, setMedicines] = useState<ExtractedMedicine[]>(() =>
    JSON.parse(JSON.stringify(DEMO_PRESCRIPTION.medicines))
  );

  const handleStartAnalysis = (payload: File | 'demo' = 'demo') => {
    setUploadPayload(payload);
    setStep('analyzing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (data: { prescription: DemoPrescriptionData; medicines: ExtractedMedicine[] }) => {
    setPrescriptionData(data.prescription);
    setMedicines(data.medicines);
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
    // Navigate directly into Finding Your Medicines (Sequential Broadcast)
    setStep('finding-medicines');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmOrder = (plan: FulfillmentPlan) => {
    const newOrder = createOrderFromFulfillment(medicines, plan);
    onOrderConfirmed(newOrder);
  };

  const handleReupload = () => {
    setStep('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {step === 'upload' && (
        <PrescriptionUpload
          onSelectDemo={() => handleStartAnalysis('demo')}
          onFileUpload={(file) => handleStartAnalysis(file)}
          onBack={onBackToDashboard}
        />
      )}

      {step === 'analyzing' && (
        <AiAnalysisScreen 
          uploadPayload={uploadPayload}
          onComplete={handleAnalysisComplete} 
        />
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

      {step === 'finding-medicines' && (
        <FindingMedicinesScreen
          medicines={medicines}
          onConfirmOrder={handleConfirmOrder}
          onBackToReview={() => setStep('review')}
        />
      )}
    </div>
  );
};
