const express = require("express");
const router = express.Router();
const { isAuth } = require("../middlewares/isAuth");
const Admin = require("../controllers/admin");
const upload = require("../middlewares/storage");
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
router.get("/all-bus-data", isAuth, Admin.realTimeData);

// router.get("/get", async (req, res) => {
// const userRequestedData = {
//   19: {
//     createdAt: "2023-08-27T03:55:04.400+00:00",
//   },
//   12: {
//     createdAt: 1684466971934,
//   },
//   18: {
//     createdAt: "2023-08-27T04:55:12.932Z",
//   },
//   123: {
//     createdAt: "2023-08-27T04:53:31.186+00:00",
//   },
// };

//   const busNumbers = Object.keys(userRequestedData).map(Number);

//   const aggregationPipeline = [
//     {
//       $match: {
//         busNumber: { $in: Object.keys(userRequestedData).map(Number) },
//         $expr: {
//           $or: [
//             { $eq: ["$createdAt", null] },
//             {
//               $gte: [
//                 "$createdAt",
//                 {
//                   $arrayElemAt: ["$userRequestedData.createdAt", "$busNumber"],
//                 },
//               ],
//             },
//           ],
//         },
//       },
//     },
//     {
//       $group: {
//         _id: "$busNumber",
//         busData: { $push: "$$ROOT" },
//       },
//     },
//   ];

//   realTimeLocation.aggregate(aggregationPipeline, (err, result) => {
//     if (err) {
//       console.error("Error:", err);
//     } else {
//       res.json(result);
//       //   console.log(JSON.stringify(result, null, 2));
//     }
//   });
// });

const test = async () => {
  const userRequestedData = null;

  /*  {
    19: {
      createdAt: "2023-08-27T04:54:23.166Z",
    },
    18: {
      createdAt: "2023-08-22T04:55:36.422Z",
    },
    123: {
      createdAt: "2023-08-27T04:53:31.186+00:00",
    },
  }; */
  const aggregationPipeline = [];

  if (Object.keys(userRequestedData).length !== 0) {
    aggregationPipeline.push({
      $match: {
        busNumber: { $in: Object.keys(userRequestedData).map(Number) },
      },
    });
  }

  aggregationPipeline.push(
    {
      $group: {
        _id: "$busNumber",
        busData: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        busNumber: "$_id",
        busData: {
          $map: {
            input: "$busData",
            as: "entry",
            in: {
              latitude: "$$entry.latitude",
              longitude: "$$entry.longitude",
              heading: "$$entry.heading",
              createdAt: "$$entry.createdAt",
            },
          },
        },
      },
    }
  );

  const result = await realTimeLocation.aggregate(aggregationPipeline);

  let filteredData = result;
  if (Object.keys(userRequestedData).length !== 0) {
    filteredData = result.map((bus) => ({
      ...bus,
      busData: bus.busData.filter((entry) => {
        const requestedCreatedAt =
          userRequestedData[entry.busNumber]?.createdAt;
        if (requestedCreatedAt) {
          const entryCreatedAt = new Date(entry.createdAt).getTime();
          const requestedCreatedAtTime = new Date(requestedCreatedAt).getTime();
          return entryCreatedAt > requestedCreatedAtTime;
        }
        return true;
      }),
    }));
  }

  console.log(JSON.stringify(filteredData, null, 2));
};

// test();

module.exports = router;
