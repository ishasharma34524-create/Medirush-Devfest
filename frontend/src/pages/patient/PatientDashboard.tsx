import React from 'react';
import { DashboardHero } from '../../components/patient/DashboardHero';
import { QuickActions } from '../../components/patient/QuickActions';
import { ActiveOrderCard } from '../../components/patient/ActiveOrderCard';
import { MedicinesPreview } from '../../components/patient/MedicinesPreview';
import type { ActiveOrder, PrescribedMedicine, PatientView } from '../../types/patient';
import { ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card';

interface PatientDashboardProps {
  activeOrder: ActiveOrder | null;
  medicines: PrescribedMedicine[];
  onNavigate: (view: PatientView) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  activeOrder,
  medicines,
  onNavigate,
}) => {
  const handleUploadClick = () => {
    onNavigate('upload-prescription');
  };

  const handleSymptomClick = () => {
    onNavigate('symptom-checker');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Main Hero Section */}
      <DashboardHero
        onUploadClick={handleUploadClick}
        onSymptomClick={handleSymptomClick}
      />

      {/* 2. Quick Actions Grid */}
      <QuickActions onNavigate={onNavigate} />

      {/* 3. Operational Sections: Active Orders & Prescribed Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveOrderCard
          order={activeOrder}
          onUploadClick={handleUploadClick}
          onViewOrderDetails={() => onNavigate('order-tracking')}
        />
        <MedicinesPreview
          medicines={medicines}
          onUploadClick={handleUploadClick}
        />
      </div>

      {/* 4. MediRush Fulfillment Flow Explanation (Healthcare Architecture) */}
      <section className="pt-2">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            How MediRush Works
          </h2>
          <p className="text-xs text-slate-500">
            Solving the multi-pharmacy prescription puzzle seamlessly
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padded className="bg-white border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">1. Smart Prescription Read</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload any handwritten or digital doctor's prescription for instant salt extraction.
            </p>
          </Card>

          <Card padded className="bg-white border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">2. Multi-Pharmacy Split</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When a single pharmacy lacks all meds, MediRush searches the network for fastest fulfillment.
            </p>
          </Card>

          <Card padded className="bg-white border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">3. Pharmacist Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Registered pharmacists verify Schedule-H, dosage requirements, and cold-chain integrity.
            </p>
          </Card>

          <Card padded className="bg-white border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">4. Coordinated Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All items are collected and brought straight to your doorstep in one consolidated flow.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};
