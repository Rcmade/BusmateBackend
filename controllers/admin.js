const SearchService = require("../Services/searchServices");
const { getPublicId, statistics } = require("../helpers/functions");
const userNotAuthenticateUserEmail = require("../helpers/userNotAuthenticateUserEmail");
const User = require("../models/user");
const EmailServices = require("../Services/emailServices");
const cloudinary = require("../config/config");
const userAuthenticateUserEmail = require("../helpers/userAuthenticateUserEmail");
const realTimeLocation = require("../models/realTimeLocation");
const ContributorDb = require("../models/appUtility");
const FiveDaysLocation = require("../models/fiveDaysLocation");

class Admin {
  async authenticateUser(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      req.body.updatedData._id = undefined;
      const user = await User.findByIdAndUpdate(
        req.body._id,
        {
          $set: req.body.updatedData,
        },
        { new: true }
      );
      if (user) {
        await EmailServices.sendEmailService(
          user.email,
          userAuthenticateUserEmail(user.name)
        );
        return res.json({ message: "User have been updated" });
      } else {
        return res.json({ error: "No user found" });
      }
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async authenticateNotUser(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      const user = await User.findById(req.body._id);
      if (user) {
        const profilePublicId = await getPublicId(user.profileImage);

        const idCardPublicId = await getPublicId(user.profileImage);

        await cloudinary.uploader.destroy(
          profilePublicId,
          function (error, result) {
            if (error) {
              console.log(error);
            } else {
              // console.log(result);
            }
          }
        );
        await cloudinary.uploader.destroy(
          idCardPublicId,
          function (error, result) {
            if (error) {
              console.log(error);
            } else {
              // console.log(result);
            }
          }
        );

        await User.findByIdAndDelete(user._id);

        await EmailServices.sendEmailService(
          user.email,
          userNotAuthenticateUserEmail(
            req.body.name,
            req.body.email,
            req.body.idCard,
            req.body.busNumber,
            req.body.profileImage || "Not Added"
          )
        );

        return res.json({
          message: `Email has been sent to this email ${user.email} . And Also deleted`,
        });
      } else {
        return res.json({ error: "No user found" });
      }
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async createUser(req, res) {
    if (
      (req.user.role === "superAdmin" || req.user.role === "admin") &&
      req.user.isAuthenticated === true
    ) {
      const files = req.files;
      try {
        // validation
        const { name, email, password, idCard, busNumber, role } = req.body;

        try {
          const results = [];
          if (files?.length) {
            for (const file of files) {
              const b64 = Buffer.from(file.buffer).toString("base64");
              let dataURI = "data:" + file.mimetype + ";base64," + b64;
              // console.log(dataURI);
              const result = await cloudinary.uploader.upload(dataURI, {
                resource_type: "auto",
                width: 300,
                height: 300,
                crop: "fill",
              });
              // console.log({ result });
              results.push({ uri: result.secure_url, type: file.originalname });
            }
          }

          const imgsObj = {};

          results.forEach((element) => {
            // console.log(element);
            Object.assign(imgsObj, { [element["type"]]: element["uri"] });
          });

          const user = await new User({
            name,
            email,
            password,
            idCard: email,
            busNumber,
            role: "driver",
            ...imgsObj,
          }).save();

          return res.json({
            user: { name: user.name, email: user.email },
            message: `User has been created with this email address ${user.email}`,
          });
        } catch (err) {
          console.log(err);
          return res.json({
            error: err.message,
          });
        }
      } catch (err) {
        console.log(err);
        return res.json({
          error: err.message,
        });
      }
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async allUserView(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      // if query is number then convert it into number from string even query is object of objects
      const parsedQuery = await JSON.parse(req.query.data);

      const data = await SearchService.adminPagination(
        parsedQuery["page"],
        parsedQuery["limit"],
        await parsedQuery["query"],
        await parsedQuery["sorting"]
      );
      return res.json(data);
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async userSearch(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      return res.json(await SearchService.adminSearch(req.query.data));
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async userProfile(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      return res.json(await User.findById(req.query._id));
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  // need to be created
  async nginxError(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async removeRealTimeLocation(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      const deleteRealTime = await realTimeLocation.deleteMany({
        busNumber: +req.query.busNumber,
      });

      return res.json({
        message: `Document has been deleted from RealTimeLocation DataBase for busNumber ${+req
          .query.busNumber} and Total length of documents is ${
          deleteRealTime?.deletedCount
        } `,
      });
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async removeContributorDb(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      const deleteRealTime = await ContributorDb.deleteMany({
        busNumber: +req.query.busNumber,
      });

      // console.log(JSON.stringify(deleteRealTime, null, 2));
      return res.json({
        message: `Document has been deleted from Contributor DataBase for busNumber ${+req
          .query.busNumber} and Total length of documents is ${
          deleteRealTime?.deletedCount
        } `,
      });
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async currentContributor(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      const contributor = await ContributorDb.find({})
        .select("-__v")
        .populate({
          path: "previousFiveContributor.contributor",
          select: ["name", "weight", "profileImage"],
        })
        .populate({
          path: "currentContributor",
          select: ["name", "weight", "profileImage"],
        });
      return res.json(contributor);
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async dashBoard(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      const contributor = await ContributorDb.find({})
        .select("-_id -__v")
        .populate({
          path: "previousFiveContributor.contributor",
          select: ["name", "weight"],
        })
        .populate({
          path: "currentContributor",
          select: ["name", "weight"],
        });
      return res.json(contributor);
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async databaseStats(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      const ContributorStats = await statistics(ContributorDb, "ContributorDb");
      const UserStats = await statistics(User, "UserDb");
      const FiveDaysLocationStats = await statistics(
        FiveDaysLocation,
        "FiveDaysLocationDb"
      );
      const RealTimeLocationStats = await statistics(
        realTimeLocation,
        "RealTimeLocationDb"
      );

      return res.json([
        RealTimeLocationStats,
        ContributorStats,
        UserStats,
        FiveDaysLocationStats,
      ]);
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }

  async realTimeData(req, res) {
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      const userRequestedData = req.query;
      console.log(userRequestedData);
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
        filteredData = filteredData.map((bus) => {
          return {
            busNumber: bus.busNumber,
            busData: bus.busData.filter((dataPoint) => {
              const dataTimestamp = new Date(dataPoint.createdAt);
              const requestedTimestamp = new Date(
                userRequestedData[bus.busNumber]?.createdAt
              );
              return dataTimestamp > requestedTimestamp;
            }),
          };
        });
      }

      return res.json(filteredData);
    } else {
      return res.json({ error: "Un Autharize Access" });
    }
  }
}

const a = async () => {
  const groupedData = await realTimeLocation.aggregate([
    {
      $group: {
        _id: "$busNumber", // Group by busNumber field
        data: { $push: { latitude: "$latitude", longitude: "$longitude" } }, // Create an array of latitude and longitude objects
      },
    },
  ]);
};

const test = async () => {
  const userRequestedData = {
    18: { createdAt: "2023-08-28T03:27:48.268Z" },
    19: { createdAt: "2023-08-28T03:23:48.759Z" },
  };

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
    filteredData = filteredData.map((bus) => {
      return {
        busNumber: bus.busNumber,
        busData: bus.busData.filter((dataPoint) => {
          const dataTimestamp = new Date(dataPoint.createdAt);
          const requestedTimestamp = new Date(
            userRequestedData[bus.busNumber]?.createdAt
          );
          return dataTimestamp > requestedTimestamp;
        }),
      };
    });
  }

  // const fs = require("fs");
  // fs.writeFileSync("test.json", JSON.stringify(filteredData));

  for (let i = 0; i < filteredData.length; i++) {
    const element = filteredData[i];
    for (let index = 0; index < element.busData.length; index++) {
      const ele = element.busData[index];
      console.log(
        new Date(ele.createdAt) > new Date("2023-08-28T03:27:48.268Z")
      );
    }
  }
  console.log(JSON.stringify(filteredData, null, 2));
  console.log("\n================================");
};

// test();

module.exports = new Admin();
