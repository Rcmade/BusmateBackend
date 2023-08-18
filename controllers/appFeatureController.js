const AppFeatureModel = require("../models/appFeatures");

class AppFeatures {
  async getAvailableTime(req, res) {
    const getData = await AppFeatureModel.find({})
      .sort({
        createdAt: -1,
      })
      .select(
        "_id destinationLatitude destinationLongitude startTime endTime temprary updatedAt"
      )
      .limit(1);

    console.log();
    return res.json(getData[0]);
  }

  async setAvailableTime(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      const createServices = new AppFeatureModel({
        ...req.body,
        contributor: req.user._id,
      }).save();
      if (createServices) {
        return res.json({ message: "All the service are created sucessfully" });
      } else {
        return res.json({ error: "Service creation failed" });
      }
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }
}

const a = async () => {
  await AppFeatureModel.insertMany([
    {
      destinationLatitude: 34.0522,
      destinationLongitude: -118.2437,
      startTime: new Date("2023-08-10T10:00:00Z"),
      endTime: new Date("2023-08-10T14:00:00Z"),
      temporary: true,
      contributor: "615a7d9d8f1a192f6c7a1b1a",
    },
    {
      destinationLatitude: 40.7128,
      destinationLongitude: -74.006,
      startTime: new Date("2023-08-15T18:30:00Z"),
      endTime: new Date("2023-08-15T22:00:00Z"),
      temporary: false,
      contributor: "615a7eae8f1a192f6c7a1b1b",
    },
  ]);
};

// a();
module.exports = new AppFeatures();
