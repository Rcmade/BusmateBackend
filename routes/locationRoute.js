const express = require("express");
const User = require("../models/user");
const {
  addNewLocation,
  asignContributor,
  getNewLocation,
  changeContributor,
} = require("../controllers/location");
const realTimeLocation = require("../models/realTimeLocation");
const router = express.Router();
const contributorData = require("../models/appUtility");

router.post("/addnewlocation", addNewLocation);
router.post("/changecontributor", changeContributor);
router.post("/asignContributor", asignContributor);
router.get("/getnewlocation", getNewLocation);

router.get("/get", async (req, res) => {

});

// router.post("/get", async (req, res) => {
//   // const user = new User(req.body);
//   // await user.save();
//   res.json("user");
// });

module.exports = router;
