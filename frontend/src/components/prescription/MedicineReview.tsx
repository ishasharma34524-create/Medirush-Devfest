import { ArrowRight, Zap, RefreshCw, FileText, User, Hospital, AlertTriangle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { MedicineCard } from './MedicineCard';
import type { ExtractedMedicine, DemoPrescriptionData } from '../../types/prescription';

interface MedicineReviewProps {
  prescription: DemoPrescriptionData;
  medicines: ExtractedMedicine[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onToggleVariant: (id: string, variant: 'prescribed' | 'generic') => void;
  onRemoveMedicine: (id: string) => void;
  onOrderMedicines: () => void;
  onReupload: () => void;
}

export const MedicineReview: React.FC<MedicineReviewProps> = ({
  prescription,
  medicines,
  onUpdateQuantity,
  onToggleVariant,
  onRemoveMedicine,
  onOrderMedicines,
  onReupload,
}) => {
  // Calculate totals
  const totalItems = medicines.reduce((acc, med) => acc + med.quantity, 0);
  const estimatedTotal = medicines.reduce((acc, med) => {
    const isGeneric = med.selectedVariant === 'generic' && med.genericAlternative;
    const price = isGeneric ? med.genericAlternative!.price : med.unitPrice;
    return acc + price * med.quantity;
  }, 0);

  const totalSavings = medicines.reduce((acc, med) => {
    if (med.selectedVariant === 'generic' && med.genericAlternative) {
      const prescribedCost = med.unitPrice * med.quantity;
      const genericCost = med.genericAlternative.price * med.quantity;
      return acc + (prescribedCost - genericCost);
    }
    return acc;
  }, 0);

  const hasColdChain = medicines.some((m) => m.isColdChain);
  const hasScheduleH = medicines.some((m) => m.isPrescriptionRequired);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Banner: Product Identity & Mission Reassurance */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-5 sm:p-6 rounded-3xl border border-slate-700 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="emerald" size="sm" icon={<Zap className="w-3.5 h-3.5" />}>
                Prescription Intelligence Complete
              </Badge>
              <span className="text-xs text-slate-300 font-medium">4 Medicines Identified</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Review Your Extracted Medicines
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              MediRush has mapped all active salts and verified generic alternatives. Next, we will find the fastest way to fulfill your prescription across our network of certified pharmacies.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReupload}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-slate-300 hover:text-white hover:bg-slate-700 self-start sm:self-auto shrink-0"
          >
            Re-upload
          </Button>
        </div>
      </div>

      {/* Prescription Meta Banner */}
      <Card className="bg-white border-slate-200/80 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{prescription.doctorName}</span>
                <span className="text-[10px] text-slate-500">Reg: {prescription.doctorRegNo}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                <Hospital className="w-3 h-3" />
                <span>{prescription.clinicName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span><strong>Patient:</strong> {prescription.patientName} ({prescription.patientAge}y, {prescription.patientGender})</span>
            </div>
            <div>
              <span><strong>Date:</strong> {prescription.date}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Medicines List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Prescribed Medicines ({medicines.length})
          </h2>
          <span className="text-xs text-slate-500">
            Adjust quantity or switch to generics below
          </span>
        </div>

        {medicines.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-slate-500 text-sm mb-4">No medicines in current prescription list.</p>
            <Button variant="secondary" onClick={onReupload}>Reset to Demo Prescription</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {medicines.map((med) => (
              <MedicineCard
                key={med.id}
                medicine={med}
                onUpdateQuantity={onUpdateQuantity}
                onToggleVariant={onToggleVariant}
                onRemove={onRemoveMedicine}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fulfillment Pre-Flight Notice & Safety Alerts */}
      <div className="space-y-3">
        {hasColdChain && (
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            <span>
              <strong>Cold-Chain Protected:</strong> Insulin items will be dispatched in insulated ice-pack temperature monitored packaging (2°C - 8°C).
            </span>
          </div>
        )}

        {hasScheduleH && (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Schedule-H Rx Verification:</strong> A partner pharmacist will inspect the prescription image before physical dispensing.
            </span>
          </div>
        )}
      </div>

      {/* Sticky Bottom Order Bar */}
      <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {medicines.length} Medicines ({totalItems} Units)
              </span>
              {totalSavings > 0 && (
                <Badge variant="emerald" size="sm">
                  ₹{totalSavings.toFixed(0)} Generic Savings
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xs text-slate-400">Estimated Total:</span>
              <span className="text-2xl font-black text-white">
                ₹{estimatedTotal.toFixed(0)}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                (Standard taxes & packing included)
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={onOrderMedicines}
              disabled={medicines.length === 0}
              className="w-full sm:w-auto text-base font-bold px-8 shadow-lg shadow-emerald-700/30"
            >
              Order Medicines
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
