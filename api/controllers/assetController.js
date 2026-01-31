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

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newAsset = new Asset({
      code,
      name,
      category,
      condition,
      location,
      purchaseDate,
      purchasePrice,
      currentValue: purchasePrice, // Awal nilai = harga beli
      image,
    });

    await newAsset.save();
    res.status(201).json(newAsset);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menambah aset", error: error.message });
  }
};

// Update Asset (Full Update)
exports.updateAsset = async (req, res) => {
  try {
    const { assetId } = req.params;
    const {
      code,
      name,
      category,
      condition,
      location,
      purchaseDate,
      purchasePrice,
    } = req.body;

    const updates = {
      code,
      name,
      category,
      condition,
      location,
      purchaseDate,
      purchasePrice,
    };

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const asset = await Asset.findByIdAndUpdate(assetId, updates, {
      new: true,
    });

    if (!asset) {
      return res.status(404).json({ message: "Aset tidak ditemukan" });
    }

    res.json(asset);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update aset", error: error.message });
  }
};

// Delete Asset
exports.deleteAsset = async (req, res) => {
  try {
    const { assetId } = req.params;
    const asset = await Asset.findByIdAndDelete(assetId);

    if (!asset) {
      return res.status(404).json({ message: "Aset tidak ditemukan" });
    }

    res.json({ message: "Aset berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal hapus aset", error: error.message });
  }
};

// List Aset (Bisa filter by location)
exports.getAssets = async (req, res) => {
  try {
    const { location } = req.query;
    const filter = location ? { location } : {};
    const assets = await Asset.find(filter).sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data aset", error: error.message });
  }
};
