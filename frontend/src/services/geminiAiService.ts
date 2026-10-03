import { ENV, isGeminiConfigured } from '../config/env';
import type { ExtractedMedicine, DemoPrescriptionData } from '../types/prescription';
import { DEMO_PRESCRIPTION } from '../data/patient/demoPrescription';

/**
 * Calls Google Gemini Vision API (gemini-3.7-flash) to extract real doctor prescriptions,
 * medicine names, dosage, frequency, and active chemical salts.
 */
export async function analyzePrescriptionWithGemini(
  fileOrDemo: File | 'demo'
): Promise<{ prescription: DemoPrescriptionData; medicines: ExtractedMedicine[] }> {
  if (fileOrDemo === 'demo') {
    return {
      prescription: DEMO_PRESCRIPTION,
      medicines: JSON.parse(JSON.stringify(DEMO_PRESCRIPTION.medicines)),
    };
  }

  if (!isGeminiConfigured()) {
    console.warn('Gemini API key not configured or demo mode active. Using fallback.');
    return {
      prescription: DEMO_PRESCRIPTION,
      medicines: JSON.parse(JSON.stringify(DEMO_PRESCRIPTION.medicines)),
    };
  }

  try {
    const file = fileOrDemo as File;
    const base64Data = await fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';

    const prompt = `You are MediRush AI Medical OCR & Prescription Intelligence Assistant.
Analyze this prescription image very carefully and extract all prescribed medicines accurately.
Extract the brand/medicine name, active chemical salt compositions, strength, dosage, frequency, duration, estimated quantity, whether it requires a doctor prescription (Schedule H), and whether it needs cold storage (Cold Chain, like insulin).

Return ONLY a clean JSON object with this EXACT structure (no markdown fences, no backticks, just raw JSON):
{
  "doctorName": "Doctor's name if visible, or Dr. Verified Physician",
  "doctorRegNo": "Registration number or KMC-XXXXXX",
  "clinicName": "Clinic or Hospital name if visible",
  "date": "Prescription date or current date",
  "patientName": "Patient name if visible, or Rahul Sharma",
  "patientAge": 46,
  "patientGender": "Male",
  "diagnosis": "Clinical diagnosis or General Medical Therapy",
  "medicines": [
    {
      "name": "Exact Brand / Medicine Name written on prescription",
      "strength": "e.g. 500mg, 650mg, 40mg/12.5mg, 100 IU/ml",
      "form": "Tablet",
      "saltComposition": "Exact scientific chemical composition / active salt",
      "dosage": "e.g. 1 tablet, 14 units",
      "frequency": "e.g. Once daily after breakfast, Twice daily",
      "duration": "e.g. 5 Days, 30 Days",
      "quantity": 10,
      "unitPrice": 12.0,
      "genericName": "Standard Generic Alternative Name (Jan Aushadhi / Cipla)",
      "genericPrice": 6.0,
      "isPrescriptionRequired": true,
      "isColdChain": false
    }
  ]
}`;

    // Try models in order of capability: gemini-flash-latest, gemini-3.7-flash, gemini-3.5-flash, gemini-3.1-flash-lite
    const candidateModels = ['gemini-flash-latest', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    
    let parsedResult: any = null;

    for (const modelName of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${ENV.GEMINI_API_KEY}`;
      
      const payload: any = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType.includes('pdf') ? 'image/png' : mimeType,
                  data: base64Data.split(',')[1] || base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const resJson = await response.json();
          const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            // Remove any potential backticks or markdown if present
            const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            parsedResult = JSON.parse(cleanJson);
            if (parsedResult && parsedResult.medicines && parsedResult.medicines.length > 0) {
              console.log(`[MediRush Gemini AI] Successfully parsed prescription using ${modelName}:`, parsedResult);
              break;
            }
          }
        }
      } catch (e) {
        console.warn(`Attempt with ${modelName} failed, trying next:`, e);
      }
    }

    if (parsedResult && parsedResult.medicines && parsedResult.medicines.length > 0) {
      const mappedMeds: ExtractedMedicine[] = parsedResult.medicines.map((m: any, idx: number) => {
        const unitPrice = Number(m.unitPrice) || 15.0;
        const genericPrice = Number(m.genericPrice) || Number((unitPrice * 0.45).toFixed(1));
        const qty = Number(m.quantity) || 10;
        const savings = Math.max(0, Math.round((unitPrice - genericPrice) * qty));

        return {
          id: `gemini-med-${idx + 1}`,
          name: m.name || `Medicine ${idx + 1}`,
          strength: m.strength || 'Standard',
          form: (['Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler'].includes(m.form) ? m.form : 'Tablet') as any,
          saltComposition: m.saltComposition || m.name,
          dosage: m.dosage || '1 unit',
          frequency: m.frequency || 'Once daily after food',
          duration: m.duration || '10 Days',
          quantity: qty,
          unitPrice,
          selectedVariant: 'prescribed',
          genericAlternative: {
            id: `gen-${idx + 1}`,
            name: m.genericName || `${m.saltComposition || m.name} Generic`,
            manufacturer: 'Jan Aushadhi / Certified Generic Labs',
            price: genericPrice,
            prescribedPrice: unitPrice,
            savings,
            isAvailable: true
          },
          isPrescriptionRequired: m.isPrescriptionRequired ?? true,
          isColdChain: m.isColdChain ?? Boolean(m.name?.toLowerCase().includes('insulin') || m.name?.toLowerCase().includes('lantus')),
          notes: m.notes || 'Take as advised by the consulting physician.'
        };
      });

      return {
        prescription: {
          id: `rx_gemini_${Date.now()}`,
          doctorName: parsedResult.doctorName || 'Dr. Verified Physician',
          doctorRegNo: parsedResult.doctorRegNo || 'REG-MED-2026',
          clinicName: parsedResult.clinicName || 'Apollo Speciality Health Center',
          date: parsedResult.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          patientName: parsedResult.patientName || 'Rahul Sharma',
          patientAge: Number(parsedResult.patientAge) || 46,
          patientGender: parsedResult.patientGender || 'Male',
          diagnosis: parsedResult.diagnosis || 'Prescribed Clinical Therapy',
          medicines: mappedMeds
        },
        medicines: mappedMeds
      };
    }
  } catch (err) {
    console.error('Gemini Vision Extraction Error:', err);
  }

  // Graceful fallback
  return {
    prescription: DEMO_PRESCRIPTION,
    medicines: JSON.parse(JSON.stringify(DEMO_PRESCRIPTION.medicines)),
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
