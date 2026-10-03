import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Activity,
  ArrowLeft,
  Volume2,
  RefreshCw,
  HelpCircle,
  Apple
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { simplifyMedicalReportApi } from '../../services/backendService';

interface MedicalReportSimplifierPageProps {
  onBackToDashboard: () => void;
}

interface TestParam {
  parameterName: string;
  measuredValue: string;
  normalRange: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  hinglishMeaning: string;
  clinicalSignificance: string;
}

interface ReportData {
  reportTitle: string;
  summaryHinglish: string;
  summaryEnglish: string;
  testParameters: TestParam[];
  dietAndLifestyleAdvice: string[];
  questionsForDoctor: string[];
  urgencyLevel: 'ROUTINE' | 'CONSULT_SOON' | 'IMMEDIATE_ATTENTION';
  isFallback: boolean;
}

const PRESET_REPORTS = [
  {
    id: 'diabetes',
    label: 'HbA1c & Blood Sugar',
    text: `PATIENT LAB REPORT:
Test Name: Glycated Hemoglobin (HbA1c)
Result: 8.4 % (Reference: < 5.7 % Normal, 5.7-6.4 % Prediabetes, >= 6.5 % Diabetes)
Test Name: Fasting Blood Sugar (FBS)
Result: 168 mg/dL (Reference: 70 - 100 mg/dL)
Test Name: Postprandial Blood Sugar (PPBS)
Result: 242 mg/dL (Reference: < 140 mg/dL)
Serum Creatinine: 0.95 mg/dL (Reference: 0.7 - 1.2 mg/dL)`
  },
  {
    id: 'lipid',
    label: 'Lipid Profile (Cholesterol)',
    text: `PATIENT LAB REPORT:
Total Cholesterol: 245 mg/dL (Desirable: < 200 mg/dL)
Triglycerides: 280 mg/dL (Normal: < 150 mg/dL)
HDL Cholesterol (Good): 34 mg/dL (Normal: > 40 mg/dL)
LDL Cholesterol (Bad): 165 mg/dL (Optimal: < 100 mg/dL)
VLDL: 46 mg/dL (Normal: < 30 mg/dL)`
  },
  {
    id: 'cbc',
    label: 'Complete Blood Count (CBC)',
    text: `PATIENT LAB REPORT:
Hemoglobin: 10.2 g/dL (Reference: 13.0 - 17.0 g/dL) - Low
Total WBC Count: 11,800 /mcL (Reference: 4,000 - 11,000 /mcL) - Mildly High
Platelet Count: 1.45 Lakhs /mcL (Reference: 1.5 - 4.5 Lakhs /mcL)
RBC Count: 3.9 million/mcL (Reference: 4.5 - 5.5 million/mcL)`
  }
];

export const MedicalReportSimplifierPage: React.FC<MedicalReportSimplifierPageProps> = ({
  onBackToDashboard
}) => {
  const [reportText, setReportText] = useState(PRESET_REPORTS[0].text);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportResult, setReportResult] = useState<ReportData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAnalyze = async (textToUse?: string, fileToUse?: File) => {
    setIsLoading(true);
    try {
      const res = await simplifyMedicalReportApi(textToUse || reportText, fileToUse || (selectedFile || undefined));
      setReportResult(res);
    } catch (err) {
      console.error('Failed to simplify report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakSummary = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 animate-pulse border border-red-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">HIGH (ऊपर)</span>;
      case 'LOW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 border border-sky-200">LOW (कम)</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">NORMAL (सामान्य)</span>;
    }
  };

  const getUrgencyBadge = (urgency?: string) => {
    if (urgency === 'IMMEDIATE_ATTENTION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5" /> Doctor Se Turant Milein
        </span>
      );
    }
    if (urgency === 'CONSULT_SOON') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
          <Activity className="w-3.5 h-3.5" /> Niyantran Ki Zaroorat (Consult Soon)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5" /> Routine Follow-up
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Wapas Dashboard Par Jayein
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                AI Medical Report Simplifier
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Blood Test, HbA1c ya Lab Report ko aam Hinglish me samajhein
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-600" /> Powered by MediRush Clinical AI
          </span>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              1. Report Upload Ya Select Karein
            </h3>

            {/* Quick Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Quick Sample Reports (Click to test):
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESET_REPORTS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setReportText(preset.text);
                      setSelectedFile(null);
                      handleAnalyze(preset.text);
                    }}
                    className={`text-left text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                      reportText === preset.text && !selectedFile
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    📄 {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Option */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Apni Lab Report Image Upload Karein:
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setSelectedFile(file);
                    handleAnalyze(undefined, file);
                  }
                }}
                className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
              />
              {selectedFile && (
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                  ✓ Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Manual text area */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Ya Lab Report ka Text Paste Karein:
              </label>
              <textarea
                rows={5}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Paste lab report test names and values here..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-slate-50"
              />
            </div>

            <Button
              variant="primary"
              className="w-full justify-center text-xs py-2.5 font-bold"
              disabled={isLoading || (!reportText && !selectedFile)}
              onClick={() => handleAnalyze()}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Report Analyze Ho Rahi Hai...
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 mr-1.5" />
                  Report Ka Asaan Matlab Samjhein
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2 space-y-4">
          {!reportResult && !isLoading && (
            <Card className="p-8 text-center bg-slate-50/60 border-dashed border-2 border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">Koi Report Select Nahi Hui</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Left side me kisi bhi sample report par click karein ya apni lab report upload karke turant saral vivaran dekhein.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAnalyze(PRESET_REPORTS[0].text)}
              >
                Sample HbA1c Report Dekhein
              </Button>
            </Card>
          )}

          {isLoading && (
            <Card className="p-12 text-center bg-white border border-emerald-100 shadow-sm space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <HeartPulse className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">Gemini Clinical AI Reading Your Lab Values</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Hemoglobin, Sugar, aur Reference ranges ko aam Hinglish me decode kiya ja raha hai...
                </p>
              </div>
            </Card>
          )}

          {reportResult && !isLoading && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Summary Hero Card */}
              <Card className="p-5 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 border-emerald-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      Lab Report Overview
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                      {reportResult.reportTitle}
                    </h2>
                  </div>
                  <div>{getUrgencyBadge(reportResult.urgencyLevel)}</div>
                </div>

                {/* Hinglish Explanation Box */}
                <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-100 shadow-xs relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      🇮🇳 Doctor Sahab Ki Aam Bhasha Me:
                    </span>
                    <button
                      onClick={() => handleSpeakSummary(reportResult.summaryHinglish)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
                      title="Sunayein"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {isSpeaking ? 'Rokna' : 'Sunayein'}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {reportResult.summaryHinglish}
                  </p>
                </div>
              </Card>

              {/* Test Parameter Breakdown Table */}
              <Card className="p-5 border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Har Test Parameter Ka Breakdown
                </h3>

                <div className="space-y-3">
                  {reportResult.testParameters.map((param, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/40 hover:bg-white transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {param.parameterName}
                          </span>
                          {getStatusBadge(param.status)}
                        </div>
                        <div className="text-xs">
                          <span className="text-slate-500">Aapka Result: </span>
                          <span className="font-bold text-slate-800 text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                            {param.measuredValue}
                          </span>
                          <span className="text-slate-400 ml-2 text-[11px]">
                            (Normal: {param.normalRange})
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100/70">
                        <span className="font-semibold text-emerald-800">Iska Matlab: </span>
                        {param.hinglishMeaning}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Diet & Doctor Advice Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Diet Tips */}
                <Card className="p-4 border-amber-200/80 bg-amber-50/20">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2 mb-2.5 text-amber-900">
                    <Apple className="w-4 h-4 text-amber-600" />
                    Khaan-Paan & Lifestyle Salah
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {reportResult.dietAndLifestyleAdvice.map((advice, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Doctor Questions */}
                <Card className="p-4 border-blue-200/80 bg-blue-50/20">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2 mb-2.5 text-blue-900">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    Doctor Se Zaroori Sawaal Puchein
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {reportResult.questionsForDoctor.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">?</span>
                        <span className="italic">"{q}"</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
