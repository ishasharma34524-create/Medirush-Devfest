import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Truck, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Snowflake,
  Timer
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { PharmacyMap } from '../map/PharmacyMap';
import { PATIENT_DEFAULT_COORDS } from '../../data/patient/demoPharmacies';
import { advanceOrderStatus } from '../../services/orderService';
import type { ActiveOrder, OrderStatus } from '../../types/patient';

interface OrderTrackingScreenProps {
  order: ActiveOrder;
  onUpdateOrder: (updated: ActiveOrder) => void;
  onBackToDashboard: () => void;
  onViewAllOrders: () => void;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  order,
  onUpdateOrder,
  onBackToDashboard,
  onViewAllOrders,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);

  // Quick simulation helper for hackathon judges to step through the order
  const handleSimulateNextStep = () => {
    setIsSimulating(true);
    const statusSequence: OrderStatus[] = [
      'placed',
      'verification',
      'confirmed',
      'preparing',
      'out_for_delivery',
      'delivered'
    ];
    const currentIndex = statusSequence.indexOf(order.status);
    const nextIndex = Math.min(statusSequence.length - 1, currentIndex + 1);
    const updated = advanceOrderStatus(order, statusSequence[nextIndex]);
    onUpdateOrder(updated);
    setTimeout(() => setIsSimulating(false), 300);
  };

  const isDelivered = order.status === 'delivered';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBackToDashboard}
          className="text-slate-600 self-start"
        >
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-2">
          {/* Demo Step-Through Button for Judges */}
          {!isDelivered && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Timer className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleSimulateNextStep}
              disabled={isSimulating}
              className="text-xs bg-emerald-50/50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-semibold"
            >
              Simulate Next Status Step
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllOrders}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            My Orders
          </Button>
        </div>
      </div>

      {/* Main Order Header Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                Order #{order.orderNumber}
              </span>
              <span className="text-xs text-slate-400">Placed at {order.createdAt}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
              {isDelivered
                ? 'Prescription Order Delivered!'
                : order.status === 'out_for_delivery'
                ? 'Out for Rush Delivery!'
                : 'Fulfillment In Progress'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Coordinating across {order.pharmacyMatches.length} partner {order.pharmacyMatches.length === 1 ? 'pharmacy' : 'pharmacies'} for rapid doorstep handover.
            </p>
          </div>

          {/* Delivery OTP & Est Time */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Delivery OTP
              </span>
              <span className="text-xl font-black text-emerald-400 tracking-widest block">
                {order.deliveryOtp}
              </span>
            </div>

            <div className="bg-emerald-950/80 border border-emerald-800/80 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
                Estimated
              </span>
              <span className="text-xl font-black text-white block">
                {isDelivered ? 'Done' : `~${order.estimatedDeliveryMinutes}m`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Step Progression Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200 p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Live Order Timeline</span>
            </h2>

            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {order.timeline.map((step, idx) => {
                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    {/* Timeline Node Icon */}
                    <div
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        step.isComplete
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : step.isCurrent
                          ? 'bg-white border-emerald-600 text-emerald-600 ring-4 ring-emerald-100 animate-pulse'
                          : 'bg-white border-slate-300 text-slate-300'
                      }`}
                    >
                      {step.isComplete ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 -mt-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className={`text-sm font-bold ${step.isComplete || step.isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </h3>
                        {step.time && (
                          <span className="text-[11px] font-medium text-slate-400">
                            {step.time}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 leading-relaxed ${step.isComplete || step.isCurrent ? 'text-slate-600' : 'text-slate-400'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Medicines & Split Pharmacy Breakdown */}
          <Card className="bg-white border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>Fulfillment Breakdown ({order.medicines.length} Medicines)</span>
            </h2>

            <div className="space-y-3">
              {order.pharmacyMatches.map((match, i) => (
                <div key={match.pharmacy.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        P{i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900">{match.pharmacy.name}</h3>
                        <p className="text-[11px] text-slate-500">{match.pharmacy.address} • {match.pharmacy.distanceKm} km</p>
                      </div>
                    </div>
                    <Badge variant="emerald" size="sm">Verified & Dispensed</Badge>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                    {match.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200/60">
                        <span className="font-semibold text-slate-800">{item.name} ({item.strength})</span>
                        <div className="flex items-center gap-2">
                          {item.isColdChain && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                              <Snowflake className="w-3 h-3" /> Cold Chain
                            </span>
                          )}
                          <span className="text-slate-500 font-medium">{item.quantity} Units</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Summary, Map & Actions */}
        <div className="space-y-6">
          {/* Live Delivery Route Map */}
          <Card padded={false} className="overflow-hidden border-slate-200 shadow-sm">
            <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Fulfillment Routing</span>
              </span>
              <Badge variant="emerald" size="sm">
                {order.pharmacyMatches.length} Assigned
              </Badge>
            </div>
            <PharmacyMap
              pharmacies={order.pharmacyMatches.map((m) => m.pharmacy)}
              activePharmacyIds={order.pharmacyMatches.map((m) => m.pharmacy.id)}
              patientCoords={PATIENT_DEFAULT_COORDS}
              height="200px"
              showRoutes={true}
            />
          </Card>

          {/* Delivery Details Card */}
          <Card className="bg-white border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Delivery Details</span>
            </h2>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block">Rahul Sharma</span>
              <p className="leading-relaxed">{order.deliveryAddress}</p>
              <span className="text-emerald-700 font-medium block pt-1">Contact: +91 98765 43210</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Payment Mode:</span>
              <span className="font-bold text-slate-800">Pay on Delivery (Cash / UPI)</span>
            </div>

            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-700">Total Amount:</span>
              <span className="text-lg font-black text-slate-900">₹{order.totalAmount.toFixed(0)}</span>
            </div>
          </Card>

          {/* Safety & Protocol Banner */}
          <Card className="bg-emerald-50/60 border-emerald-200 p-4 space-y-2 text-xs text-emerald-950">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>MediRush Quality Assurance</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Every parcel is digitally tamper-sealed. Present OTP <strong>{order.deliveryOtp}</strong> to the delivery partner upon arrival.
            </p>
          </Card>

          {/* Action CTAs */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={onBackToDashboard}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={onViewAllOrders}
              className="text-xs text-slate-500"
            >
              View Order History
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};
