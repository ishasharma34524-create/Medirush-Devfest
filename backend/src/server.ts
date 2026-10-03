import express, { Application } from "express";
import cors from "cors";
import { config } from "./config/env";
import apiRouter from "./routes";
import { notFoundHandler } from "./middleware/notFound.middleware";
import { errorHandler } from "./middleware/error.middleware";

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

const server = app.listen(PORT, () => {
  console.log(`[MediRush Server] Running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`[MediRush Server] Health check: http://localhost:${PORT}/api/health`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("[MediRush Server] SIGTERM signal received. Closing HTTP server...");
  server.close(() => {
    console.log("[MediRush Server] HTTP server closed cleanly.");
    process.exit(0);
  });
});

export default app;
