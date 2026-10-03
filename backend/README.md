# MediRush Backend (Server)

Production-grade Express + TypeScript backend foundation for **MediRush** — an emergency and rapid medicine delivery platform tailored for Tier-2 and Tier-3 Indian cities.

---

## 🛠 Tech Stack

* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** MongoDB via Mongoose
* **Package Manager:** npm
* **Utilities:** CORS, dotenv

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Environment & database configuration
│   │   ├── db.ts            # MongoDB connection logic
│   │   └── env.ts           # Environment variables loader
│   ├── controllers/         # Request handling logic
│   │   └── health.controller.ts
│   ├── middleware/          # Centralized middleware (404, errors)
│   │   ├── error.middleware.ts
│   │   └── notFound.middleware.ts
│   ├── models/              # Data models (Mongoose schemas)
│   ├── routes/              # Modular API routing
│   │   ├── health.routes.ts
│   │   └── index.ts
│   ├── services/            # Core business logic & Gemini AI services
│   ├── socket/              # Real-time WebSocket/Socket.IO handlers
│   ├── utils/               # Shared utilities & helpers
│   └── server.ts            # Server entrypoint & DB connection orchestration
├── .env.example             # Template for environment variables
├── .env                     # Local environment configuration
├── .gitignore               # Git ignored files & directories
├── package.json             # Dependencies and npm scripts
├── tsconfig.json            # TypeScript compiler configuration
└── README.md                # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites

* **Node.js** >= 18.0.0
* **npm** >= 9.0.0

### 2. Installation

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Environment Variables

Create your `.env` file from the provided `.env.example`:

```bash
cp .env.example .env
```

Default variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

## 🏃 Available Scripts

* **`npm run dev`**: Starts the development server with live reload using `tsx watch`.
* **`npm run build`**: Compiles TypeScript files into the `dist/` directory via `tsc`.
* **`npm start`**: Runs the compiled production code from `dist/server.js`.

---

## 📡 API Endpoints

### Health Check

Verify that the server is operational:

* **Endpoint:** `GET /api/health`
* **Response Status:** `200 OK`
* **Response Body:**

```json
{
  "success": true,
  "message": "MediRush backend is running",
  "timestamp": "2026-10-03T07:15:00.000Z"
}
```

---

## 🧱 Extensibility & Next Steps

This foundation is designed modularly to accommodate subsequent phases without architectural refactoring:
* **MongoDB & Mongoose:** Connect inside `src/config/database.ts` and define schemas in `src/models/`.
* **Authentication:** Add JWT/session middleware in `src/middleware/auth.middleware.ts`.
* **Gemini AI:** Add service wrappers under `src/services/gemini.service.ts`.
* **Socket.IO:** Attach WebSocket server to the HTTP instance in `src/server.ts` and route events via `src/socket/`.
