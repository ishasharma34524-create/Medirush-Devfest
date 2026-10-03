import multer from "multer";

// Configure memory storage for uploaded prescription images
const storage = multer.memoryStorage();

// Accept common image mime types (JPEG, PNG, WebP) up to 10MB
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, true);
    }
  },
});
