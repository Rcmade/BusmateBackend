const express = require("express");
const User = require("../models/user");
const AppFeatures = require("../controllers/appFeatureController");
const realTimeLocation = require("../models/realTimeLocation");
const router = express.Router();
const { isAuth } = require("../middlewares/isAuth");
router.get("/get-available-services", AppFeatures.getAvailableTime);
router.post("/set-available-services", isAuth, AppFeatures.setAvailableTime);

module.exports = router;
