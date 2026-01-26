const News = require("../models/News");
const fs = require("fs");
const path = require("path");

// Get All News (Public & Admin w/ filter)
exports.getAllNews = async (req, res) => {
  try {
    const { category, limit, isPublished } = req.query;
    let query = {};

    if (category) query.category = category;
    if (isPublished !== undefined) query.isPublished = isPublished === "true";

    const news = await News.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit ? parseInt(limit) : 0)
      .populate("author", "profile.fullName");

    res.json(news);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil berita", error: error.message });
  }
};

// Get Single News
exports.getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug }).populate(
      "author",
      "profile.fullName",
    );
    if (!news)
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    res.json(news);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil detail berita", error: error.message });
  }
};

// Create News
exports.createNews = async (req, res) => {
  try {
    console.log("Create News Request Body:", req.body);
    console.log("Create News File:", req.file);
    console.log("Create News User:", req.user);

    const { title, content, category, tags, summary } = req.body;

    // Handle Image Upload
    let thumbnail = "";
    if (req.file) {
      thumbnail = `/uploads/news/${req.file.filename}`;
    }

    const newNews = new News({
      title,
      content,
      category,
      tags: tags ? tags.split(",") : [],
      summary,
      author: req.user.id,
      thumbnail,
    });

    await newNews.save();
    res.status(201).json(newNews);
  } catch (error) {
    console.error("Create News Error:", error);
    res
      .status(500)
      .json({ message: "Gagal membuat berita", error: error.message });
  }
};

// Update News
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, isPublished } = req.body;

    const news = await News.findById(id);
    if (!news)
      return res.status(404).json({ message: "Berita tidak ditemukan" });

    // Handle Image Update
    if (req.file) {
      // Delete old image if exists
      if (news.thumbnail) {
        const oldPath = path.join(__dirname, "../../", news.thumbnail);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      news.thumbnail = `/uploads/news/${req.file.filename}`;
    }

    news.title = title || news.title;
    news.content = content || news.content;
    news.category = category || news.category;
    if (isPublished !== undefined) news.isPublished = isPublished;

    await news.save();
    res.json(news);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update berita", error: error.message });
  }
};

// Delete News
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news)
      return res.status(404).json({ message: "Berita tidak ditemukan" });

    if (news.thumbnail) {
      const oldPath = path.join(__dirname, "../../", news.thumbnail);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await news.deleteOne();
    res.json({ message: "Berita berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hapus berita", error: error.message });
  }
};
