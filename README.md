# MediRush (DevFest Hackathon)

> Rapid and Emergency Medicine Delivery Platform tailored for Tier-2 and Tier-3 Indian cities.

---

## 🏗 Repository Structure

```
Medirush-Devfest/
├── backend/       # Express.js + TypeScript Backend API
└── frontend/      # Client Application (developed in parallel)
```

---

## ⚡ Backend Quickstart

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Health check verification:
   ```bash
   curl http://localhost:5000/api/health
   ```
