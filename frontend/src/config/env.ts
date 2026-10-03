// Environment configuration helper
export const ENV = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  IS_PRODUCTION: import.meta.env.PROD,
};

// Check if Gemini API key is configured
export const isGeminiConfigured = (): boolean => {
  return Boolean(ENV.GEMINI_API_KEY && !ENV.GEMINI_API_KEY.includes('your_'));
};
