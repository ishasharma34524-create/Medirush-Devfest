import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, FileSearch } from 'lucide-react';
import { Card } from '../common/Card';
import { ANALYSIS_STEPS } from '../../services/mockAiService';

import { analyzePrescriptionApi } from '../../services/prescriptionService';
import type { DemoPrescriptionData, ExtractedMedicine } from '../../types/prescription';

interface AiAnalysisScreenProps {
  uploadPayload?: File | 'demo';
  onComplete: (data: { prescription: DemoPrescriptionData; medicines: ExtractedMedicine[] }) => void;
}

export const AiAnalysisScreen: React.FC<AiAnalysisScreenProps> = ({ 
  uploadPayload = 'demo',
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    let minTimePassed = false;
    let resolvedData: { prescription: DemoPrescriptionData; medicines: ExtractedMedicine[] } | null = null;

    // Trigger real backend API call in parallel with progressive UI animation
    analyzePrescriptionApi(uploadPayload)
      .then((res) => {
        if (isCancelled) return;
        resolvedData = res;
        // If the visual animation has already completed all steps, transition immediately
        if (minTimePassed) {
          onComplete(res);
        }
      })
      .catch((err) => {
        console.warn('[AiAnalysisScreen] Analysis warning:', err);
      });

    const stepInterval = 350; // Smooth ~1.7s animation
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          minTimePassed = true;
          // If the AI has already finished, finish immediately
          if (resolvedData && !isCancelled) {
            setTimeout(() => {
              if (!isCancelled && resolvedData) {
                onComplete(resolvedData);
              }
            }, 300);
          }
          return prev;
        }
      });
    }, stepInterval);

    return () => {
      isCancelled = true;
      clearInterval(timer);
    };
  }, [onComplete, uploadPayload]);

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-14 px-4">
      <Card className="bg-white border-slate-200/80 shadow-lg text-center p-8 sm:p-12">
        {/* Animated Visual Pulse */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <FileSearch className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MediRush AI Vision Engine</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Analyzing Prescription
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          Extracting medicines, determining active salts, and checking generic savings...
        </p>

        {/* Progressive Checklist */}
        <div className="max-w-md mx-auto space-y-3 text-left">
          {ANALYSIS_STEPS.map((step, idx) => {
            const isFinished = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  isFinished
                    ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900 font-medium'
                    : isCurrent
                    ? 'bg-slate-50 border-emerald-500/50 text-slate-900 font-semibold shadow-sm'
                    : 'bg-transparent border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <div className="shrink-0">
                  {isFinished ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <span className="text-xs sm:text-sm">{step}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
