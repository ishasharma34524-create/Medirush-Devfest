import { GoogleGenAI } from "@google/genai";
import { config } from "./env";

/**
 * Initializes and returns the GoogleGenAI instance if API key is configured.
 * Returns null if the API key is missing, enabling safe fallback in demo mode.
 */
export const getGeminiClient = (): GoogleGenAI | null => {
  if (!config.geminiApiKey || config.geminiApiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey: config.geminiApiKey });
};
