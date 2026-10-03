import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingDown,
  Thermometer,
  Store,
  FileText,
  Sparkles,
  Bell,
  Cpu,
  Layers,
  ChevronDown
} from 'lucide-react';
import type { PatientView } from '../../types/patient';


interface LandingPageProps {
  onLaunchPatientApp: (view?: PatientView) => void;
  onLaunchChemistPortal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchPatientApp,
  onLaunchChemistPortal,
}) => {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const workflowSteps = [
    {
      step: '01',
      title: 'Doctor Prescription Snap & AI OCR',
      desc: 'Patient uploads a photo of handwritten or printed prescription. Gemini Vision OCR instantly digitizes brand names, active salts, dosages, and detects Schedule H/X & cold-chain needs.',
      badge: 'Multimodal Gemini AI',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      step: '02',
      title: 'Jan Aushadhi & Generic Savings Match',
      desc: 'Our clinical engine automatically suggests affordable bioequivalent generic alternatives, reducing out-of-pocket costs by up to 85% for Indian families.',
      badge: 'Up to 85% Savings',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      step: '03',
      title: 'Sequential Multi-Pharmacy Broadcast',
      desc: 'Order is broadcast to verified nearby pharmacies within 5-10km. If Apollo Pharmacy has 2 out of 3 medicines, they accept what they have in stock.',
      badge: 'Zero Stockout Guarantee',
      color: 'from-amber-500 to-orange-600',
    },
    {
      step: '04',
      title: 'Automatic Nearest Chemist Cascade',
      desc: 'The remaining out-of-stock medicine automatically cascades to MedPlus or Sanjeevani Medical without canceling the order. No patient wandering required!',
      badge: 'Real-Time Auto-Routing',
      color: 'from-rose-500 to-pink-600',
    },
    {
      step: '05',
      title: 'Cold-Chain Delivery & Secure OTP Handover',
      desc: 'Insulin and vaccines are delivered with temperature-safe protocol. Regulated Schedule drugs are handed over only after verifying the customer’s secure OTP.',
      badge: '< 15 Min Delivery',
      color: 'from-teal-500 to-emerald-600',
    },
  ];

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-emerald-600" />,
      title: 'Gemini Vision Prescription OCR',
      desc: 'Reads messy Indian doctor handwriting with multi-model fallback. Automatically extracts active salts, strengths, and schedule compliance flags.',
      cta: 'Try Prescription OCR',
      action: () => onLaunchPatientApp('upload-prescription'),
      bg: 'bg-emerald-50 border-emerald-200/80',
    },
    {
      icon: <Layers className="w-6 h-6 text-blue-600" />,
      title: 'Sequential Multi-Pharmacy Cascade',
      desc: 'Never get rejected due to stockouts. If Chemist A has 2 medicines and Chemist B has 1, MediRush splits & cascades fulfillment seamlessly.',
      cta: 'Open Chemist Station',
      action: onLaunchChemistPortal,
      bg: 'bg-blue-50 border-blue-200/80',
    },
    {
      icon: <TrendingDown className="w-6 h-6 text-teal-600" />,
      title: 'Jan Aushadhi Savings Engine',
      desc: 'Recommends PMBJP and generic equivalents for expensive branded medications with full bioequivalence transparency.',
      cta: 'Find Generic Alternatives',
      action: () => onLaunchPatientApp('upload-prescription'),
      bg: 'bg-teal-50 border-teal-200/80',
    },
    {
      icon: <Thermometer className="w-6 h-6 text-rose-600" />,
      title: 'Cold-Chain & Schedule Drug Control',
      desc: 'Ensures Insulin and biologics are stored and transported under 2°C-8°C with strict Schedule H/H1 OTP verification at doorstep.',
      cta: 'View Regulated Fulfillment',
      action: () => onLaunchPatientApp('nearby-pharmacy'),
      bg: 'bg-rose-50 border-rose-200/80',
    },
    {
      icon: <FileText className="w-6 h-6 text-purple-600" />,
      title: 'AI Medical Report Simplifier',
      desc: 'Translates complex blood tests (HbA1c, CBC, Lipid Profile) into conversational Hinglish with dietary tips and questions for your doctor.',
      cta: 'Decode Lab Report',
      action: () => onLaunchPatientApp('report-simplifier'),
      bg: 'bg-purple-50 border-purple-200/80',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-600" />,
      title: 'Ayurvedic Gharelu Nuskhe',
      desc: 'Evidence-based traditional Indian home remedies, kadha recipes, preparation guidelines, and critical doctor red-flag alerts.',
      cta: 'Explore Home Remedies',
      action: () => onLaunchPatientApp('home-remedies'),
      bg: 'bg-amber-50 border-amber-200/80',
    },
    {
      icon: <Bell className="w-6 h-6 text-indigo-600" />,
      title: 'Smart Medicine Reminder & Voice Alert',
      desc: 'Daily pill tracker with Hindi voice reminders ("Dawai lene ka samay ho gaya") and 1-tap WhatsApp adherence share for families.',
      cta: 'Set Pill Reminders',
      action: () => onLaunchPatientApp('medicine-reminder'),
      bg: 'bg-indigo-50 border-indigo-200/80',
    },
    {
      icon: <Store className="w-6 h-6 text-cyan-600" />,
      title: 'Live Hyperlocal Pharmacy Network',
      desc: 'Real-time inventory visibility and distance matrix across verified local medical stores in Tier-2/Tier-3 Indian cities.',
      cta: 'Find Nearby Chemists',
      action: () => onLaunchPatientApp('nearby-pharmacy'),
      bg: 'bg-cyan-50 border-cyan-200/80',
    },
  ];

  const faqs = [
    {
      q: 'How does MediRush solve the common Tier-2/Tier-3 pharmacy stockout problem?',
      a: 'In Tier-2 and Tier-3 cities, 70% of patient prescriptions cannot be fulfilled completely by a single pharmacy. MediRush solves this by sequentially splitting the order. A nearby chemist can accept the medicines they currently have in stock, and our system automatically routes the remaining items to the next nearest chemist. Both fulfillments are bundled without the patient ever having to walk from store to store in the heat or rain.',
    },
    {
      q: 'How does the Gemini Vision Prescription OCR work with difficult handwriting?',
      a: 'We leverage Google Gemini Vision with an autonomous multi-tier fallback architecture (gemini-flash-latest, gemini-3.7-flash, gemini-3.5-flash). It analyzes handwriting, detects drug brand names, matches active chemical salts, and categorizes regulatory flags like Schedule H and Cold-Chain storage requirements.',
    },
    {
      q: 'Can patients save money using Jan Aushadhi generic alternatives?',
      a: 'Yes! MediRush includes a Generic Alternatives & Jan Aushadhi engine. For every prescribed brand name, it identifies bioequivalent salts and government-approved Jan Aushadhi alternatives, saving families up to 85% on chronic medicine bills.',
    },
    {
      q: 'What makes the Chemist Portal unique?',
      a: 'Chemists get a live real-time console showing incoming patient orders with customer distance, cold-chain indicators, and per-medicine checkboxes. A chemist can accept 2 out of 3 medicines with 1 click; our backend takes the remaining medicine and seamlessly cascades it to the next nearest partner store.',
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold tracking-wide shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>🇮🇳 Built for Tier-2 & Tier-3 Indian Cities • Powered by Gemini AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              India’s 1st Hyperlocal{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                Prescription Intelligence
              </span>{' '}
              & Multi-Pharmacy Dispatch
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              Wandering from chemist to chemist in search of out-of-stock medicines is now history.
              Snap your doctor prescription, get instant salt & generic analysis, and watch nearby
              chemists fulfill and cascade your medicines to your doorstep in under 15 minutes.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onLaunchPatientApp('upload-prescription')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
              >
                <span>Upload Prescription (Patient App)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLaunchChemistPortal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer border border-slate-700"
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Open Live Chemist Station</span>
              </button>

              <button
                onClick={() => onLaunchPatientApp('report-simplifier')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Try Report Simplifier</span>
              </button>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10 border-t border-slate-200/80 mt-10">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
                <div className="flex items-center justify-between text-emerald-600 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Speed</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">&lt; 15 Mins</div>
                <div className="text-xs text-slate-500 font-medium">Hyperlocal Delivery</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
                <div className="flex items-center justify-between text-blue-600 mb-1">
                  <Cpu className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accuracy</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">99.4%</div>
                <div className="text-xs text-slate-500 font-medium">Gemini OCR & Salts</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
                <div className="flex items-center justify-between text-teal-600 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Savings</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">Up to 85%</div>
                <div className="text-xs text-slate-500 font-medium">Jan Aushadhi Equiv.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
                <div className="flex items-center justify-between text-rose-600 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stockouts</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">0% Drop</div>
                <div className="text-xs text-slate-500 font-medium">Sequential Cascade</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem in Tier-2/3 India vs The MediRush Solution */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              The Real Ground Problem in Indian Cities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Why Traditional Medicine Delivery Fails Tier-2 & Tier-3
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Existing 2-day eCommerce apps cannot solve emergency prescription fulfillment when a patient needs medicine within 30 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Broken Way */}
            <div className="p-6 rounded-2xl bg-red-50/40 border border-red-200/80 space-y-4">
              <div className="flex items-center gap-2 text-red-700 font-bold text-base">
                <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm">✕</span>
                <span>The Traditional Broken Healthcare Reality</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span><strong>The 3-Chemist Cycle:</strong> Chemist A has Dolo but no Augmentin; Chemist B has Augmentin but no Lantus insulin. Patients spend 2 hours roaming markets.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span><strong>Cold-Chain Failure:</strong> Insulin and vaccines are transported without temperature control in hot summers, degrading life-saving potency.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span><strong>Expensive Branded Prescriptions:</strong> Patients pay ₹900 when identical ₹120 Jan Aushadhi generic salts are available nearby.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span><strong>No Order Splitting:</strong> Traditional pharmacy aggregators cancel the whole order if even 1 item is missing.</span>
                </li>
              </ul>
            </div>

            {/* The MediRush Solution */}
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-300 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">✓</span>
                <span>The MediRush Intelligent Solution</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Multi-Pharmacy Sequential Cascade:</strong> Nearby Chemist confirms available items. Remaining missing medicines auto-route to the next store.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Gemini Multimodal OCR:</strong> Instant digitization of handwritten doctor slips with active chemical salt resolution.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Jan Aushadhi Equivalents:</strong> Transparent savings calculator showing verified bioequivalent options.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Cold-Chain + OTP Security:</strong> Insulin transported with cold-chain protocol; Schedule H drugs released only via secure OTP.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow & Architecture */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              End-to-End Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              How MediRush Fulfills In Under 15 Minutes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Click on each step below to inspect how data flows between the Patient, Gemini AI, and Chemist Station.
            </p>
          </div>

          {/* Workflow Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {workflowSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveWorkflowTab(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeWorkflowTab === idx
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{step.step}.</span>
                <span>{step.title.split('&')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Step Showcase Card */}
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {workflowSteps[activeWorkflowTab].step}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {workflowSteps[activeWorkflowTab].title}
                </h3>
              </div>
              <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {workflowSteps[activeWorkflowTab].badge}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {workflowSteps[activeWorkflowTab].desc}
            </p>

            <div className="pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-400">Step {activeWorkflowTab + 1} of {workflowSteps.length}</span>
              <div className="flex gap-2">
                {activeWorkflowTab > 0 && (
                  <button
                    onClick={() => setActiveWorkflowTab((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Previous Step
                  </button>
                )}
                {activeWorkflowTab < workflowSteps.length - 1 && (
                  <button
                    onClick={() => setActiveWorkflowTab((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer"
                  >
                    Next Step →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive Grid */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Complete Feature Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Everything You Need for Seamless Healthcare
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Built from scratch with zero boilerplate. Every feature is live, testable, and functional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${feat.bg} flex flex-col justify-between hover:shadow-md transition-all duration-200`}
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60">
                  <button
                    onClick={feat.action}
                    className="w-full text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center justify-between group cursor-pointer"
                  >
                    <span>{feat.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Dual-Portal Demo Spotlight */}
      <section className="py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
              Interactive Hackathon Live Demo
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              Experience the Full Dual-Portal Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Switch anytime using the top navigation bar between Patient ordering and Chemist dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Portal Card */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Portal 1</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white">🧑 Patient App & Prescription Portal</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Upload handwritten prescriptions, see instant Gemini OCR extracted medicines,
                compare Jan Aushadhi savings, view live delivery tracking with rider OTP, decode lab reports, and manage daily pill schedules.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => onLaunchPatientApp('upload-prescription')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Snap Prescription</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onLaunchPatientApp('report-simplifier')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 transition-colors cursor-pointer"
                >
                  Lab Report Simplifier
                </button>
                <button
                  onClick={() => onLaunchPatientApp('medicine-reminder')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 transition-colors cursor-pointer"
                >
                  Pill Tracker
                </button>
              </div>
            </div>

            {/* Chemist Portal Card */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4 hover:border-teal-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Portal 2</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white">🏪 Chemist Live Dispatch Station</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Real-time pharmacy dashboard receiving incoming prescription broadcasts.
                Chemists can select available medicines via checkboxes, confirm partial inventory, and trigger automatic sequential dispatch to the next partner pharmacy.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={onLaunchChemistPortal}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <span>Launch Chemist Station</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onLaunchPatientApp('nearby-pharmacy')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 transition-colors cursor-pointer"
                >
                  View Network Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Experience the Future of Indian Healthcare Logistics?
          </h2>
          <p className="text-xs sm:text-base text-emerald-100 max-w-xl mx-auto font-medium">
            Test the live patient workflow, explore Gemini AI prescription extraction, and see multi-pharmacy sequential dispatch in action.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onLaunchPatientApp('dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-emerald-900 font-bold text-sm shadow-md hover:bg-emerald-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Patient Dashboard</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </button>
            <button
              onClick={onLaunchChemistPortal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-sm border border-emerald-400/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-emerald-300" />
              <span>Launch Chemist Station</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
