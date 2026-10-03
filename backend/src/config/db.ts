import mongoose from "mongoose";
import { config } from "./env";

/**
 * Reusable asynchronous MongoDB connection function using Mongoose.
 * Exits the process if MONGODB_URI is missing or if connection fails.
 */
export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || config.mongoUri;

  if (!mongoUri) {
    console.error("[Database Error] MONGODB_URI environment variable is not defined.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("[Database Connection Error] Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};
