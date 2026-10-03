import { Request, Response } from "express";

/**
 * Controller to handle backend health check.
 * Verifies that the service is up and running.
 */
export const getHealth = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "MediRush backend is running",
    timestamp: new Date().toISOString(),
  });
};
