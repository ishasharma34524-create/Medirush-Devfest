import type { PatientProfile, ActiveOrder, PrescribedMedicine } from '../../types/patient';

export const mockPatientProfile: PatientProfile = {
  id: 'pat_98124',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  defaultLocation: {
    address: 'Flat 402, Green Glen Heights',
    landmark: 'Near Bellandur Junction',
    city: 'Bengaluru',
    postalCode: '560103'
  },
  unreadNotificationsCount: 2
};

// Default empty active order for Part 1 (UI foundation)
export const initialActiveOrder: ActiveOrder | null = null;

// Default empty medicine list for Part 1 (UI foundation)
export const initialMedicines: PrescribedMedicine[] = [];
