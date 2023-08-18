const mongoose = require("mongoose");
const AppFeatureSchema = new mongoose.Schema(
  {
    destinationLatitude: {
      type: Number,
    },
    destinationLongitude: {
      type: Number,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    temprary: {
      type: Boolean,
      default: false,
    },
    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = { AppFeatureSchema };

module.exports = mongoose.model("AppFeature", AppFeatureSchema);
