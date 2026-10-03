import { Package, ArrowRight, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { INITIAL_HISTORICAL_ORDERS } from '../../services/orderService';
import type { ActiveOrder } from '../../types/patient';

interface OrdersPageProps {
  activeOrder: ActiveOrder | null;
  onTrackOrder: (order: ActiveOrder) => void;
  onUploadPrescription: () => void;
  onBackToDashboard: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  activeOrder,
  onTrackOrder,
  onUploadPrescription,
  onBackToDashboard,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Medicine Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active multi-pharmacy fulfillment and view past prescription deliveries
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBackToDashboard}
          className="text-slate-600"
        >
          Back
        </Button>
      </div>

      {/* 1. Active Order Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Active Order</h2>
            {activeOrder && (
              <Badge variant="emerald" size="sm">
                Live Fulfillment
              </Badge>
            )}
          </div>
        </div>

        {activeOrder ? (
          <Card className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border-2 border-emerald-500/50 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Order #{activeOrder.orderNumber}
                  </span>
                  <Badge variant="emerald" size="sm">
                    {activeOrder.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {activeOrder.medicines.length} Medicines ({activeOrder.pharmacyMatches.length} Assigned {activeOrder.pharmacyMatches.length === 1 ? 'Pharmacy' : 'Pharmacies'})
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Est. Delivery: <strong>~{activeOrder.estimatedDeliveryMinutes} mins</strong></span>
              </div>
            </div>

            {/* Medicines Mini List */}
            <div className="py-4 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Items In Delivery:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeOrder.medicines.map((m) => (
                  <span key={m.id} className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-medium text-slate-800">
                    {m.name} ({m.quantity} {m.form}s)
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Total: <strong className="text-slate-900 text-sm">₹{activeOrder.totalAmount.toFixed(0)}</strong> • Delivery OTP: <strong className="text-emerald-700">{activeOrder.deliveryOtp}</strong>
              </span>

              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => onTrackOrder(activeOrder)}
                className="w-full sm:w-auto font-bold"
              >
                Track Live Order
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-8 border-dashed border-slate-300">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No active orders</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
              You do not have any active prescription order currently in fulfillment.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={onUploadPrescription}
            >
              Upload Prescription
            </Button>
          </Card>
        )}
      </section>

      {/* 2. Previous Orders Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Previous Orders</h2>

        <div className="space-y-3">
          {INITIAL_HISTORICAL_ORDERS.map((hist) => (
            <Card key={hist.id} className="bg-white border-slate-200 p-5 hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Order #{hist.orderNumber}</span>
                    <Badge variant="emerald" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                      Delivered
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{hist.medicinesSummary}</p>
                  <span className="text-[11px] text-slate-400 block">
                    Delivered on {hist.date} • {hist.pharmaciesCount} Pharmacy
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="font-black text-slate-900 text-sm sm:text-base">
                    ₹{hist.totalAmount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUploadPrescription}
                    className="text-xs"
                  >
                    Reorder
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
};
