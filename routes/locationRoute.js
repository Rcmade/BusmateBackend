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

router.post("/addnewlocation", addNewLocation);
router.post("/changecontributor", changeContributor);
router.post("/asignContributor", asignContributor);

router.get("/getnewlocation", getNewLocation);

router.get("/get", async (req, res) => {
  // res.json(await realTimeLocation.findOne({ busNumber: 18 }));
  const user = await User.findByIdAndUpdate(
    "64322d6e01b149350d7e1fe7",
    {
      $inc: { weight: -0.05 },
    },  
    { new: true }
  );
  res.json({ user });
});

router.post("/get", async (req, res) => {
  // const user = new User(req.body);
  // await user.save();
  res.json("user");
});

module.exports = router;
