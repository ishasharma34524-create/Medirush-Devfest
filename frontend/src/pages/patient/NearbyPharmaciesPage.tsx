import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  Phone, 
  Clock, 
  Star, 
  ShieldCheck, 
  Snowflake, 
  ArrowLeft,
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PharmacyMap } from '../../components/map/PharmacyMap';
import { DEMO_PHARMACIES, PATIENT_DEFAULT_COORDS } from '../../data/patient/demoPharmacies';
import type { Pharmacy } from '../../types/pharmacy';

interface NearbyPharmaciesPageProps {
  onBackToDashboard: () => void;
  onUploadPrescription: () => void;
}

export const NearbyPharmaciesPage: React.FC<NearbyPharmaciesPageProps> = ({
  onBackToDashboard,
  onUploadPrescription,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'cold-chain' | '24-hours'>('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(DEMO_PHARMACIES[0]);

  const filteredPharmacies = DEMO_PHARMACIES.filter((pharmacy) => {
    const matchesSearch =
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.chain.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'cold-chain') return pharmacy.hasColdChainStorage;
    if (selectedFilter === '24-hours') return pharmacy.openHours.includes('24');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald" size="sm" icon={<Store className="w-3.5 h-3.5" />}>
              Verified Network
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Bellandur & HSR Cluster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Nearby Partner Pharmacies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Explore certified pharmacies connected to MediRush real-time fulfillment network
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBackToDashboard}
          className="text-slate-600 self-start sm:self-auto"
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pharmacy name, landmark, or chain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all ${
              selectedFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({DEMO_PHARMACIES.length})
          </button>
          <button
            onClick={() => setSelectedFilter('cold-chain')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all flex items-center gap-1 ${
              selectedFilter === 'cold-chain'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" /> Cold-Chain Insulin
          </button>
          <button
            onClick={() => setSelectedFilter('24-hours')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all flex items-center gap-1 ${
              selectedFilter === '24-hours'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> 24/7 Open
          </button>
        </div>
      </div>

      {/* Main Content Layout: Interactive Leaflet Map + Pharmacy List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col (7 cols): Interactive Leaflet Map */}
        <div className="lg:col-span-7 space-y-4">
          <Card padded={false} className="overflow-hidden border-slate-200 shadow-sm relative">
            <PharmacyMap
              pharmacies={filteredPharmacies}
              selectedPharmacyId={selectedPharmacy?.id}
              activePharmacyIds={DEMO_PHARMACIES.map((p) => p.id)}
              patientCoords={PATIENT_DEFAULT_COORDS}
              height="480px"
              showRoutes={true}
              onSelectPharmacy={(p) => setSelectedPharmacy(p)}
            />
            
            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-200/80 shadow-md text-[11px] text-slate-700 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span className="font-semibold">Your Location</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-teal-700 inline-block" />
                <span className="font-semibold">Verified Partner</span>
              </div>
            </div>
          </Card>

          {/* Value Prop banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                <strong>Zero Pharmacy Running:</strong> MediRush automatically coordinates inventory across all these pharmacies when you upload a prescription.
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={onUploadPrescription}
              className="shrink-0 font-bold"
            >
              Order With MediRush
            </Button>
          </div>
        </div>

        {/* Right Col (5 cols): Pharmacy Details & Cards */}
        <div className="lg:col-span-5 space-y-3.5 overflow-y-auto max-h-[560px] pr-1">
          {filteredPharmacies.map((pharmacy) => {
            const isSelected = selectedPharmacy?.id === pharmacy.id;

            return (
              <Card
                key={pharmacy.id}
                hoverable
                onClick={() => setSelectedPharmacy(pharmacy)}
                className={`cursor-pointer transition-all border p-4.5 ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        {pharmacy.name}
                      </h3>
                      {pharmacy.isVerified && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{pharmacy.address}</p>
                  </div>

                  <Badge variant="emerald" size="sm" icon={<Navigation className="w-3 h-3" />}>
                    {pharmacy.distanceKm} km
                  </Badge>
                </div>

                {/* Rating & Hours */}
                <div className="flex items-center gap-3 text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{pharmacy.rating}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{pharmacy.openHours}</span>
                  </div>
                </div>

                {/* Badges / Services */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {pharmacy.hasColdChainStorage && (
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-blue-100">
                      <Snowflake className="w-3 h-3" /> Cold-Chain Insulin Storage
                    </span>
                  )}
                  {pharmacy.availableServices.slice(0, 2).map((srv, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {srv}
                    </span>
                  ))}
                </div>

                {/* Card Actions */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${pharmacy.contactNumber}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{pharmacy.contactNumber}</span>
                  </a>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUploadPrescription();
                    }}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Auto-Route via MediRush →
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

      </div>

    </div>
  );
};
