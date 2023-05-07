const SearchService = require("../Services/searchServices");
const { getPublicId } = require("../helpers/functions");
const userNotAuthenticateUserEmail = require("../helpers/userNotAuthenticateUserEmail");
const User = require("../models/user");
const EmailServices = require("../Services/emailServices");
const cloudinary = require("../config/config");
const userAuthenticateUserEmail = require("../helpers/userAuthenticateUserEmail");
const realTimeLocation = require("../models/realTimeLocation");
const user = require("../models/user");

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
              console.log(result);
            }
          }
        );
        await cloudinary.uploader.destroy(
          idCardPublicId,
          function (error, result) {
            if (error) {
              console.log(error);
            } else {
              console.log(result);
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
    if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
      console.log("HIT SIGNUP");
      // console.log({ body: req.body, file: req.files });
      // res.json({ data: "You Hit" });

      const files = req.files;
      try {
        // validation
        const { name, email, password, idCard, busNumber, role } = req.body;

        try {
          const results = [];
          if (files?.length) {
            for (const file of files) {
              console.log(file);
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
      console.log("req.query,", req.query);
      const parsedQuery = await JSON.parse(req.query.data);

      console.log(parsedQuery, parsedQuery["sorting"]);

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

  // async backupUser(req, res) {
  //   if (req.user.role === "superAdmin" && req.user.isAuthenticated === true) {
  //     try {
  //       const cutoffDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 day
  //       // Find documents in the source collection
  //       const allUsers = await user
  //         .find({ createdAt: { $gte: cutoffDate } })
  //         .lean();
  //       return res.json(allUsers);
  //     } catch (error) {
  //       await EmailServices.sendEmailService(
  //         "rahulchourasiya4567@gmail.com",
  //         dataTransferEmail(
  //           `"Error from primery server when sending User backup documents:", ${error}`
  //         )
  //       );
  //       console.log(error);
  //       return res.json({ error });
  //     }
  //   } else {
  //     await EmailServices.sendEmailService(
  //       "rahulchourasiya4567@gmail.com",
  //       dataTransferEmail(
  //         `"Un Autharize Access" in primery server User backup route`
  //       )
  //     );
  //     return res.json({ error: "Un Autharize Access" });
  //   }
  // }

}

const a = async () => {
  const contributorObj = await contributorData.aggregate([
    {
      $group: {
        _id: "$busNumber",
        currentContributor: { $last: "$currentContributor" },
        previousFiveContributors: {
          $first: "$previousFiveContributor",
        },
        previousFiveContributorsCreatedAT: {
          $first: "$previousFiveContributor",
        },
        // previousFiveContribu: { $last: "$previousFiveContributor.createdAt" },
        createdAt: { $last: "$createdAt" },
        updatedAt: { $last: "$updatedAt" },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "currentContributor",
        foreignField: "_id",
        as: "currentContributor",
      },
    },

    {
      $unwind: "$currentContributor",
    },

    {
      $lookup: {
        from: "users",
        localField: "previousFiveContributors.contributor",
        foreignField: "_id",
        as: "previousFiveContributors.contributor",
      },
    },
    {
      $unwind: "$previousFiveContributors",
    },

    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$$ROOT",
            {
              busNumber: "$_id",
              currentContributor: "$currentContributor",
              previousFiveContributor: "$previousFiveContributor",
              createdAt: {
                $dateToString: {
                  format: "%Y-%m-%dT%H:%M:%S.%LZ",
                  date: "$createdAt",
                },
              },
              updatedAt: {
                $dateToString: {
                  format: "%Y-%m-%dT%H:%M:%S.%LZ",
                  date: "$updatedAt",
                },
              },
            },
          ],
        },
      },
    },

    {
      $project: {
        _id: 0,
        __v: 0,

        "currentContributor.password": 0,
        "currentContributor.role": 0,
        "currentContributor.idImage": 0,
        "currentContributor.isAuthenticated": 0,
        "currentContributor.penalty": 0,
        "currentContributor.createdAt": 0,
        "currentContributor.updatedAt": 0,
        "currentContributor.token": 0,
        "previousFiveContributors.contributor.password": 0,
        "previousFiveContributors.contributor.token": 0,
        "previousFiveContributors.contributor.role": 0,
        "previousFiveContributors.contributor.idImage": 0,
        "previousFiveContributors.contributor.isAuthenticated": 0,
        "previousFiveContributors.contributor.penalty": 0,
        "previousFiveContributors.contributor.createdAt": 0,
        "previousFiveContributors.contributor.updatedAt": 0,
        "previousFiveContributors.contributor.__v": 0,
      },
    },
  ]);
  const obj2 = contributorObj.map((item) => {
    const prevContributors = item.previousFiveContributors.contributor;
    const prevContributorsCreatedAt = item.previousFiveContributorsCreatedAT;
    const updatedPrevContributors = prevContributors.map((contributor) => {
      const currentContributorId = contributor._id;

      for (let i = 0; i < prevContributorsCreatedAt.length; i++) {
        const createdAt = prevContributorsCreatedAt[i].createdAt;
        const contributorId = prevContributorsCreatedAt[i].contributor;

        if (contributorId?.toString() === currentContributorId?.toString()) {
          return { ...contributor, createdAt };
        }
      }

      return contributor;
    });

    return {
      ...item,
      previousFiveContributors: {
        ...item.previousFiveContributors,
        contributor: updatedPrevContributors,
      },
    };
  });
  // console.log(  JSON.stringify(obj2, null, 3));
};
// a();

module.exports = new Admin();

const obj = [
  {
    currentContributor: {
      _id: "64322d6e01b149350d7e1fe7",
      name: "Rahul",
      email: "rahulchourasiya4567@gmail.com",
      idCard: "IT222649",
      profileImage:
        "https://res.cloudinary.com/du1fpl9ph/image/upload/v1681010026/xfvwgpqjlbaditc00gz5.jpg",
      busNumber: "18",
      weight: 1.4,
      __v: 0,
    },
    previousFiveContributors: {
      contributor: [
        {
          _id: "64312935267b1d564c784726",
          name: "Tushar",
          email: "tusharkarode668@gmail.com",
          idCard: "IT222650",
          profileImage:
            "https://res.cloudinary.com/du1fpl9ph/image/upload/v1680320707/miskim2xs5t3jf1dzekb.jpg",
          busNumber: "18",
          weight: 0.8999999999999999,
        },
        {
          _id: "6432a6735afc217f79ac0eb9",
          name: "RAHUL CHOURASIYA",
          email: "rahulchourasiya0204@gmail.com",
          idCard: "rahulchourasiya0204@gmail.com",
          busNumber: "18",
          weight: 1,
        },
      ],
    },
    previousFiveContributorsCreatedAT: [
      {
        contributor: "6432a6735afc217f79ac0eb9",
        createdAt: "2023-04-17T03:03:11.541Z",
        _id: "643cb71d0ee8fe50ae5d6367",
      },
      {
        contributor: "64312935267b1d564c784726",
        createdAt: "2023-04-17T03:03:57.541Z",
        _id: "643cb69b0ee8fe50ae5d6308",
      },
    ],
    createdAt: "2023-04-17T03:01:47.891Z",
    updatedAt: "2023-04-17T03:03:57.542Z",
    busNumber: 18,
  },
];
