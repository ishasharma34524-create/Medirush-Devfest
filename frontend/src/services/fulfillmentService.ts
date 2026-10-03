import { DEMO_PHARMACIES } from '../data/patient/demoPharmacies';
import type { ExtractedMedicine } from '../types/prescription';
import type { Pharmacy, FulfillmentPlan, PharmacyFulfillmentMatch, BroadcastLogItem } from '../types/pharmacy';

/**
 * Executes the MediRush Sequential Broadcast Algorithm.
 * 
 * Dynamically allocates any uploaded prescription medicines across nearest pharmacies:
 * - Scenario A: Nearest Pharmacy A (0.8 km) stocks majority items, Pharmacy B (0.9 km) supplies remaining items -> STOP (100% fulfilled, Pharmacy C/D skipped).
 * - Scenario B: Nearest Pharmacy A (0.8 km) stocks ALL items -> STOP immediately (100% fulfilled, 0 extra calls).
 */
export function calculateSequentialFulfillment(
  medicines: ExtractedMedicine[],
  scenario: 'scenario-a-multi' | 'scenario-b-single' = 'scenario-a-multi'
): FulfillmentPlan {
  // Sort candidate pharmacies by shortest distance
  const candidates: Pharmacy[] = JSON.parse(JSON.stringify(DEMO_PHARMACIES)).sort(
    (a: Pharmacy, b: Pharmacy) => a.distanceKm - b.distanceKm
  );

  const medIds = medicines.map((m) => m.id);

  if (scenario === 'scenario-b-single') {
    // Pharmacy A has 100% of all medicines
    candidates[0].inventoryMedicineIds = [...medIds];
  } else {
    // Scenario A: Split between nearest Pharmacy A (0.8km) and Pharmacy B (0.9km)
    if (medicines.length <= 1) {
      candidates[0].inventoryMedicineIds = [...medIds];
    } else {
      const splitPoint = Math.max(1, Math.ceil(medicines.length * 0.75));
      candidates[0].inventoryMedicineIds = medIds.slice(0, splitPoint);
      candidates[1].inventoryMedicineIds = medIds.slice(splitPoint);
    }
  }

  const unfulfilled = new Map<string, ExtractedMedicine>(
    medicines.map((m) => [m.id, m])
  );

  const matches: PharmacyFulfillmentMatch[] = [];
  const broadcastLogs: BroadcastLogItem[] = [];
  const contactedPharmacies: Pharmacy[] = [];
  const uncontactedPharmacies: Pharmacy[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const pharmacy = candidates[i];

    // If already 100% fulfilled, STOP contacting any further pharmacies!
    if (unfulfilled.size === 0) {
      uncontactedPharmacies.push(pharmacy);
      continue;
    }

    contactedPharmacies.push(pharmacy);

    // Check which remaining medicines this pharmacy can supply
    const matchedFromThisPharmacy: ExtractedMedicine[] = [];
    const neededAtThisStep = Array.from(unfulfilled.values());

    for (const [id, med] of Array.from(unfulfilled.entries())) {
      if (pharmacy.inventoryMedicineIds.includes(id)) {
        matchedFromThisPharmacy.push(med);
        unfulfilled.delete(id);
      }
    }

    if (matchedFromThisPharmacy.length > 0) {
      matches.push({
        pharmacy,
        items: matchedFromThisPharmacy,
        matchedCount: matchedFromThisPharmacy.length
      });

      const isAllDone = unfulfilled.size === 0;
      broadcastLogs.push({
        id: `log-${i + 1}`,
        pharmacyId: pharmacy.id,
        pharmacyName: pharmacy.name,
        distanceKm: pharmacy.distanceKm,
        status: isAllDone && matches.length === 1 ? 'matched_full' : 'matched_partial',
        itemsFound: matchedFromThisPharmacy,
        itemsNeeded: neededAtThisStep,
        message: isAllDone && matches.length === 1
          ? `All ${matchedFromThisPharmacy.length}/${medicines.length} medicines available at nearest pharmacy (${pharmacy.distanceKm} km). Search stopped immediately.`
          : `Found ${matchedFromThisPharmacy.length} medicine(s). ${unfulfilled.size > 0 ? `Searching remaining ${unfulfilled.size} item(s)...` : '100% prescription completed! Stopping search.'}`
      });
    } else {
      broadcastLogs.push({
        id: `log-${i + 1}`,
        pharmacyId: pharmacy.id,
        pharmacyName: pharmacy.name,
        distanceKm: pharmacy.distanceKm,
        status: 'skipped',
        itemsFound: [],
        itemsNeeded: neededAtThisStep,
        message: `0/${neededAtThisStep.length} items in stock. Querying next best pharmacy...`
      });
    }
  }

  const isComplete = unfulfilled.size === 0;
  const totalDistanceKm = matches.reduce((acc, m) => acc + m.pharmacy.distanceKm, 0);
  const estimatedDeliveryMins = matches.length === 1 ? 18 : 26;

  return {
    isComplete,
    scenarioUsed: scenario,
    matches,
    totalPharmaciesUsed: matches.length,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    estimatedDeliveryMins,
    broadcastLogs,
    uncontactedPharmacies
  };
}
