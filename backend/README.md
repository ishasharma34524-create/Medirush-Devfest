# MediRush Backend MVP

Production-grade Express + TypeScript + MongoDB + Gemini AI backend for **MediRush** — an emergency and rapid medicine delivery platform tailored for Tier-2 and Tier-3 Indian cities.

---

## 🛠 Tech Stack

* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** MongoDB via Mongoose (with geospatial/Haversine matching)
* **AI:** Official `@google/genai` SDK (Gemini Vision OCR with resilient fallback)
* **File Uploads:** Multer (memoryStorage)
* **Utilities:** CORS, dotenv

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts                     # MongoDB connection with safe process exit
│   │   ├── env.ts                    # Strict typed environment variable loader
│   │   └── gemini.ts                 # Official @google/genai client initializer
│   ├── models/
│   │   ├── Pharmacy.ts               # Pharmacy schema with stocks & location
│   │   ├── Medicine.ts               # Medicine schema with coldChain & schedule
│   │   ├── Prescription.ts           # Prescription schema with AI confidence
│   │   └── Order.ts                  # Order lifecycle schema (8 status states)
│   ├── controllers/
│   │   ├── prescriptionController.ts # POST /api/prescriptions/parse
│   │   ├── pharmacyController.ts     # Nearby & stock endpoints
│   │   └── orderController.ts        # Order create, broadcast, confirm, dispatch
│   ├── routes/
│   │   ├── health.routes.ts          # GET /api/health
│   │   ├── prescriptionRoutes.ts     # Prescription OCR route
│   │   ├── pharmacyRoutes.ts         # Pharmacy discovery routes
│   │   ├── orderRoutes.ts            # Order lifecycle routes
│   │   └── index.ts                  # Root API router (/api)
│   ├── services/
│   │   ├── geminiService.ts          # Gemini Vision + Demo Fallback OCR
│   │   ├── pharmacyService.ts        # Haversine distance & inventory matcher
│   │   └── orderService.ts           # Order state machine & rider dispatcher
│   ├── middleware/
│   │   ├── uploadMiddleware.ts       # Multer memory storage (images)
│   │   ├── error.middleware.ts        # Centralized 500/async error handler
│   │   └── notFound.middleware.ts     # Centralized 404 handler
│   └── server.ts                     # Express server & DB startup orchestration
├── .env.example
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Environment Variables

Create `.env` using `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/medirush
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

---

## 🏃 Run Commands

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Start in live-reload development mode
npm run dev

# 3. Or build and start production server
npm run build
npm start
```

---

## 📡 Complete API Reference

### 1. Health Check
* **`GET /api/health`**
```json
{
  "success": true,
  "message": "MediRush backend is running",
  "timestamp": "2026-10-03T08:35:15.833Z"
}
```

### 2. Prescription AI (Gemini Vision OCR + Fault-Tolerant Fallback)
* **`POST /api/prescriptions/parse`**
* **Form-Data:** `image` (File, optional in demo), `patientId` (text)
```json
{
  "success": true,
  "isFallback": false,
  "source": "Gemini Vision AI (@google/genai)",
  "medicines": [
    {
      "brandName": "Lantus",
      "salt": "Insulin Glargine",
      "strength": "100 IU/mL",
      "quantity": 1,
      "coldChain": true,
      "scheduleType": "H",
      "confidence": 0.94
    },
    {
      "brandName": "Augmentin",
      "salt": "Amoxicillin + Clavulanic Acid",
      "strength": "625 mg",
      "quantity": 10,
      "coldChain": false,
      "scheduleType": "H",
      "confidence": 0.91
    }
  ]
}
```

### 3. Pharmacy Discovery
* **`GET /api/pharmacies/nearby?latitude=22.7244&longitude=75.8839&radius=10`**
Returns online pharmacies ordered by Haversine distance in kilometers:
```json
{
  "success": true,
  "count": 2,
  "pharmacies": [
    {
      "pharmacy": {
        "id": "650000000000000000000001",
        "name": "Sanjeevani Medicos (Palasia)",
        "address": "12/A Greater Kailash Road, Old Palasia, Indore, MP",
        "latitude": 22.7244,
        "longitude": 75.8839,
        "isOnline": true
      },
      "distanceKm": 0,
      "isOnline": true,
      "relevantStock": [...]
    }
  ]
}
```

* **`GET /api/pharmacies/:id/stock`**
Returns pharmacy inventory.

### 4. Order Lifecycle
* **`POST /api/orders`**
Payload:
```json
{
  "patientId": "patient_indore_99",
  "medicines": [
    { "brandName": "Lantus", "salt": "Insulin Glargine", "strength": "100 IU/mL", "quantity": 1 }
  ],
  "deliveryLocation": {
    "address": "Flat 204, Anoop Nagar, Indore",
    "latitude": 22.73,
    "longitude": 75.89
  }
}
```

* **`GET /api/orders/:id`**
Fetches order state.

* **`POST /api/orders/:id/broadcast`**
Payload: `{ "radiusKm": 10 }`
Transitions status to `BROADCASTING`, queries nearby online pharmacies, matches requested medicines against stock, and returns matching pharmacies sorted by distance.

* **`POST /api/orders/:id/confirm`**
Payload: `{ "pharmacyId": "650000000000000000000001" }`
Assigns the pharmacy, sets status to `PHARMACY_ACCEPTED`, and guards against duplicate confirmation.

* **`POST /api/orders/:id/dispatch`**
Sets status to `OUT_FOR_DELIVERY`, assigns rider (Rahul, Hero Splendor, MP-43-E-2101), and sets realistic ETA (15 minutes).
