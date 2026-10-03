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
        // Modular Ready State for future order tracking integration
        <Card className="border-emerald-200/80 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Order #{order.orderNumber}
                </span>
                <Badge variant="teal" size="sm">
                  {order.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-800">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'} in fulfillment
              </p>
            </div>

            {order.estimatedDeliveryTime && (
              <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 text-slate-700">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Est. Delivery: <strong>{order.estimatedDeliveryTime}</strong></span>
              </div>
            )}
          </div>

          <div className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Prescription Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>{order.pharmacyCount || 1} Pharmacy Matched</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-slate-400" />
                <span>Packing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>Delivery</span>
              </div>
            </div>
          </div>

          {onViewOrderDetails && (
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewOrderDetails(order.id)}
              >
                View Order Details
              </Button>
            </div>
          )}
        </Card>
      )}
    </section>
  );
};
