import { useState } from 'react';
import { PatientHeader } from './components/patient/PatientHeader';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PrescriptionFlow } from './pages/patient/PrescriptionFlow';
import { OrderTrackingScreen } from './components/fulfillment/OrderTrackingScreen';
import { OrdersPage } from './pages/patient/OrdersPage';
import { PlaceholderPage } from './pages/patient/PlaceholderPage';
import { ChemistDashboard } from './pages/chemist/ChemistDashboard';
import type { PatientView, ActiveOrder } from './types/patient';
import { mockPatientProfile, initialMedicines } from './data/patient/mockPatientData';
import { Store, Stethoscope, User, ShieldCheck } from 'lucide-react';

export function App() {
  const [activePortal, setActivePortal] = useState<'patient' | 'chemist'>('patient');
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
      {/* Top Demo Portal Switcher */}
      <div className="bg-slate-950 text-white text-xs px-4 py-2 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-emerald-400 flex items-center gap-1">
              ⚡ MediRush Hackathon Demo:
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Live Two-Sided Platform (Patient & Partner Chemist)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActivePortal('patient')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                activePortal === 'patient'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient App</span>
            </button>

            <button
              onClick={() => setActivePortal('chemist')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                activePortal === 'chemist'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>🏪 Chemist Portal (Live Requests)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {activePortal === 'chemist' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <ChemistDashboard onSwitchToPatient={() => setActivePortal('patient')} />
        </main>
      ) : (
        <>
          {/* Patient App Header */}
          <PatientHeader
            profile={{
              ...mockPatientProfile,
              unreadNotificationsCount: activeOrder ? 1 : 0,
            }}
            currentView={currentView}
            onNavigate={handleNavigate}
          />

          {/* Main Patient Container */}
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
              <PlaceholderPage
                title="Nearby Pharmacies"
                subtitle="Certified Partner Pharmacy Network"
                partTag="Pharmacy Network"
                icon={Store}
                description="Explore verified partner pharmacies in your area with real-time stock inquiry, cold-chain temperature verification, and average response times."
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
            <span>Emergency Medicine Delivery for Tier-2 & Tier-3 Indian Cities</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>CDSCO Compliant Partner Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
