const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String, // Rich text or simple text
      required: true,
    },
    summary: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
      enum: ["Berita", "Pengumuman", "Prestasi", "Artikel"],
      default: "Berita",
    },
    tags: [String],
    thumbnail: {
      type: String, // URL/Path to image
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Middleware to generate slug from title
newsSchema.pre("save", async function () {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
  }
});

module.exports = mongoose.model("News", newsSchema);
