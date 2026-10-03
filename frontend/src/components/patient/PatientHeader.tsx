import React, { useEffect, useState } from 'react';
import { MapPin, Bell, ShieldCheck, ChevronDown } from 'lucide-react';
import type { PatientProfile, PatientView } from '../../types/patient';
import { checkBackendHealth } from '../../services/prescriptionService';

interface PatientHeaderProps {
  profile: PatientProfile;
  currentView: PatientView;
  onNavigate: (view: PatientView) => void;
  onOpenChemistPortal?: () => void;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  profile,
  currentView,
  onNavigate,
  onOpenChemistPortal,
}) => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then((isHealthy) => setBackendOnline(isHealthy));
    const interval = setInterval(() => {
      checkBackendHealth().then((isHealthy) => setBackendOnline(isHealthy));
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
              aria-label="MediRush Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                  Medi<span className="text-emerald-600">Rush</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase block">
                  Prescription Intelligence
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('upload-prescription')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'upload-prescription'
                    ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Upload Prescription
              </button>
              <button
                onClick={() => onNavigate('my-orders')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'my-orders'
                    ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => onNavigate('nearby-pharmacy')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'nearby-pharmacy'
                    ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Pharmacies
              </button>
              {onOpenChemistPortal && (
                <button
                  onClick={onOpenChemistPortal}
                  className="px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-teal-700 bg-teal-50 hover:bg-teal-100 font-bold border border-teal-200/80 flex items-center gap-1.5"
                >
                  <span>🏪 Chemist Station</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </button>
              )}
            </nav>
          </div>

          {/* Location & Patient Info */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Backend Connection Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all bg-slate-50 border-slate-200">
              <span className={`w-2 h-2 rounded-full shrink-0 ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-600">
                {backendOnline ? 'Backend API Connected' : 'Connecting Backend...'}
              </span>
            </div>

            {/* Delivery Location Indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 hover:bg-slate-100 px-3.5 py-2 rounded-xl text-xs text-slate-700 border border-slate-200/60 max-w-[240px] truncate transition-colors">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate text-left">
                <span className="font-semibold text-slate-900 block leading-tight truncate">
                  {profile.defaultLocation.city}
                </span>
                <span className="text-slate-500 text-[11px] block leading-tight truncate">
                  {profile.defaultLocation.address}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </div>

            {/* Notifications */}
            <button
              onClick={() => onNavigate('my-orders')}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label={`Notifications (${profile.unreadNotificationsCount} unread)`}
            >
              <Bell className="w-5 h-5" />
              {profile.unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-600 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Patient Profile Chip */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-sm flex items-center justify-center shrink-0">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-slate-900 block leading-tight">
                  {profile.name}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium block leading-tight">
                  Verified Patient
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Location Sub-bar */}
        <div className="sm:hidden pb-3 pt-1 flex items-center gap-1.5 text-xs text-slate-600 border-t border-slate-100">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-medium text-slate-800 truncate">
            {profile.defaultLocation.city} — {profile.defaultLocation.address}
          </span>
        </div>
      </div>
    </header>
  );
};
