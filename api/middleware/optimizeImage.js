const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Only optimize images
  if (!req.file.mimetype.startsWith("image/")) {
    return next();
  }

  const filePath = req.file.path;
  const filename = req.file.filename;
  const dir = path.dirname(filePath);
  const nameWithoutExt = path.parse(filename).name;
  const newFilename = `${nameWithoutExt}.webp`;
  const newFilePath = path.join(dir, newFilename);

  try {
    await sharp(filePath)
      .webp({ quality: 80 }) // 80 is a good balance
      .toFile(newFilePath);

    // Update req.file details
    req.file.path = newFilePath;
    req.file.filename = newFilename;
    req.file.mimetype = "image/webp";

    // Delete original file asynchronously (don't block response)
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting original image:", err);
    });

    next();
  } catch (error) {
    console.error("Image optimization failed:", error);
    // If optimization fails, proceed with original file
    next();
  }
};

module.exports = optimizeImage;
