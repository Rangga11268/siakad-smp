const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");
const { auth, checkRole } = require("../middleware/authMiddleware");

router.post("/", auth, checkRole(["admin"]), assetController.createAsset);
router.patch(
  "/:assetId",
  auth,
  checkRole(["admin"]),
  assetController.updateAssetCondition
);
router.get("/", auth, assetController.getAssetsByLocation);

module.exports = router;
