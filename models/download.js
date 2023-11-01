const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema(
  {
    downloadedAt: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

const Download = mongoose.model("Download", downloadSchema);

module.exports = Download;
