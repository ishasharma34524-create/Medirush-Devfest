import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Search,
  AlertTriangle,
  Leaf,
  Clock,
  HeartPulse,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { fetchHomeRemediesApi } from '../../services/backendService';

interface HomeRemediesPageProps {
  onBackToDashboard: () => void;
}

interface RemedyItem {
  title: string;
  ingredients: string;
  preparationHinglish: string;
  benefits: string;
  bestTimeToConsume: string;
}

interface RemediesData {
  condition: string;
  overviewHinglish: string;
  remedies: RemedyItem[];
  lifestyleTips: string[];
  criticalRedFlags: string[];
  disclaimer: string;
  isFallback: boolean;
}

const CATEGORIES = [
  { id: 'cough', label: 'Khansi & Gale Me Kharash (Cough)', query: 'cough and cold' },
  { id: 'acidity', label: 'Gas & Acidity (Reflux)', query: 'acidity and gas' },
  { id: 'bp', label: 'High Blood Pressure', query: 'high blood pressure' },
  { id: 'digestion', label: 'Pachan & Kabz (Constipation)', query: 'digestion and constipation' },
  { id: 'joint', label: 'Jodon Ka Dard (Joint Pain)', query: 'joint and knee pain' },
  { id: 'immunity', label: 'Immunity & Kamzori', query: 'immunity booster' },
];

export const HomeRemediesPage: React.FC<HomeRemediesPageProps> = ({
  onBackToDashboard
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('cough');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [remediesData, setRemediesData] = useState<RemediesData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const loadRemedies = async (condition: string) => {
    setIsLoading(true);
    try {
      const res = await fetchHomeRemediesApi(condition);
      setRemediesData(res);
    } catch (err) {
      console.error('Failed to load home remedies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRemedies('cough and sore throat');
  }, []);

  const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(cat.id);
    setSearchQuery('');
    loadRemedies(cat.query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSelectedCategory('');
    loadRemedies(searchQuery.trim());
  };

  const handleSpeak = (text: string) => {
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Wapas Dashboard Par Jayein
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Ayurvedic & Evidence-Based Gharelu Nuskhe
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Ghar ki rasoi ke asardaar aur surakshit kadhe, aahar aur parhez
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-amber-600" /> Traditional Indian Healing & Safety Checks
          </span>
        </div>
      </div>

      {/* Search & Category Chips */}
      <div className="space-y-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Apni takleef likhein (e.g. Gale me dard, pet kharab, sir dard)..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-xs"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="font-bold text-xs px-4">
            Search Nuskha
          </Button>
        </form>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {isLoading && (
        <Card className="p-12 text-center bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">
            Ayurvedic Gharelu Nuskhe Khoje Jaa Rahe Hain...
          </h4>
          <p className="text-xs text-slate-500">
            Haldi, adrak, tulsi aur safe home remedies verify ho rahi hain...
          </p>
        </Card>
      )}

      {!isLoading && remediesData && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Overview Banner */}
          <Card className="p-5 bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/40 border-amber-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Rog & Lakshano Ka Vishleshan
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {remediesData.condition}
                </h2>
              </div>
              <button
                onClick={() => handleSpeak(remediesData.overviewHinglish)}
                className="self-start sm:self-auto text-xs text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {isSpeaking ? 'Aawaz Rokein' : 'Bol Kar Sunayein'}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 font-medium leading-relaxed">
              {remediesData.overviewHinglish}
            </p>
          </Card>

          {/* Remedies List */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              Ghar Par Banaye Jane Wale Nuskhe & Kadha
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {remediesData.remedies.map((remedy, idx) => (
                <Card
                  key={idx}
                  className="p-4 flex flex-col justify-between border-slate-200 hover:border-emerald-300 transition-all hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {remedy.title}
                      </h4>
                      <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700 block">Samagri (Ingredients):</span>
                      <p className="text-slate-600">{remedy.ingredients}</p>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-emerald-800 block">
                        Banane Ka Tarika (Method):
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {remedy.preparationHinglish}
                      </p>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-slate-700 block">Fayde (Benefits):</span>
                      <p className="text-slate-600">{remedy.benefits}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/70 p-2 rounded-lg font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Kab lein: {remedy.bestTimeToConsume}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Lifestyle & Red Flags Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lifestyle & Parhez */}
            <Card className="p-4 border-slate-200 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Parhez & Swasthya Aadat (Lifestyle Advice)
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {remediesData.lifestyleTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Red Flag Warning */}
            <Card className="p-4 border-red-200 bg-red-50/40">
              <h4 className="font-bold text-red-900 text-sm flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                🚨 Doctor Ke Paas Kab Jayein? (Khatre Ki Ghanti)
              </h4>
              <ul className="space-y-2 text-xs text-red-800">
                {remediesData.criticalRedFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">!</span>
                    <span className="font-medium">{flag}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Medical Disclaimer */}
          <div className="p-3 bg-slate-100 rounded-xl text-center text-[11px] text-slate-500">
            <HeartPulse className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
            {remediesData.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
