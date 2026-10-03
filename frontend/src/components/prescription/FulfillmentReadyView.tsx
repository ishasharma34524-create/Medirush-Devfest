import React, { useState } from 'react';
import {
  Store,
  Zap,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  RotateCcw,
  Radio,
  CheckCircle2,
  Bike,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { ExtractedMedicine, DemoPrescriptionData } from '../../types/prescription';
import {
  createOrderApi,
  broadcastOrderApi,
  confirmOrderApi,
  dispatchOrderApi,
  type PharmacyNearbyItem,
} from '../../services/backendService';

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
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);
  const [backendOrder, setBackendOrder] = useState<any>(null);
  const [matchingPharmacies, setMatchingPharmacies] = useState<PharmacyNearbyItem[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [dispatchInfo, setDispatchInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalItems = medicines.reduce((acc, med) => acc + med.quantity, 0);
  const estimatedTotal = medicines.reduce((acc, med) => {
    const isGeneric = med.selectedVariant === 'generic' && med.genericAlternative;
    const price = isGeneric ? med.genericAlternative!.price : med.unitPrice;
    return acc + price * med.quantity;
  }, 0);

  // Live broadcast triggered to backend Express API
  const handleLiveBroadcast = async () => {
    try {
      setIsBroadcasting(true);
      setErrorMsg(null);

      // 1. Create Order on Backend
      const orderPayload = {
        patientId: 'patient_demo_101',
        medicines: medicines.map((m) => ({
          brandName: m.name,
          salt: m.saltComposition,
          strength: m.strength,
          quantity: m.quantity,
        })),
        deliveryLocation: {
          address: 'Old Palasia, Indore, MP',
          latitude: 22.7244,
          longitude: 75.8839,
        },
      };

      const createRes = await createOrderApi(orderPayload);
      const orderId = createRes.order?._id;

      // 2. Broadcast Order to nearby pharmacies via backend
      const broadcastRes = await broadcastOrderApi(orderId, 15);

      setBackendOrder(broadcastRes.order || createRes.order);
      setMatchingPharmacies(broadcastRes.matchingPharmacies || []);
      setBroadcastDone(true);
    } catch (err: any) {
      console.error('[Live Broadcast Error]', err);
      setErrorMsg(err?.message || 'Failed to connect to backend server on http://localhost:5000');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Confirm and dispatch via backend
  const handleConfirmAndDispatch = async (pharmacyId: string) => {
    if (!backendOrder?._id) return;
    try {
      setIsConfirming(true);
      setErrorMsg(null);

      // 1. Confirm pharmacy
      await confirmOrderApi(backendOrder._id, pharmacyId);

      // 2. Dispatch order with rider
      const dispatchRes = await dispatchOrderApi(backendOrder._id);
      setDispatchInfo(dispatchRes.order);
    } catch (err: any) {
      console.error('[Confirm & Dispatch Error]', err);
      setErrorMsg(err?.message || 'Failed to confirm/dispatch order');
    } finally {
      setIsConfirming(false);
    }
  };

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
          Prescription intelligence verified {medicines.length} medicines. MediRush is now prepared to connect directly to the backend to broadcast and match local certified pharmacies.
        </p>

        {/* Order Intelligence Summary Box */}
        <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left text-xs space-y-2.5">
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
            <span className="font-medium text-slate-700">Old Palasia, Indore</span>
          </div>
        </div>

        {/* Error notification if backend is offline */}
        {errorMsg && (
          <div className="max-w-md mx-auto mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{errorMsg} (Make sure the backend is running with: <code>npm run dev</code> inside <code>backend/</code>)</span>
          </div>
        )}

        {/* Live Backend Broadcast Section */}
        {!broadcastDone ? (
          <div className="max-w-md mx-auto mb-8 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              Live Backend Broadcast
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Query real-time nearby pharmacies stored in MongoDB and calculate fastest delivery distance.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleLiveBroadcast}
              disabled={isBroadcasting}
              className="w-full font-bold shadow-md shadow-emerald-600/20"
            >
              {isBroadcasting ? "Broadcasting to Pharmacies..." : "📡 Broadcast to Live Pharmacies"}
            </Button>
          </div>
        ) : (
          <div className="max-w-md mx-auto mb-8 p-5 bg-slate-50 border border-emerald-300 rounded-2xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Broadcast Status: {backendOrder?.status || "BROADCASTING"}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Order #{backendOrder?._id?.slice(-6)}
              </span>
            </div>

            {/* Rider Dispatched State */}
            {dispatchInfo ? (
              <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Bike className="w-5 h-5 text-emerald-700 animate-bounce" />
                  <span>Rider Dispatched! Status: {dispatchInfo.status}</span>
                </div>
                <div className="text-xs text-emerald-800 space-y-1">
                  <p><strong>Rider:</strong> {dispatchInfo.rider?.name} ({dispatchInfo.rider?.vehicle})</p>
                  <p><strong>Vehicle Number:</strong> {dispatchInfo.rider?.vehicleNumber}</p>
                  <p><strong>Estimated Arrival:</strong> {dispatchInfo.etaMinutes || 15} minutes</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Matching Pharmacies ({matchingPharmacies.length} found):
                </p>
                <div className="space-y-2">
                  {matchingPharmacies.map((item, idx) => (
                    <div
                      key={item.pharmacy.id || idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{item.pharmacy.name}</p>
                        <p className="text-[11px] text-slate-500">{item.distanceKm} km away • Online</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmAndDispatch(item.pharmacy.id)}
                        disabled={isConfirming}
                        className="text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        {isConfirming ? "Processing..." : "Accept & Dispatch"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Highlights */}
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
