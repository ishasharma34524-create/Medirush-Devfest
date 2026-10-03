import type { Pharmacy } from '../../types/pharmacy';

export const DEMO_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm-a',
    name: 'Apollo Pharmacy — Green Glen',
    chain: 'Apollo Pharmacy',
    address: 'Near Bellandur Junction, Outer Ring Rd, Bengaluru',
    distanceKm: 0.8,
    rating: 4.8,
    isVerified: true,
    hasColdChainStorage: false,
    contactNumber: '+91 80 4912 8001',
    // In Scenario A: has Telma-H (med-1), Glycomet-GP (med-2), Augmentin (med-3)
    inventoryMedicineIds: ['med-1', 'med-2', 'med-3']
  },
  {
    id: 'pharm-b',
    name: 'MedPlus Chemist & Cold-Care',
    chain: 'MedPlus',
    address: 'Opp. Central Mall, Bellandur, Bengaluru',
    distanceKm: 0.9,
    rating: 4.9,
    isVerified: true,
    hasColdChainStorage: true,
    contactNumber: '+91 80 2854 3321',
    // In Scenario A: has Lantus Insulin (med-4)
    inventoryMedicineIds: ['med-4']
  },
  {
    id: 'pharm-c',
    name: 'Wellness Forever 24/7 Superstore',
    chain: 'Wellness Forever',
    address: 'Sarjapur Main Road, Bengaluru',
    distanceKm: 1.2,
    rating: 4.7,
    isVerified: true,
    hasColdChainStorage: true,
    contactNumber: '+91 80 6710 4400',
    // Superstore having all 4 medicines (should NOT be contacted in Scenario A or B because nearest fulfilled first!)
    inventoryMedicineIds: ['med-1', 'med-2', 'med-3', 'med-4']
  },
  {
    id: 'pharm-d',
    name: 'Guardian Healthcare & Surgical',
    chain: 'Guardian',
    address: 'HSR Layout Sector 2, Bengaluru',
    distanceKm: 1.5,
    rating: 4.6,
    isVerified: true,
    hasColdChainStorage: true,
    contactNumber: '+91 80 4110 9988',
    inventoryMedicineIds: ['med-1', 'med-4']
  }
];
