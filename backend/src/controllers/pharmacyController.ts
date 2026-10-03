import { Request, Response, NextFunction } from "express";
import {
  findNearbyPharmacies,
  getPharmacyByIdWithStock,
  seedInitialPharmaciesIfEmpty,
} from "../services/pharmacyService";

/**
 * Controller for GET /api/pharmacies/nearby.
 * Finds pharmacies near the given coordinates within the specified radius (in km).
 */
export const getNearbyPharmaciesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const latStr = req.query.latitude as string;
    const lonStr = req.query.longitude as string;
    const radiusStr = req.query.radius as string;

    if (!latStr || !lonStr) {
      res.status(400).json({
        success: false,
        message: "Query parameters 'latitude' and 'longitude' are required.",
      });
      return;
    }

    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lonStr);
    const radiusKm = radiusStr ? parseFloat(radiusStr) : 10;

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        success: false,
        message: "Invalid 'latitude' or 'longitude' numeric values provided.",
      });
      return;
    }

    const results = await findNearbyPharmacies(latitude, longitude, radiusKm);

    res.status(200).json({
      success: true,
      count: results.length,
      radiusKm,
      pharmacies: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for GET /api/pharmacies/:id/stock.
 * Retrieves a pharmacy and its detailed stock inventory.
 */
export const getPharmacyStockHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const pharmacy = await getPharmacyByIdWithStock(id);
    if (!pharmacy) {
      res.status(404).json({
        success: false,
        message: `Pharmacy with ID '${id}' not found.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      pharmacy: {
        id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
        isOnline: pharmacy.isOnline,
        stock: pharmacy.stock,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for POST /api/pharmacies/seed (Demo helper).
 */
export const seedPharmaciesHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await seedInitialPharmaciesIfEmpty();
    res.status(200).json({
      success: true,
      message: "Demo pharmacies verified and initialized.",
    });
  } catch (error) {
    next(error);
  }
};
