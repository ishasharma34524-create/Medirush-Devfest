import type { Pharmacy } from '../../types/pharmacy';

export const PATIENT_DEFAULT_COORDS = {
  lat: 12.9279,
  lng: 77.6771,
  address: 'Flat 402, Green Glen Heights, Bellandur, Bengaluru'
};

export const DEMO_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm-a',
    name: 'Apollo Pharmacy — Green Glen',
    chain: 'Apollo Pharmacy',
    address: 'Near Bellandur Junction, Outer Ring Rd, Bengaluru',
    distanceKm: 0.8,
    lat: 12.9325,
    lng: 77.6830,
    rating: 4.8,
    isVerified: true,
    hasColdChainStorage: true,
    contactNumber: '+91 80 4912 8001',
    openHours: '24 Hours Open',
    availableServices: ['Rapid Dispensing', 'Schedule-H Verification', 'Cold-Chain Insulin'],
    inventoryMedicineIds: ['med-1', 'med-2', 'med-3']
  },
  {
    id: 'pharm-b',
    name: 'MedPlus Chemist & Cold-Care',
    chain: 'MedPlus',
    address: 'Opp. Central Mall, Bellandur, Bengaluru',
    distanceKm: 0.9,
    lat: 12.9230,
    lng: 77.6715,
    rating: 4.9,
    isVerified: true,
    hasColdChainStorage: true,
    contactNumber: '+91 80 2854 3321',
    openHours: '7:00 AM – 11:30 PM',
    availableServices: ['Cold-Chain Refrigeration', 'Generic Jan Aushadhi Substitutes', 'Home Delivery'],
    inventoryMedicineIds: ['med-4']
  },
  {
    id: 'pharm-c',
    name: 'Wellness Forever 24/7 Superstore',
    chain: 'Wellness Forever',
    address: 'Sarjapur Main Road, Bengaluru',
    distanceKm: 1.2,
    lat: 12.9395,
    lng: 77.6660,
    rating: 4.7,
    isVerified: true,
    hasColdChainStorage: true,
    contactNumber: '+91 80 6710 4400',
    openHours: '24 Hours Open',
    availableServices: ['24/7 Emergency Counter', 'Surgical Equipment', 'Speciality Oncology Drugs'],
    inventoryMedicineIds: ['med-1', 'med-2', 'med-3', 'med-4']
  },
  {
    id: 'pharm-d',
    name: 'Guardian Healthcare & Surgical',
    chain: 'Guardian',
    address: 'HSR Layout Sector 2, Bengaluru',
    distanceKm: 1.5,
    lat: 12.9145,
    lng: 77.6895,
    rating: 4.6,
    isVerified: true,
    hasColdChainStorage: true,
    contactNumber: '+91 80 4110 9988',
    openHours: '8:00 AM – 10:30 PM',
    availableServices: ['Chronic Care Subscriptions', 'Vaccine Cold Storage'],
    inventoryMedicineIds: ['med-1', 'med-4']
  }
];
