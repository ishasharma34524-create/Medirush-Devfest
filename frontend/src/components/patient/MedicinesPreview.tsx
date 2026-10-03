import React from 'react';
import { Pill, UploadCloud, Plus } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import type { PrescribedMedicine } from '../../types/patient';

interface MedicinesPreviewProps {
  medicines?: PrescribedMedicine[];
  onUploadClick: () => void;
}

export const MedicinesPreview: React.FC<MedicinesPreviewProps> = ({
  medicines = [],
  onUploadClick,
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Your Medicines
          </h2>
          <p className="text-xs text-slate-500">
            Active prescriptions and scheduled refills
          </p>
        </div>
        {medicines.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={onUploadClick}
          >
            Add Prescription
          </Button>
        )}
      </div>

      {medicines.length === 0 ? (
        // Empty State (Part 1 Foundation)
        <Card className="text-center py-8 sm:py-10 px-6 border-dashed border-slate-300/80 bg-white">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3.5">
              <Pill className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              No medicines saved yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed max-w-sm">
              Your prescribed medicines will appear here after you upload a prescription.
            </p>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<UploadCloud className="w-4 h-4 text-emerald-700" />}
              onClick={onUploadClick}
              className="text-emerald-800 font-semibold"
            >
              Upload Prescription
            </Button>
          </div>
        </Card>
      ) : (
        // Reusable list state for future parts
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {medicines.map((med) => (
            <Card key={med.id} className="bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{med.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{med.dosage} • {med.frequency}</p>
                </div>
                {med.scheduleCategory && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {med.scheduleCategory}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};
