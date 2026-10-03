import React from 'react';
import { Store, Zap, ShieldCheck, MapPin, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { ExtractedMedicine, DemoPrescriptionData } from '../../types/prescription';

interface FulfillmentReadyViewProps {
  prescription: DemoPrescriptionData;
  medicines: ExtractedMedicine[];
  onBackToDashboard: () => void;
  onRestartDemo: () => void;
}

export const FulfillmentReadyView: React.FC<FulfillmentReadyViewProps> = ({
  medicines,
  onBackToDashboard,
  onRestartDemo,
}) => {
  const totalItems = medicines.reduce((acc, med) => acc + med.quantity, 0);
  const estimatedTotal = medicines.reduce((acc, med) => {
    const isGeneric = med.selectedVariant === 'generic' && med.genericAlternative;
    const price = isGeneric ? med.genericAlternative!.price : med.unitPrice;
    return acc + price * med.quantity;
  }, 0);

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-6">
      <Card className="bg-white border-emerald-200 shadow-lg p-6 sm:p-10 text-center">
        {/* Animated Beacon Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-700/30">
            <Store className="w-10 h-10" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200">
          <Zap className="w-3.5 h-3.5" />
          <span>Fulfillment Broadcast Ready</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Finding Your Fastest Pharmacy Route
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
          Prescription intelligence verified {medicines.length} medicines. MediRush is now prepared to search local certified pharmacies and calculate the fastest single or split-order fulfillment route.
        </p>

        {/* Order Intelligence Summary Box */}
        <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 text-left text-xs space-y-2.5">
          <div className="flex justify-between items-center text-slate-600">
            <span>Prescription Status:</span>
            <Badge variant="emerald" size="sm">Verified & Structured</Badge>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Medicines in Batch:</span>
            <span className="font-bold text-slate-800">{medicines.length} Items ({totalItems} Units)</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Estimated Cart Total:</span>
            <span className="font-bold text-slate-900 text-sm">₹{estimatedTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Target Delivery Zone:</span>
            </span>
            <span className="font-medium text-slate-700">Bellandur, Bengaluru</span>
          </div>
        </div>

        {/* Next Step Teaser */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left mb-8">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <Clock className="w-4 h-4 text-emerald-700 mb-1" />
            <span className="font-bold text-slate-900 block">Fastest Match</span>
            <span className="text-slate-500">Live multi-pharmacy stock inquiry</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100">
            <ShieldCheck className="w-4 h-4 text-teal-700 mb-1" />
            <span className="font-bold text-slate-900 block">Direct Verification</span>
            <span className="text-slate-500">Registered pharmacist checkout</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
            <Zap className="w-4 h-4 text-blue-700 mb-1" />
            <span className="font-bold text-slate-900 block">Unified Dispatch</span>
            <span className="text-slate-500">Doorstep delivery coordination</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onBackToDashboard}
            className="w-full sm:w-auto px-6 font-semibold"
          >
            Back to Patient Dashboard
          </Button>

          <Button
            variant="outline"
            size="lg"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={onRestartDemo}
            className="w-full sm:w-auto text-slate-700"
          >
            Test Prescription Flow Again
          </Button>
        </div>
      </Card>
    </div>
  );
};
