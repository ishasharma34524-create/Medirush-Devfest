import { useState } from 'react';
import { PatientHeader } from './components/patient/PatientHeader';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PrescriptionFlow } from './pages/patient/PrescriptionFlow';
import { OrderTrackingScreen } from './components/fulfillment/OrderTrackingScreen';
import { OrdersPage } from './pages/patient/OrdersPage';
import { PlaceholderPage } from './pages/patient/PlaceholderPage';
import type { PatientView, ActiveOrder } from './types/patient';
import { mockPatientProfile, initialMedicines } from './data/patient/mockPatientData';
import { Store, Stethoscope } from 'lucide-react';

export function App() {
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
      {/* Patient App Header */}
      <PatientHeader
        profile={{
          ...mockPatientProfile,
          unreadNotificationsCount: activeOrder ? 1 : 0
        }}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main Container */}
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
