import mongoose from "mongoose";
import { Pharmacy, IPharmacy, IPharmacyStock } from "../models/Pharmacy";

export interface NearbyPharmacyResult {
  pharmacy: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isOnline: boolean;
  };
  distanceKm: number;
  isOnline: boolean;
  relevantStock: IPharmacyStock[];
}

export const DEMO_PHARMACIES_LIST = [
  {
    _id: "650000000000000000000001",
    name: "Sanjeevani Medicos (Palasia)",
    address: "12/A Greater Kailash Road, Old Palasia, Indore, MP",
    latitude: 22.7244,
    longitude: 75.8839,
    isOnline: true,
    stock: [
      { medicineName: "Lantus 100 IU/mL", quantity: 15, available: true },
      { medicineName: "Augmentin 625mg", quantity: 40, available: true },
      { medicineName: "Dolo 650mg", quantity: 100, available: true },
      { medicineName: "Azithral 500mg", quantity: 25, available: true },
    ],
  },
  {
    _id: "650000000000000000000002",
    name: "Apollo Pharmacy (Vijay Nagar)",
    address: "Scheme No 54, Vijay Nagar Square, Indore, MP",
    latitude: 22.7533,
    longitude: 75.8937,
    isOnline: true,
    stock: [
      { medicineName: "Lantus 100 IU/mL", quantity: 8, available: true },
      { medicineName: "Augmentin 625mg", quantity: 50, available: true },
      { medicineName: "Metformin 500mg", quantity: 80, available: true },
    ],
  },
  {
    _id: "650000000000000000000003",
    name: "Sharma Medical & Surgical Store",
    address: "Shop 4, Freeganj Market, Ujjain, MP",
    latitude: 23.1765,
    longitude: 75.7885,
    isOnline: true,
    stock: [
      { medicineName: "Augmentin 625mg", quantity: 20, available: true },
      { medicineName: "Dolo 650mg", quantity: 60, available: true },
    ],
  },
];

/**
 * Calculates Great Circle distance between two geo-coordinates using Haversine formula.
 * Returns distance in kilometers (km) rounded to 2 decimal places.
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

/**
 * Finds pharmacies near given coordinates within radiusKm, ordered by distance.
 * Resilient to MongoDB availability.
 */
export const findNearbyPharmacies = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
  filterMedicines?: string[]
): Promise<NearbyPharmacyResult[]> => {
  let pharmacies: any[] = [];

  if (mongoose.connection.readyState === 1) {
    try {
      pharmacies = await Pharmacy.find({});
    } catch {
      pharmacies = [];
    }
  }

  // Fallback to built-in demo pharmacies if MongoDB has no records or is offline
  if (!pharmacies || pharmacies.length === 0) {
    pharmacies = DEMO_PHARMACIES_LIST;
  }

  const results: NearbyPharmacyResult[] = [];

  for (const p of pharmacies) {
    const distanceKm = calculateHaversineDistance(
      latitude,
      longitude,
      p.latitude,
      p.longitude
    );

    if (distanceKm <= radiusKm) {
      let relevantStock = p.stock || [];
      if (filterMedicines && filterMedicines.length > 0) {
        const lowerFilter = filterMedicines.map((m) => m.toLowerCase());
        relevantStock = relevantStock.filter((s: any) =>
          lowerFilter.some((filterName) =>
            (s.medicineName || "").toLowerCase().includes(filterName)
          )
        );
      }

      results.push({
        pharmacy: {
          id: p._id?.toString() || p.id,
          name: p.name,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
          isOnline: Boolean(p.isOnline),
        },
        distanceKm,
        isOnline: Boolean(p.isOnline),
        relevantStock,
      });
    }
  }

  // Sort by nearest distance first
  return results.sort((a, b) => a.distanceKm - b.distanceKm);
};

/**
 * Retrieves a pharmacy by its ID and returns its stock.
 */
export const getPharmacyByIdWithStock = async (
  pharmacyId: string
): Promise<any | null> => {
  if (mongoose.connection.readyState === 1) {
    try {
      const found = await Pharmacy.findById(pharmacyId);
      if (found) return found;
    } catch {
      // Continue to demo list fallback
    }
  }

  return (
    DEMO_PHARMACIES_LIST.find(
      (p) => p._id === pharmacyId || p._id === String(pharmacyId)
    ) || null
  );
};

/**
 * Demo seed helper: populates demo pharmacies if MongoDB is active and collection is empty.
 */
export const seedInitialPharmaciesIfEmpty = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 1) return;

  try {
    const count = await Pharmacy.countDocuments();
    if (count > 0) return;

    await Pharmacy.insertMany(DEMO_PHARMACIES_LIST);
    console.log("[MediRush Demo] Seeded initial pharmacies for Indore & Ujjain demo");
  } catch (err) {
    console.warn("[MediRush Demo] Pharmacy auto-seed skipped:", err);
  }
};
