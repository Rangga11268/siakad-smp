const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");
const { auth, checkRole } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

router.post(
  "/",
  auth,
  checkRole(["admin"]),
  upload.single("image"),
  assetController.createAsset,
);
router.put(
  "/:assetId",
  auth,
  checkRole(["admin"]),
  upload.single("image"),
  assetController.updateAsset,
);
router.delete(
  "/:assetId",
  auth,
  checkRole(["admin"]),
  assetController.deleteAsset,
);
router.get("/", auth, assetController.getAssets);

module.exports = router;
