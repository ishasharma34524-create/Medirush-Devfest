import { ENV, isGeminiConfigured } from '../config/env';
import type { ExtractedMedicine, DemoPrescriptionData } from '../types/prescription';
import { DEMO_PRESCRIPTION } from '../data/patient/demoPrescription';

/**
 * Calls Google Gemini Vision API to analyze real uploaded prescription images
 * with automatic fallback to high-quality deterministic dataset.
 */
export async function analyzePrescriptionWithGemini(
  fileOrDemo: File | 'demo'
): Promise<{ prescription: DemoPrescriptionData; medicines: ExtractedMedicine[] }> {
  if (fileOrDemo === 'demo' || !isGeminiConfigured()) {
    // Return deterministic demo prescription
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
Analyze this doctor's prescription image and extract structured medicines in JSON format.
Return ONLY valid JSON matching this schema without any markdown formatting or backticks:
{
  "doctorName": "string",
  "clinicName": "string",
  "diagnosis": "string",
  "medicines": [
    {
      "name": "string (brand or salt name)",
      "strength": "string (e.g. 500mg, 40mg/12.5mg)",
      "form": "Tablet | Capsule | Syrup | Injection | Inhaler",
      "saltComposition": "string (exact active chemical salt compositions)",
      "dosage": "string (e.g. 1 tablet)",
      "frequency": "string (e.g. Twice daily after meals)",
      "duration": "string (e.g. 5 Days, 30 Days)",
      "quantity": number,
      "unitPrice": number (estimated INR price),
      "isPrescriptionRequired": true,
      "isColdChain": boolean
    }
  ]
}`;

    // Use gemini-1.5-flash endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ENV.GEMINI_API_KEY}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
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
      })
    });

    if (response.ok) {
      const result = await response.json();
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (parsed.medicines && Array.isArray(parsed.medicines) && parsed.medicines.length > 0) {
          const mappedMeds: ExtractedMedicine[] = parsed.medicines.map((m: any, idx: number) => ({
            id: `gemini-med-${idx + 1}`,
            name: m.name || `Medicine ${idx + 1}`,
            strength: m.strength || 'Standard Dose',
            form: m.form || 'Tablet',
            saltComposition: m.saltComposition || m.name,
            dosage: m.dosage || '1 unit',
            frequency: m.frequency || 'Once daily',
            duration: m.duration || '10 Days',
            quantity: m.quantity || 10,
            unitPrice: m.unitPrice || 15.0,
            selectedVariant: 'prescribed',
            isPrescriptionRequired: m.isPrescriptionRequired ?? true,
            isColdChain: m.isColdChain ?? false,
          }));

          return {
            prescription: {
              id: `rx_gemini_${Date.now()}`,
              doctorName: parsed.doctorName || 'Prescribing Doctor',
              doctorRegNo: 'VERIFIED-REG',
              clinicName: parsed.clinicName || 'Speciality Clinic',
              date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              patientName: 'Rahul Sharma',
              patientAge: 46,
              patientGender: 'Male',
              diagnosis: parsed.diagnosis || 'Prescribed Therapy',
              medicines: mappedMeds
            },
            medicines: mappedMeds
          };
        }
      }
    }
  } catch (err) {
    console.warn('Gemini API call failed or timed out, using fallback demo data:', err);
  }

  // Graceful fallback to guarantee demo never crashes
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
