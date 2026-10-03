import mongoose from "mongoose";
import { config } from "./env";

/**
 * Asynchronous MongoDB connection with fail-safe fast timeout (3s).
 * If MongoDB is reachable, it connects and logs confirmation.
 * If offline or unconfigured, it logs clear notice and enables resilient demo mode
 * ensuring the Express HTTP server always starts cleanly for presentations.
 */
export const connectDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI || config.mongoUri;

  if (!mongoUri || mongoUri.includes("your_mongodb")) {
    console.warn(
      "[Database] MONGODB_URI not configured in .env. Running in Resilient Demo In-Memory Mode."
    );
    return false;
  }

  try {
    // 3000ms timeout prevents hanging when local MongoDB is not running
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("MongoDB connected successfully");
    return true;
  } catch (error: any) {
    console.warn(
      `[Database Notice] MongoDB connection attempt failed: ${error?.message || error}`
    );
    console.warn(
      "[Database Notice] Operating in Resilient In-Memory Demo Mode. Server will start normally on port 5000."
    );
    return false;
  }
};
