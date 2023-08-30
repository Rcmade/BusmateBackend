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

    return res.json(getData[0]);
  }

  async setAvailableTime(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      let createServices;

      // update existing time
      createServices = await AppFeatureModel.findOneAndUpdate(
        {
          contributor: req.user._id,
        },
        {
          $set: req.body,
        },
        {
          // It will return the new contributor document
          new: true,
        }
      );

      if (createServices) {
        return res.json({ message: "All the service are Updated sucessfully" });
      } else {
        createServices = await new AppFeatureModel({
          ...req.body,
          contributor: req.user._id,
        }).save();
      }
      if (createServices) {
        return res.json({ message: "All the service are Created sucessfully" });
      } else {
        return res.json({ error: "Service creation failed" });
      }
    } else {
    }
    return res.json({ error: "Un Autharize Access" });
  }
}

// a();
module.exports = new AppFeatures();
