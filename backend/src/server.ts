import express, { Application } from "express";
import cors from "cors";
import { config } from "./config/env";
import { connectDB } from "./config/db";
import apiRouter from "./routes";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { seedInitialPharmaciesIfEmpty } from "./services/pharmacyService";

// Initialize Express application
const app: Application = express();

// Standard middleware
app.use(
  cors({
    origin: config.clientUrl || "*",
    credentials: true,
  })
);
app.use(express.json());

// Mount central API router under /api
app.use("/api", apiRouter);

// Centralized error and 404 middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Safe development fallback port handled via config.port
const PORT = config.port;

/**
 * Start the application following the startup flow:
 * Environment Variables -> MongoDB Connection -> Seed Demo Data -> Express Server Starts
 */
const startServer = async (): Promise<void> => {
  // Step 1: Connect to MongoDB before starting server
  await connectDB();

  // Step 2: Seed demo pharmacies if collection is empty (for demo-readiness)
  await seedInitialPharmaciesIfEmpty();

  // Step 3: Start Express HTTP server only after successful DB connection
  const server = app.listen(PORT, () => {
    console.log(`[MediRush Server] Running on port ${PORT}`);
    console.log(`[MediRush Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[MediRush Server] API base: http://localhost:${PORT}/api`);
  });

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    console.log("[MediRush Server] SIGTERM signal received. Closing HTTP server...");
    server.close(() => {
      console.log("[MediRush Server] HTTP server closed cleanly.");
      process.exit(0);
    });
  });
};

startServer();

export default app;
