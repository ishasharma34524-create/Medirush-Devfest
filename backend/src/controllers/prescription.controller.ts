import { Request, Response } from "express";

export const DEMO_PRESCRIPTION_BACKEND = {
  id: "rx_demo_2026_094",
  doctorName: "Dr. Arishta Mukherjee, MD (Gen Med)",
  doctorRegNo: "KMC-849102",
  clinicName: "Apollo Speciality Health Center, Bengaluru",
  date: "03 Oct 2026",
  patientName: "Rahul Sharma",
  patientAge: 46,
  patientGender: "Male",
  diagnosis: "Type 2 Diabetes Mellitus & Primary Hypertension Care",
  medicines: [
    {
      id: "med-1",
      name: "Telma-H",
      strength: "40mg / 12.5mg",
      form: "Tablet",
      saltComposition: "Telmisartan (40mg) + Hydrochlorothiazide (12.5mg)",
      dosage: "1 tablet",
      frequency: "Once daily in the morning after breakfast",
      duration: "30 Days",
      quantity: 30,
      unitPrice: 8.5,
      selectedVariant: "prescribed",
      genericAlternative: {
        id: "gen-1",
        name: "Telmisartan-H Generic (Jan Aushadhi / Cipla)",
        manufacturer: "Cipla Generics Ltd.",
        price: 3.8,
        prescribedPrice: 8.5,
        savings: 141,
        isAvailable: true
      },
      isPrescriptionRequired: true,
      isColdChain: false,
      notes: "Take regularly at the same time each morning."
    },
    {
      id: "med-2",
      name: "Glycomet-GP 2",
      strength: "500mg / 2mg",
      form: "Tablet",
      saltComposition: "Metformin Hydrochloride (500mg SR) + Glimepiride (2mg)",
      dosage: "1 tablet",
      frequency: "Twice daily before major meals",
      duration: "30 Days",
      quantity: 60,
      unitPrice: 4.2,
      selectedVariant: "prescribed",
      genericAlternative: {
        id: "gen-2",
        name: "Metformin + Glimepiride 2mg Generic",
        manufacturer: "Sun Pharma Generics",
        price: 2.0,
        prescribedPrice: 4.2,
        savings: 132,
        isAvailable: true
      },
      isPrescriptionRequired: true,
      isColdChain: false,
      notes: "Do not skip meals after taking."
    },
    {
      id: "med-3",
      name: "Augmentin 625 Duo",
      strength: "500mg / 125mg",
      form: "Tablet",
      saltComposition: "Amoxicillin (500mg) + Potassium Clavulanate (125mg)",
      dosage: "1 tablet",
      frequency: "Twice daily after food",
      duration: "5 Days",
      quantity: 10,
      unitPrice: 24.0,
      selectedVariant: "prescribed",
      genericAlternative: {
        id: "gen-3",
        name: "Amoxyclav 625 Generic (Alkem)",
        manufacturer: "Alkem Laboratories",
        price: 13.0,
        prescribedPrice: 24.0,
        savings: 110,
        isAvailable: true
      },
      isPrescriptionRequired: true,
      isColdChain: false,
      notes: "Complete full 5-day antibiotic course."
    },
    {
      id: "med-4",
      name: "Lantus SoloStar Pen",
      strength: "100 IU/ml (3ml cartridge)",
      form: "Injection",
      saltComposition: "Insulin Glargine (Recombinant DNA origin)",
      dosage: "14 Units subcutaneously",
      frequency: "Once daily at bedtime (10:00 PM)",
      duration: "30 Days",
      quantity: 1,
      unitPrice: 685.0,
      selectedVariant: "prescribed",
      isPrescriptionRequired: true,
      isColdChain: true,
      notes: "Store refrigerated at 2°C to 8°C. Do not freeze."
    }
  ]
};

export const getDemoPrescription = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: DEMO_PRESCRIPTION_BACKEND
  });
};

export const analyzePrescription = (req: Request, res: Response): void => {
  const { prescriptionType } = req.body;
  
  res.status(200).json({
    success: true,
    message: "Prescription analyzed successfully with MediRush AI",
    data: {
      type: prescriptionType || "demo",
      prescription: DEMO_PRESCRIPTION_BACKEND,
      medicines: DEMO_PRESCRIPTION_BACKEND.medicines
    }
  });
};
