import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PATIENT_DEFAULT_COORDS } from '../../data/patient/demoPharmacies';
import type { Pharmacy } from '../../types/pharmacy';

interface MapViewUpdaterProps {
  center: [number, number];
  zoom?: number;
}

function MapViewUpdater({ center, zoom = 14 }: MapViewUpdaterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// Custom Leaflet DivIcons using Tailwind SVG
const createPatientIcon = () =>
  L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div style="background-color: #059669; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.5); display: flex; align-items: center; justify-content: center; color: white;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/></svg>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

const createPharmacyIcon = (status: 'active' | 'querying' | 'default' = 'default') => {
  const bg =
    status === 'active'
      ? '#059669' // Emerald
      : status === 'querying'
      ? '#d97706' // Amber
      : '#0f766e'; // Teal

  return L.divIcon({
    className: 'custom-pharmacy-pin',
    html: `
      <div style="background-color: ${bg}; width: 30px; height: 30px; border-radius: 10px; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; transform: translate(-50%, -50%);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
          <path d="M2 7h20"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  selectedPharmacyId?: string;
  activePharmacyIds?: string[];
  queryingPharmacyId?: string;
  patientCoords?: { lat: number; lng: number; address?: string };
  height?: string;
  showRoutes?: boolean;
  onSelectPharmacy?: (pharmacy: Pharmacy) => void;
}

export const PharmacyMap: React.FC<PharmacyMapProps> = ({
  pharmacies,
  selectedPharmacyId,
  activePharmacyIds = [],
  queryingPharmacyId,
  patientCoords = PATIENT_DEFAULT_COORDS,
  height = '400px',
  showRoutes = true,
  onSelectPharmacy,
}) => {
  const selectedPharmacy = pharmacies.find((p) => p.id === selectedPharmacyId);
  const center: [number, number] = selectedPharmacy
    ? [selectedPharmacy.lat, selectedPharmacy.lng]
    : [patientCoords.lat, patientCoords.lng];

  // Build route lines from patient to all active/matched pharmacies
  const activeRoutes = pharmacies
    .filter((p) => activePharmacyIds.includes(p.id) || p.id === queryingPharmacyId)
    .map((p) => [
      [patientCoords.lat, patientCoords.lng] as [number, number],
      [p.lat, p.lng] as [number, number]
    ]);

  return (
    <div style={{ height }} className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <MapViewUpdater center={center} zoom={selectedPharmacy ? 15 : 14} />

        {/* High performance clean OSM tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Patient Location Marker */}
        <Marker
          position={[patientCoords.lat, patientCoords.lng]}
          icon={createPatientIcon()}
        >
          <Popup>
            <div className="text-xs p-1">
              <span className="font-bold text-emerald-800 block mb-0.5">Your Delivery Location</span>
              <p className="text-slate-600 leading-snug">{patientCoords.address || 'Patient Home'}</p>
            </div>
          </Popup>
        </Marker>

        {/* Pharmacy Markers */}
        {pharmacies.map((pharmacy) => {
          const isActive = activePharmacyIds.includes(pharmacy.id);
          const isQuerying = queryingPharmacyId === pharmacy.id;
          const status = isActive ? 'active' : isQuerying ? 'querying' : 'default';

          return (
            <Marker
              key={pharmacy.id}
              position={[pharmacy.lat, pharmacy.lng]}
              icon={createPharmacyIcon(status)}
              eventHandlers={{
                click: () => onSelectPharmacy && onSelectPharmacy(pharmacy)
              }}
            >
              <Popup>
                <div className="text-xs p-1.5 min-w-[180px] space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{pharmacy.name}</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                      {pharmacy.distanceKm} km
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{pharmacy.address}</p>
                  <div className="pt-1 text-[11px] text-slate-700 flex justify-between">
                    <span>⭐ {pharmacy.rating} Rating</span>
                    <span>{pharmacy.openHours}</span>
                  </div>
                  {pharmacy.hasColdChainStorage && (
                    <span className="inline-block text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium mt-1">
                      ❄️ Cold-Chain Ready
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active Dispatch Routes */}
        {showRoutes &&
          activeRoutes.map((route, idx) => (
            <Polyline
              key={idx}
              positions={route}
              color="#059669"
              weight={3.5}
              opacity={0.8}
              dashArray="6, 8"
            />
          ))}
      </MapContainer>
    </div>
  );
};
