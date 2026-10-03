# MediRush (DevFest Hackathon)

> Rapid and Emergency Medicine Delivery Platform tailored for Tier-2 and Tier-3 Indian cities.

---

## 🏗 Repository Structure

```
Medirush-Devfest/
├── backend/       # Express.js + TypeScript + MongoDB + Gemini Vision API
└── frontend/      # React + Vite + TypeScript + Tailwind Patient App
```

---

## 🚀 Quickstart Guide

### 1. Backend Server Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
* **API Server:** `http://localhost:5000`
* **Health Check:** `http://localhost:5000/api/health`

### 2. Frontend Client Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
* **Client App:** `http://localhost:5173`

---

## 📡 Core API Flow

1. **`GET /api/health`** — Server and service verification
2. **`POST /api/prescriptions/parse`** — Gemini OCR with resilient Tier-2/3 medicine fallback
3. **`GET /api/pharmacies/nearby`** — Haversine-distance nearby pharmacy stock discovery
4. **`POST /api/orders`** — Create emergency medicine order (`CREATED`)
5. **`POST /api/orders/:id/broadcast`** — Broadcast to matching local pharmacies (`BROADCASTING`)
6. **`POST /api/orders/:id/confirm`** — Pharmacist acceptance lock (`PHARMACY_ACCEPTED`)
7. **`POST /api/orders/:id/dispatch`** — Dispatch live delivery rider (`OUT_FOR_DELIVERY`)
