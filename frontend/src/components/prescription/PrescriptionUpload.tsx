import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Sparkles, ShieldCheck, ArrowRight, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface PrescriptionUploadProps {
  onSelectDemo: () => void;
  onFileUpload: (file: File) => void;
  onBack: () => void;
}

export const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({
  onSelectDemo,
  onFileUpload,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Back Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Upload Doctor's Prescription
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload an image or PDF of your prescription for instant AI salt mapping and fulfillment
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-600">
          Back
        </Button>
      </div>

      {/* Primary Fast Track: Demo Prescription Card */}
      <Card variant="highlight" className="border-2 border-emerald-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
          Fast Demo Path
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                Instant Hackathon Demo
              </Badge>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                DEMO PRESCRIPTION — NOT A REAL PATIENT
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Try 4-Medicine Chronic Care Prescription
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Load a pre-configured prescription (Hypertension, Diabetes, Antibiotic, Cold-Chain Insulin) to test AI extraction, salt composition mapping, and generic savings immediately.
            </p>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={onSelectDemo}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto shrink-0 font-semibold shadow-md shadow-emerald-700/20"
          >
            Try Demo Prescription
          </Button>
        </div>
      </Card>

      {/* Standard File Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer bg-white ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          Click or drag & drop prescription file here
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
          Supports PNG, JPG, WEBP, or PDF doctor prescriptions (up to 10MB)
        </p>

        <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200/60">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Photos from mobile camera or digital e-prescriptions</span>
        </div>
      </div>

      {/* Trust & Regulatory Notice */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200/70">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>HIPAA & DPDPA compliant data privacy</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200/70">
          <FileText className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Automatic Schedule-H verification</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200/70">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Pharmacist review before dispatch</span>
        </div>
      </div>
    </div>
  );
};
