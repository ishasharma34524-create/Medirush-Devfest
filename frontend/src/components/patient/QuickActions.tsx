import React from 'react';
import {
  UploadCloud,
  Package,
  Store,
  Stethoscope,
  ArrowRight,
  FileText,
  Sparkles,
  Bell
} from 'lucide-react';
import { Card } from '../common/Card';
import type { PatientView } from '../../types/patient';

interface QuickActionsProps {
  onNavigate: (view: PatientView) => void;
}

interface ActionItem {
  id: PatientView;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentBg: string;
  accentText: string;
  hoverBorder: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions: ActionItem[] = [
    {
      id: 'upload-prescription',
      title: 'Upload Prescription',
      description: 'Upload a prescription and let MediRush identify the medicines.',
      icon: <UploadCloud className="w-6 h-6" />,
      accentBg: 'bg-emerald-50 text-emerald-700',
      accentText: 'text-emerald-700',
      hoverBorder: 'hover:border-emerald-300'
    },
    {
      id: 'report-simplifier',
      title: 'Report Simplifier',
      description: 'Decode blood tests & lab reports into clear Hinglish.',
      icon: <FileText className="w-6 h-6" />,
      accentBg: 'bg-teal-50 text-teal-700',
      accentText: 'text-teal-700',
      hoverBorder: 'hover:border-teal-300'
    },
    {
      id: 'home-remedies',
      title: 'Ayurvedic Gharelu Nuskhe',
      description: 'Evidence-based home remedies, herbal kadhas & safety advice.',
      icon: <Sparkles className="w-6 h-6" />,
      accentBg: 'bg-amber-50 text-amber-700',
      accentText: 'text-amber-700',
      hoverBorder: 'hover:border-amber-300'
    },
    {
      id: 'medicine-reminder',
      title: 'Medicine Reminder',
      description: 'Daily pill tracker with voice alerts & family WhatsApp share.',
      icon: <Bell className="w-6 h-6" />,
      accentBg: 'bg-indigo-50 text-indigo-700',
      accentText: 'text-indigo-700',
      hoverBorder: 'hover:border-indigo-300'
    },
    {
      id: 'my-orders',
      title: 'My Orders',
      description: 'View active and previous medicine orders.',
      icon: <Package className="w-6 h-6" />,
      accentBg: 'bg-blue-50 text-blue-700',
      accentText: 'text-blue-700',
      hoverBorder: 'hover:border-blue-300'
    },
    {
      id: 'nearby-pharmacy',
      title: 'Nearby Pharmacy',
      description: 'Find nearby pharmacies and live stock.',
      icon: <Store className="w-6 h-6" />,
      accentBg: 'bg-cyan-50 text-cyan-700',
      accentText: 'text-cyan-700',
      hoverBorder: 'hover:border-cyan-300'
    },
    {
      id: 'symptom-checker',
      title: 'Symptom Checker',
      description: 'Get general AI-assisted guidance for symptoms.',
      icon: <Stethoscope className="w-6 h-6" />,
      accentBg: 'bg-purple-50 text-purple-700',
      accentText: 'text-purple-700',
      hoverBorder: 'hover:border-purple-300'
    }
  ];


  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Quick Actions
          </h2>
          <p className="text-xs text-slate-500">
            Fulfill your healthcare and prescription needs in one tap
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Card
            key={action.id}
            hoverable
            onClick={() => onNavigate(action.id)}
            className={`cursor-pointer transition-all duration-200 group flex flex-col justify-between ${action.hoverBorder}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.accentBg} transition-transform group-hover:scale-110`}>
                  {action.icon}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100 transition-colors">
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 text-base mb-1.5 group-hover:text-emerald-700 transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {action.description}
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-slate-900">
              <span>Open</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
