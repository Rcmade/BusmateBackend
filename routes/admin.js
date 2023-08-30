const express = require("express");

const router = express.Router();
const { isAuth } = require("../middlewares/isAuth");
const Admin = require("../controllers/admin");
const upload = require("../middlewares/storage");
const { backupMiddleware } = require("../middlewares/backupMiddleware");
const realTimeLocation = require("../models/realTimeLocation");

router.post("/user-varify", isAuth, Admin.authenticateUser);
router.post("/user-not-varify", isAuth, Admin.authenticateNotUser);
router.post("/user-create", isAuth, upload.array("imgs"), Admin.createUser);
router.get("/user-all-user-view", isAuth, Admin.allUserView);
router.get("/user-search", isAuth, Admin.userSearch);
router.get("/user-profile", isAuth, Admin.userProfile);
router.post("/nginx-error", isAuth, Admin.nginxError);
router.get("/remove-realtime-location", isAuth, Admin.removeRealTimeLocation);
router.get("/remove-contributor", isAuth, Admin.removeContributorDb);
router.get("/current-contributors", isAuth, Admin.currentContributor);
router.get("/db-status", isAuth, Admin.databaseStats);

router.get("/get", async (req, res) => {
  const userRequestedData = {
    19: {
      createdAt: "2023-08-27T03:55:04.400+00:00",
    },
    12: {
      createdAt: 1684466971934,
    },
    18: {
      createdAt: "2023-08-27T04:55:12.932Z",
    },
    123: {
      createdAt: "2023-08-27T04:53:31.186+00:00",
    },
  };

  const busNumbers = Object.keys(userRequestedData).map(Number);

  const aggregationPipeline = [
    {
      $match: {
        busNumber: { $in: Object.keys(userRequestedData).map(Number) },
        $expr: {
          $or: [
            { $eq: ["$createdAt", null] },
            {
              $gte: [
                "$createdAt",
                {
                  $arrayElemAt: ["$userRequestedData.createdAt", "$busNumber"],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$busNumber",
        busData: { $push: "$$ROOT" },
      },
    },
  ];

  realTimeLocation.aggregate(aggregationPipeline, (err, result) => {
    if (err) {
      console.error("Error:", err);
    } else {
      res.json(result);
      //   console.log(JSON.stringify(result, null, 2));
    }
  });
});

module.exports = router;
