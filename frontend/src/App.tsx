import { useState } from 'react';
import { PatientHeader } from './components/patient/PatientHeader';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PrescriptionFlow } from './pages/patient/PrescriptionFlow';
import { OrderTrackingScreen } from './components/fulfillment/OrderTrackingScreen';
import { OrdersPage } from './pages/patient/OrdersPage';
import { NearbyPharmaciesPage } from './pages/patient/NearbyPharmaciesPage';
import { MedicalReportSimplifierPage } from './pages/patient/MedicalReportSimplifierPage';
import { HomeRemediesPage } from './pages/patient/HomeRemediesPage';
import { MedicineReminderPage } from './pages/patient/MedicineReminderPage';
import { PlaceholderPage } from './pages/patient/PlaceholderPage';

import { ChemistDashboard } from './pages/chemist/ChemistDashboard';
import type { PatientView, ActiveOrder } from './types/patient';
import { mockPatientProfile, initialMedicines } from './data/patient/mockPatientData';
import { Stethoscope } from 'lucide-react';

export function App() {
  const [currentPortal, setCurrentPortal] = useState<'patient' | 'chemist'>('patient');
  const [currentView, setCurrentView] = useState<PatientView>('dashboard');
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);

  const handleNavigate = (view: PatientView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderConfirmed = (newOrder: ActiveOrder) => {
    setActiveOrder(newOrder);
    setCurrentView('order-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Global Top Portal Bar */}
      <div className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">MediRush Live Healthcare System:</span>
            <span className="text-slate-400 hidden md:inline">
              Switch between Patient App & Live Chemist Station
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPortal('patient')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                currentPortal === 'patient'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              🧑 Patient App
            </button>
            <button
              onClick={() => setCurrentPortal('chemist')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPortal === 'chemist'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              🏪 Chemist / Pharmacist Station
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                LIVE
              </span>
            </button>
          </div>
        </div>
      </div>

      {currentPortal === 'chemist' ? (
        /* Chemist / Pharmacist Station Portal */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <ChemistDashboard onSwitchToPatient={() => setCurrentPortal('patient')} />
        </main>
      ) : (
        /* Patient Portal */
        <>
          <PatientHeader
            profile={{
              ...mockPatientProfile,
              unreadNotificationsCount: activeOrder ? 1 : 0,
            }}
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenChemistPortal={() => setCurrentPortal('chemist')}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            {currentView === 'dashboard' && (
              <PatientDashboard
                activeOrder={activeOrder}
                medicines={initialMedicines}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'upload-prescription' && (
              <PrescriptionFlow
                onBackToDashboard={() => handleNavigate('dashboard')}
                onOrderConfirmed={handleOrderConfirmed}
              />
            )}

            {currentView === 'order-tracking' && activeOrder && (
              <OrderTrackingScreen
                order={activeOrder}
                onUpdateOrder={(updated) => setActiveOrder(updated)}
                onBackToDashboard={() => handleNavigate('dashboard')}
                onViewAllOrders={() => handleNavigate('my-orders')}
              />
            )}

            {currentView === 'my-orders' && (
              <OrdersPage
                activeOrder={activeOrder}
                onTrackOrder={() => handleNavigate('order-tracking')}
                onUploadPrescription={() => handleNavigate('upload-prescription')}
                onBackToDashboard={() => handleNavigate('dashboard')}
              />
            )}

            {currentView === 'nearby-pharmacy' && (
              <NearbyPharmaciesPage
                onBackToDashboard={() => handleNavigate('dashboard')}
                onUploadPrescription={() => handleNavigate('upload-prescription')}
              />
            )}

            {currentView === 'report-simplifier' && (
              <MedicalReportSimplifierPage
                onBackToDashboard={() => handleNavigate('dashboard')}
              />
            )}

            {currentView === 'home-remedies' && (
              <HomeRemediesPage
                onBackToDashboard={() => handleNavigate('dashboard')}
              />
            )}

            {currentView === 'medicine-reminder' && (
              <MedicineReminderPage
                onBackToDashboard={() => handleNavigate('dashboard')}
              />
            )}

            {currentView === 'symptom-checker' && (
              <PlaceholderPage
                title="Symptom Checker"
                subtitle="AI-Assisted Symptom Guidance"
                partTag="AI Triage"
                icon={Stethoscope}
                description="Get preliminary triage guidance and general wellness suggestions before consulting your doctor or pharmacist."
                onBackToDashboard={() => handleNavigate('dashboard')}
              />
            )}
          </main>
        </>
      )}


      {/* Healthcare Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">MediRush</span>
            <span>•</span>
            <span>Fastest Prescription Medicine Fulfillment Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by MediRush Sequential Multi-Pharmacy Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
