const Asset = require("../models/Asset");

// Tambah Aset Baru
exports.createAsset = async (req, res) => {
  try {
    const {
      code,
      name,
      category,
      condition,
      location,
      purchaseDate,
      purchasePrice,
    } = req.body;

    const newAsset = new Asset({
      code,
      name,
      category,
      condition,
      location,
      purchaseDate,
      purchasePrice,
      currentValue: purchasePrice, // Awal nilai = harga beli
    });

    await newAsset.save();
    res.status(201).json(newAsset);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menambah aset", error: error.message });
  }
};

// Update Kondisi Aset (Misal saat Stock Opname)
exports.updateAssetCondition = async (req, res) => {
  try {
    const { assetId } = req.params;
    const { condition, location } = req.body;

    const asset = await Asset.findByIdAndUpdate(
      assetId,
      { condition, location },
      { new: true }
    );

    res.json(asset);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update aset", error: error.message });
  }
};

// List Aset by Lokasi
exports.getAssetsByLocation = async (req, res) => {
  try {
    const { location } = req.query;
    const assets = await Asset.find({ location });
    res.json(assets);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data aset", error: error.message });
  }
};
