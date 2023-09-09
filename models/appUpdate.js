const mongoose = require("mongoose");
const AppUpdate = new mongoose.Schema(
  {
    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "User",
    },

    updateVersion: {
      type: Number,
      default: 24,
    },
    updateTitle: {
      type: String,
      default: "🚀 Time to Elevate Your Experience! 📲",
    },

    updateDescription: {
      type: String,
      default:
        "🌠 Discover new features and turbocharged performance.\n 🌠 Crush those pesky bugs from the past.\n 🌠 Join the future of mobile with the latest version.\n Don't miss out! Update now and be part of the adventure. 🚀✨\n",
    },

    hardUpdate: {
      type: Boolean,
      default: false,
    },

    updateLink: {
      type: String,
      default: "market://details?id=com.busmate",
    },
  },
  { timestamps: true }
);

module.exports = { AppUpdate };

module.exports = mongoose.model("AppUpdate", AppUpdate);
