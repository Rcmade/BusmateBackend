const mongoose = require("mongoose");
const { Schema } = mongoose;
const contributorSchema = new Schema(
  {
    currentContributor: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "User",
    },

    previousFiveContributor: [
      {
        contributor: {
          type: mongoose.Schema.Types.ObjectId,
          trim: true,
          ref: "User",
        },

        createdAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
        weight: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],

    busNumber: {
      type: Number,
      trim: true,
      required: true,
      default: 1,
    },

    // expireAfterSeconds: 43200, // expires after 12 houres
  },

  { timestamps: true }
);

const contributorModel = mongoose.model("contributorData", contributorSchema);

const cron = require("node-cron");
const fiveDaysLocation = require("./fiveDaysLocation");
const User = require("./user");
const realTimeLocation = require("./realTimeLocation");
const dataTransferEmail = require("../helpers/dataTransferEmail");
const EmailServices = require("../Services/emailServices");

const axios = require("axios");
// Schedule the data transfer task to run every day at 2 Am
cron.schedule("30 20 * * *", async () => {
  console.log("Starting data transfer task and deleting old documents...");
  try {
    const superAdmin = await User.findOne({
      email: process.env.SUPER_ADMIN,
    });
    const { data: getLastesUserDate } = await axios.get(
      "https://anxious-gray-shift.cyclic.app/api/admin/latestUser-backup",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${superAdmin.token}`,
        },
      }
    );

    if (getLastesUserDate) {
      const late24Hour = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 days ago

      const allUsers = await User.find({
        createdAt: {
          $gte: new Date(getLastesUserDate.createdAt).getTime() || late24Hour,
        },
      });
      console.log(JSON.stringify(allUsers, null, 2));

      const { data: sendUserDataToAnotherServer } = await axios.post(
        "https://anxious-gray-shift.cyclic.app/api/admin/user-backup",
        allUsers,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${superAdmin.token}`,
          },
        }
      );

      if (sendUserDataToAnotherServer) {
        await EmailServices.sendEmailService(
          "rahulchourasiya4567@gmail.com",
          dataTransferEmail(
            ` User Backups successfully ${JSON.stringify(
              {
                sendUserDataToAnotherServer:
                  sendUserDataToAnotherServer?.length,
                late24Hour,
              },
              null,
              2
            )} `
          )
        );
      }
    }

    // Find documents in the source collection
    const documents = await realTimeLocation.find().lean();
    // // Insert documents into the destination collection
    await fiveDaysLocation.insertMany(documents);
    // Delete documents older than 5 days from the destination collection
    const cutoffDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
    await fiveDaysLocation.deleteMany({ createdAt: { $lt: cutoffDate } });

    await EmailServices.sendEmailService(
      "rahulchourasiya4567@gmail.com",
      dataTransferEmail(
        `Data transfer and document deletion successful! ${cutoffDate?.toLocaleString()}
        `
      )
    );

    console.log("Data transfer and document deletion successful!");
  } catch (error) {
    await EmailServices.sendEmailService(
      "rahulchourasiya4567@gmail.com",
      dataTransferEmail(error)
    );
    console.error("An error occurred during data transfer:", error);
  } finally {
    await realTimeLocation.deleteMany({});
    await contributorModel.deleteMany({});
  }
});

module.exports = contributorModel;

const a = async () => {
  console.log("Starting data transfer task and deleting old documents...");
  try {
    const superAdmin = await User.findOne({
      email: process.env.SUPER_ADMIN,
    });
    const { data: getLastesUserDate } = await axios.get(
      "https://anxious-gray-shift.cyclic.app/api/admin/latestUser-backup",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${superAdmin.token}`,
        },
      }
    );

    if (getLastesUserDate) {
      const late24Hour = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 days ago

      const allUsers = await User.find({
        createdAt: {
          $gte: new Date(getLastesUserDate.createdAt).getTime() || late24Hour,
        },
      });
      console.log(JSON.stringify(allUsers, null, 2));

      const { data: sendUserDataToAnotherServer } = await axios.post(
        "https://anxious-gray-shift.cyclic.app/api/admin/user-backup",
        allUsers,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${superAdmin.token}`,
          },
        }
      );

      if (sendUserDataToAnotherServer) {
        await EmailServices.sendEmailService(
          "rahulchourasiya4567@gmail.com",
          dataTransferEmail(
            ` User Backups successfully ${JSON.stringify(
              {
                sendUserDataToAnotherServer:
                  sendUserDataToAnotherServer?.length,
                late24Hour,
              },
              null,
              2
            )} `
          )
        );
      }
    }

    // Find documents in the source collection
    const documents = await realTimeLocation.find().lean();
    // // Insert documents into the destination collection
    await fiveDaysLocation.insertMany(documents);
    // Delete documents older than 5 days from the destination collection
    const cutoffDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
    await fiveDaysLocation.deleteMany({ createdAt: { $lt: cutoffDate } });

    await EmailServices.sendEmailService(
      "rahulchourasiya4567@gmail.com",
      dataTransferEmail(
        `Data transfer and document deletion successful! ${cutoffDate?.toLocaleString()}
        `
      )
    );

    console.log("Data transfer and document deletion successful!");
  } catch (error) {
    await EmailServices.sendEmailService(
      "rahulchourasiya4567@gmail.com",
      dataTransferEmail(error)
    );
    console.error("An error occurred during data transfer:", error);
  } finally {
    await realTimeLocation.deleteMany({});
    await contributorModel.deleteMany({});
  }
};

const b = async () => {
  // const superAdmin = await User.findOne({
  //   email: process.env.SUPER_ADMIN,
  // });
  // const { data: getLastesUserDate } = await axios.get(
  //   "https://anxious-gray-shift.cyclic.app/api/admin/latestUser-backup",
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${superAdmin.token}`,
  //     },
  //   }
  // );

  // const { data: sendUserDataToAnotherServer } = await axios.post(
  //   "https://busmets.azurewebsites.net/api/admin/usersBackup",
  //   allUsers,
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${superAdmin.token}`,
  //     },
  //   }
  // );
  // console.log({ getLastesUserDate });

  const allUsers = await User.find({
    createdAt: {
      $gte: new Date("2023-04-08T03:00:09.656+00:00").getTime() || late24Hour,
    },
  });
  console.log(JSON.stringify(allUsers, null, 2));
};

// b();

// a();
