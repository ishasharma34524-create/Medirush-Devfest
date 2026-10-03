import React from 'react';
import { Package, UploadCloud, Clock, CheckCircle, Truck, Store } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { ActiveOrder } from '../../types/patient';

interface ActiveOrderCardProps {
  order?: ActiveOrder | null;
  onUploadClick: () => void;
  onViewOrderDetails?: (orderId: string) => void;
}

export const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({
  order = null,
  onUploadClick,
  onViewOrderDetails,
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Active Order
          </h2>
          {order && (
            <Badge variant="emerald" size="sm">
              Live
            </Badge>
          )}
        </div>
      </div>

      {!order ? (
        // Empty State (Part 1 Foundation)
        <Card className="text-center py-8 sm:py-10 px-6 border-dashed border-slate-300/80 bg-white">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3.5">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              No active orders
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed max-w-sm">
              When you upload a prescription and confirm an order, its fulfillment progress and pharmacy updates will be displayed here.
            </p>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<UploadCloud className="w-4 h-4 text-emerald-700" />}
              onClick={onUploadClick}
              className="text-emerald-800 font-semibold"
            >
              Upload Prescription
            </Button>
          </div>
        </Card>
      ) : (
        // Modular Ready State for live order tracking
        <Card className="border-emerald-200/90 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/20 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Order #{order.orderNumber}
                </span>
                <Badge variant="emerald" size="sm">
                  {order.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {order.medicines.length} Medicines • {order.pharmacyMatches.length} {order.pharmacyMatches.length === 1 ? 'Pharmacy' : 'Pharmacies'} Fulfilling
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Est. Delivery: <strong>~{order.estimatedDeliveryMinutes}m</strong></span>
            </div>
          </div>

          <div className="py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Rx Verified</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>{order.pharmacyMatches.length} Assigned</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Package className={`w-4 h-4 ${['preparing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Preparing</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Truck className={`w-4 h-4 ${['out_for_delivery', 'delivered'].includes(order.status) ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Delivery</span>
              </div>
            </div>
          </div>

          {onViewOrderDetails && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                OTP: <strong className="text-slate-900">{order.deliveryOtp}</strong> • Total: <strong className="text-slate-900">₹{order.totalAmount.toFixed(0)}</strong>
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onViewOrderDetails(order.id)}
                className="font-semibold text-xs"
              >
                Track Live Order
              </Button>
            </div>
          )}
        </Card>
      )}
    </section>
  );
};
