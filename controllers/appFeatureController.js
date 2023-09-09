const AppFeatureModel = require("../models/appFeatures");
const AppUpdate = require("../models/appUpdate");

class AppFeatures {
  async getAvailableTime(req, res) {
    const getData = await AppFeatureModel.find({})
      .sort({
        createdAt: -1,
      })
      .select(
        "_id destinationLatitude destinationLongitude startTime endTime temprary updatedAt manualSigin"
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

  async setAppUpdate(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      let createNewAppVersion;

      // update existing vestion
      createNewAppVersion = await AppUpdate.findOneAndUpdate(
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

      if (createNewAppVersion) {
        return res.json({
          message: "New Version Of App Is  Updated sucessfully",
          data: createNewAppVersion,
        });
      } else {
        createNewAppVersion = await new AppUpdate({
          ...req.body,
          contributor: req.user._id,
        }).save();
      }
       if (createNewAppVersion) {
        return res.json({
          message: "New Version Of App Is Created sucessfully",
          data: createNewAppVersion,
        });
      } else {
        return res.json({ error: "New Version Update failed" });
      }
    } else {
    }
    return res.json({ error: "Un Autharize Access" });
  }

  async getAppUpdate(req, res) {
    const getData = await AppUpdate.find({})
      .sort({
        createdAt: -1,
      })
      .select(
        "_id updateVersion updateTitle updateDescription hardUpdate updateLink updatedAt"
      )
      .limit(1);

    return res.json(getData[0]);
  }
}

// a();
module.exports = new AppFeatures();
