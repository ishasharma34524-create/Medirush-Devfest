import React from 'react';
import { UploadCloud, Stethoscope, Sparkles, Clock, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface DashboardHeroProps {
  onUploadClick: () => void;
  onSymptomClick: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  onUploadClick,
  onSymptomClick,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-10 lg:p-12 shadow-xl shadow-slate-950/10 border border-slate-800">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        {/* Value Prop Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
          <Badge
            variant="emerald"
            size="md"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          >
            Intelligent Multi-Pharmacy Routing
          </Badge>
          <span className="hidden sm:inline text-slate-500 text-xs">•</span>
          <span className="text-xs text-slate-400 font-medium">
            Zero Multiple-Pharmacy Running
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-4">
          Get your medicines without visiting{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-teal-400">
            pharmacy after pharmacy.
          </span>
        </h1>

        {/* Supporting Subtext */}
        <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8 max-w-2xl">
          Upload your prescription and MediRush will help find the fastest way to get all your medicines.
        </p>

        {/* Primary and Secondary Call To Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-8">
          <Button
            size="lg"
            variant="primary"
            leftIcon={<UploadCloud className="w-5 h-5" />}
            onClick={onUploadClick}
            className="shadow-lg shadow-emerald-900/40 text-base font-semibold"
          >
            Upload Prescription
          </Button>

          <Button
            size="lg"
            variant="outline"
            leftIcon={<Stethoscope className="w-5 h-5 text-teal-400" />}
            onClick={onSymptomClick}
            className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600 focus:ring-slate-500"
          >
            Check Symptoms
          </Button>
        </div>

        {/* Trust & Guarantee Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Optimized for fastest fulfillment</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Certified verified pharmacies</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Complete prescription coordination</span>
          </div>
        </div>
      </div>
    </section>
  );
};
