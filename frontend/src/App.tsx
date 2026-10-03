import { useState } from 'react';
import { PatientHeader } from './components/patient/PatientHeader';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PlaceholderPage } from './pages/patient/PlaceholderPage';
import type { PatientView } from './types/patient';
import { mockPatientProfile, initialActiveOrder, initialMedicines } from './data/patient/mockPatientData';
import { UploadCloud, Package, Store, Stethoscope } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<PatientView>('dashboard');

  const handleNavigate = (view: PatientView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Patient App Header */}
      <PatientHeader
        profile={mockPatientProfile}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentView === 'dashboard' && (
          <PatientDashboard
            activeOrder={initialActiveOrder}
            medicines={initialMedicines}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'upload-prescription' && (
          <PlaceholderPage
            title="Upload Prescription"
            subtitle="AI Prescription Intelligence & Medicine Extraction"
            partTag="Upcoming in Part 2"
            icon={UploadCloud}
            description="In the next part, you will be able to upload handwritten or digital doctor prescriptions for OCR extraction, salt mapping, Schedule-H checks, and rapid pharmacy broadcasting."
            onBackToDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'my-orders' && (
          <PlaceholderPage
            title="My Orders"
            subtitle="Active & Historical Medicine Orders"
            partTag="Upcoming Module"
            icon={Package}
            description="Live multi-pharmacy fulfillment status, dispatch tracking, OTP delivery confirmation, and order history will be accessible here."
            onBackToDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'nearby-pharmacy' && (
          <PlaceholderPage
            title="Nearby Pharmacies"
            subtitle="Certified Partner Pharmacy Network"
            partTag="Upcoming Module"
            icon={Store}
            description="Explore verified partner pharmacies in your area, real-time inventory availability, and cold-chain compliance details."
            onBackToDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'symptom-checker' && (
          <PlaceholderPage
            title="Symptom Checker"
            subtitle="AI-Assisted Symptom Guidance"
            partTag="Upcoming Module"
            icon={Stethoscope}
            description="Get preliminary triage guidance and general wellness suggestions before consulting your doctor or pharmacist."
            onBackToDashboard={() => handleNavigate('dashboard')}
          />
        )}
      </main>

      {/* Clean Healthcare Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">MediRush</span>
            <span>•</span>
            <span>Fastest Prescription Medicine Fulfillment Platform</span>
          </div>
          <div>
            <span>Part 1: Patient Dashboard Foundation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
