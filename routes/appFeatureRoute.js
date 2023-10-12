const express = require("express");
const User = require("../models/user");
const AppFeatures = require("../controllers/appFeatureController");
const realTimeLocation = require("../models/realTimeLocation");
const router = express.Router();
const { isAuth } = require("../middlewares/isAuth");
router.get("/get-available-services", isAuth, AppFeatures.getAvailableTime);
router.post("/set-available-services", isAuth, AppFeatures.setAvailableTime);
router.get("/get-app-update", AppFeatures.getAppUpdate);
router.post("/set-app-update", isAuth, AppFeatures.setAppUpdate);

module.exports = router;
