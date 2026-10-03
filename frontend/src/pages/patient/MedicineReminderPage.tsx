import React, { useState, useEffect } from 'react';
import {
  Bell,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Volume2,
  Share2,
  HeartPulse
} from 'lucide-react';

import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

interface MedicineReminderPageProps {
  onBackToDashboard: () => void;
}

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ReminderItem {
  id: string;
  name: string;
  dosage: string;
  timeSlot: TimeSlot;
  timeString: string;
  instruction: string;
  taken: boolean;
  takenAt?: string;
}

const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: '1',
    name: 'Pantocid 40',
    dosage: '1 Capsule (Pantoprazole 40mg)',
    timeSlot: 'morning',
    timeString: '08:00 AM',
    instruction: 'Khali pet subah (Before Breakfast)',
    taken: true,
    takenAt: '08:05 AM'
  },
  {
    id: '2',
    name: 'Metformin 500mg',
    dosage: '1 Tablet',
    timeSlot: 'morning',
    timeString: '09:00 AM',
    instruction: 'Nashta karne ke baad (After Breakfast)',
    taken: true,
    takenAt: '09:15 AM'
  },
  {
    id: '3',
    name: 'Shelcal 500',
    dosage: '1 Tablet (Calcium + Vit D3)',
    timeSlot: 'afternoon',
    timeString: '02:00 PM',
    instruction: 'Dopahar ke khane ke baad (After Lunch)',
    taken: false
  },
  {
    id: '4',
    name: 'Atorvastatin 10mg',
    dosage: '1 Tablet (Cholesterol control)',
    timeSlot: 'night',
    timeString: '09:30 PM',
    instruction: 'Raat ko sone se pehle (Bedtime)',
    taken: false
  }
];

export const MedicineReminderPage: React.FC<MedicineReminderPageProps> = ({
  onBackToDashboard
}) => {
  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem('medirush_reminders');
      return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
    } catch {
      return DEFAULT_REMINDERS;
    }
  });

  const [activeSlot, setActiveSlot] = useState<TimeSlot | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('1 Tablet');
  const [newMedSlot, setNewMedSlot] = useState<TimeSlot>('morning');
  const [newMedTime, setNewMedTime] = useState<string>('09:00 AM');
  const [newMedInstruction, setNewMedInstruction] = useState<string>('Khana khane ke baad');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('medirush_reminders', JSON.stringify(reminders));
    } catch (e) {
      console.error(e);
    }
  }, [reminders]);

  const toggleTaken = (id: string) => {
    setReminders((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nowTaken = !item.taken;
          return {
            ...item,
            taken: nowTaken,
            takenAt: nowTaken
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined
          };
        }
        return item;
      })
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newItem: ReminderItem = {
      id: Date.now().toString(),
      name: newMedName.trim(),
      dosage: newMedDosage,
      timeSlot: newMedSlot,
      timeString: newMedTime,
      instruction: newMedInstruction,
      taken: false
    };

    setReminders((prev) => [...prev, newItem]);
    setNewMedName('');
    setShowAddModal(false);
  };

  const handleVoiceReminder = (med: ReminderItem) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const text = `Namaste! Yeh aapki dawai ${med.name} lene ka samay ho gaya hai. Iska dose hai ${med.dosage}, aur isko ${med.instruction} lena hai.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.92;

    setSpeakingId(med.id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleShareWhatsapp = () => {
    const takenCount = reminders.filter((r) => r.taken).length;
    const total = reminders.length;
    const msg = `Namaste! MediRush Medicine Tracker Report:\nMaine aaj ${takenCount}/${total} dawaiyan niyamit roop se le li hain.\nSwasthya Surakshit hai!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const totalCount = reminders.length;
  const takenCount = reminders.filter((r) => r.taken).length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const filteredReminders =
    activeSlot === 'all'
      ? reminders
      : reminders.filter((r) => r.timeSlot === activeSlot);

  const getSlotLabel = (slot: TimeSlot) => {
    switch (slot) {
      case 'morning':
        return 'Subah (Morning)';
      case 'afternoon':
        return 'Dopahar (Afternoon)';
      case 'evening':
        return 'Shaam (Evening)';
      case 'night':
        return 'Raat (Bedtime)';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Wapas Dashboard Par Jayein
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Smart Medicine Reminder & Pill Tracker
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Samay par dawai lein aur parivar ke sath compliance share karein
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareWhatsapp}
            className="text-xs flex items-center gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Share2 className="w-3.5 h-3.5" /> Parivar Ko Bhejein (WhatsApp)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Nayi Dawai Add Karein
          </Button>
        </div>
      </div>

      {/* Adherence Hero Gauge */}
      <Card className="p-5 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 border-indigo-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              Aaj Ka Pill Adherence (Dawai Ka Niyam)
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {takenCount} of {totalCount} Dawaiyan Li Gayi ({adherencePercent}%)
            </h2>
            <p className="text-xs text-slate-600">
              {adherencePercent === 100
                ? 'Shabash! Aaj ki sabhi dawaiyan samay par li ja chuki hain.'
                : 'Niyamit dawai lene se bimari jaldi control hoti hai.'}
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Progress</span>
              <span>{adherencePercent}%</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${adherencePercent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Time Slot Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSlot('all')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
            activeSlot === 'all'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Sabhi Dawaiyan ({reminders.length})
        </button>
        {(['morning', 'afternoon', 'evening', 'night'] as TimeSlot[]).map((slot) => {
          const count = reminders.filter((r) => r.timeSlot === slot).length;
          return (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                activeSlot === slot
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {getSlotLabel(slot)} ({count})
            </button>
          );
        })}
      </div>

      {/* Medication Cards List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            Is slot me koi dawai scheduled nahi hai.
          </Card>
        ) : (
          filteredReminders.map((med) => (
            <Card
              key={med.id}
              className={`p-4 border transition-all ${
                med.taken
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaken(med.id)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      med.taken
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-500'
                    }`}
                    title={med.taken ? 'Mark as Pending' : 'Mark as Taken'}
                  >
                    {med.taken && <CheckCircle2 className="w-5 h-5" />}
                  </button>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-bold text-sm ${
                          med.taken ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {med.name}
                      </h4>
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {med.dosage}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {med.timeString} • {med.instruction}
                    </p>

                    {med.taken && med.takenAt && (
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        ✓ Li gayi samay: {med.takenAt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleVoiceReminder(med)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition-all ${
                      speakingId === med.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    }`}
                    title="Bol kar sunayein"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {speakingId === med.id ? 'Bol Raha Hai...' : 'Aawaz Sunayein'}
                  </button>

                  <Button
                    size="sm"
                    variant={med.taken ? 'outline' : 'primary'}
                    onClick={() => toggleTaken(med.id)}
                    className="text-xs font-bold py-1 px-3"
                  >
                    {med.taken ? 'Wapas Uncheck Karein' : 'Dawai Li ✓'}
                  </Button>

                  <button
                    onClick={() => deleteReminder(med.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" /> Nayi Dawai Reminder Add Karein
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Dawai Ka Naam (Medicine Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol 650mg, Insulin, etc."
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dose</label>
                  <input
                    type="text"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Samay (Slot)</label>
                <select
                  value={newMedSlot}
                  onChange={(e) => setNewMedSlot(e.target.value as TimeSlot)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="morning">Subah (Morning)</option>
                  <option value="afternoon">Dopahar (Afternoon)</option>
                  <option value="evening">Shaam (Evening)</option>
                  <option value="night">Raat (Bedtime)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Niyam (Instruction)
                </label>
                <input
                  type="text"
                  value={newMedInstruction}
                  onChange={(e) => setNewMedInstruction(e.target.value)}
                  placeholder="e.g. Khane ke baad / Khali pet"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold">
                  Save Reminder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safety Notice Footer */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-600">
        <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Yeh reminder aapke device ke local storage me surakshit save rehta hai. Doctor ke bataye schedule ka palan karein.
        </span>
      </div>
    </div>
  );
};
