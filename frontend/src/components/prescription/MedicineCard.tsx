import React from 'react';
import { Pill, Snowflake, ShieldAlert, Check, Plus, Minus, Trash2, ArrowDown, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { ExtractedMedicine } from '../../types/prescription';

interface MedicineCardProps {
  medicine: ExtractedMedicine;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onToggleVariant: (id: string, variant: 'prescribed' | 'generic') => void;
  onRemove: (id: string) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onUpdateQuantity,
  onToggleVariant,
  onRemove,
}) => {
  const isGenericSelected = medicine.selectedVariant === 'generic' && medicine.genericAlternative;
  const currentPrice = isGenericSelected
    ? medicine.genericAlternative!.price * medicine.quantity
    : medicine.unitPrice * medicine.quantity;

  return (
    <Card className="bg-white border-slate-200/90 hover:border-slate-300 transition-all shadow-sm">
      {/* Header: Name, Strength, Badges & Remove */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {medicine.name}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {medicine.strength}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({medicine.form})
            </span>
          </div>

          {/* Safety Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {medicine.isPrescriptionRequired && (
              <Badge variant="amber" size="sm" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
                Prescription Required
              </Badge>
            )}
            {medicine.isColdChain && (
              <Badge variant="blue" size="sm" icon={<Snowflake className="w-3.5 h-3.5" />}>
                Cold Chain (2°C - 8°C)
              </Badge>
            )}
          </div>
        </div>

        <button
          onClick={() => onRemove(medicine.id)}
          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors self-end sm:self-auto cursor-pointer"
          title="Remove Medicine"
          aria-label={`Remove ${medicine.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Salt / Composition Intelligence Mapping */}
      <div className="my-3.5 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase text-[10px] tracking-wider mb-1">
          <Pill className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Salt / Composition</span>
          <ArrowDown className="w-3 h-3 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-800 text-xs sm:text-[13px] leading-snug">
          {medicine.saltComposition}
        </p>
      </div>

      {/* Prescription Instructions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 mb-4 bg-slate-50/50 p-2.5 rounded-xl">
        <div>
          <span className="text-slate-400 block text-[11px]">Dosage</span>
          <span className="font-semibold text-slate-800">{medicine.dosage}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Frequency</span>
          <span className="font-semibold text-slate-800">{medicine.frequency}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Duration</span>
          <span className="font-semibold text-slate-800">{medicine.duration}</span>
        </div>
      </div>

      {/* Generic Alternative & Savings Opportunity */}
      {medicine.genericAlternative && (
        <div className="mb-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 to-teal-50/30 p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">
                  Generic Alternative Available
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {medicine.genericAlternative.name}
              </p>
              <span className="text-[11px] text-slate-500">
                Mfg: {medicine.genericAlternative.manufacturer}
              </span>
            </div>

            {/* Price Comparison & Variant Selector */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 line-through block">
                  ₹{(medicine.unitPrice * medicine.quantity).toFixed(0)}
                </span>
                <span className="text-sm font-extrabold text-emerald-700">
                  ₹{(medicine.genericAlternative.price * medicine.quantity).toFixed(0)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Save ₹{(medicine.genericAlternative.savings).toFixed(0)}
                </span>
              </div>

              <Button
                size="sm"
                variant={isGenericSelected ? 'primary' : 'outline'}
                onClick={() => onToggleVariant(medicine.id, isGenericSelected ? 'prescribed' : 'generic')}
                className="text-xs font-semibold shrink-0"
              >
                {isGenericSelected ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" /> Selected Generic
                  </>
                ) : (
                  'Switch to Generic'
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-emerald-100/70">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Generic alternatives should be confirmed with your doctor or pharmacist.
            </span>
          </div>
        </div>
      )}

      {/* Footer: Quantity Controls & Subtotal */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Quantity:</span>
          <div className="inline-flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => onUpdateQuantity(medicine.id, Math.max(1, medicine.quantity - 1))}
              disabled={medicine.quantity <= 1}
              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-800 text-xs min-w-[28px] text-center">
              {medicine.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(medicine.id, medicine.quantity + 1)}
              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Est. Subtotal</span>
          <span className="text-base font-extrabold text-slate-900">
            ₹{currentPrice.toFixed(0)}
          </span>
        </div>
      </div>
    </Card>
  );
};
