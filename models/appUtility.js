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
let isRunning = false;

// Schedule the data transfer task to run every day at 2 Am
cron.schedule("30 20 * * *", async () => {
  if (!isRunning) {
    console.log("Starting data transfer task and deleting old documents...");
    isRunning = true;

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
        }).select(
          "-_id name email password role idCard profileImage idImage busNumber weight isAuthenticated token penalty createdAt updatedAt"
        );
        // console.log(JSON.stringify(allUsers, null, 2));

        const { data: insertedUserInSecondaryDb } = await axios.post(
          "https://anxious-gray-shift.cyclic.app/api/admin/user-backup",
          allUsers,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${superAdmin.token}`,
            },
          }
        );

        if (insertedUserInSecondaryDb) {
          await EmailServices.sendEmailService(
            "rahulchourasiya4567@gmail.com",
            dataTransferEmail(
              ` User Backups successfully
               ${JSON.stringify(
                 {
                   insertedUserInSecondaryDb,
                   totalNumberUserSend: allUsers?.length,
                 },
                 null,
                 3
               )} `
            )
          );
        }
      }

      console.log("Data transfer and document deletion successful!");
    } catch (error) {
      await EmailServices.sendEmailService(
        "rahulchourasiya4567@gmail.com",
        dataTransferEmail(error)
      );
      console.error("An error occurred during data transfer:", error);
    } finally {
      // Find documents in the source collection
      const realTimedocuments = await realTimeLocation.find().lean();
      // // Insert realTimedocuments into the destination collection
      const insertedRealtime = await fiveDaysLocation.insertMany(
        realTimedocuments
      );
      // Delete documents older than 5 days from the destination collection
      const cutoffDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      const deleteInFiveDaysLocation = await fiveDaysLocation.deleteMany({
        createdAt: { $lt: cutoffDate },
      });
      const realTimeDelete = await realTimeLocation.deleteMany({});
      const currentContributoDelete = await contributorModel.deleteMany({});

      await EmailServices.sendEmailService(
        "rahulchourasiya4567@gmail.com",
        dataTransferEmail(
          `Data transfer and document deletion successful!
         ${JSON.stringify(
           {
             totalDeletedDocumentFrom_RealTimeLocation:
               realTimeDelete?.deletedCount,
             totalDeletedDocumentFrom_CurrentContributor:
               currentContributoDelete?.deletedCount,
             insertedRealtimeInFiveDaysLocation: insertedRealtime?.length,
             totalDeletedDocumentFrom_FiveDaysOfLocation:
               deleteInFiveDaysLocation?.deletedCount,
           },
           null,
           3
         )}
        `
        )
      );
      isRunning = false;
    }
  } else {
    console.log(
      "Skipping cron job execution. Another worker is already running it."
    );
  }
});

module.exports = contributorModel;

const c = [
  {
    currentContributor: "645db024e5813179f8642099",
    busNumber: 18,
    previousFiveContributor: [
      {
        contributor: "64546df61f908453e06ac1b9",
        createdAt: "1684206498204",
        weight: 0,
        _id: "6462f3a2e78b0b2dc2903bcf",
      },
      {
        contributor: "64546df61f908453e06ac1b9",
        createdAt: "1684206497555",
        weight: 0,
        _id: "6462f3a1e78b0b2dc2903bc1",
      },
      {
        contributor: "645dade4e5813179f8641e34",
        weight: 0,
        _id: "6462f3a6e78b0b2dc2903be7",
        createdAt: "1684206502057",
      },
    ],
    createdAt: "1684204729604",

    updatedAt: "1684206502056",

    __v: 0,
  },
  {
    currentContributor: "645e298be5813179f8642259",
    busNumber: 12,
    previousFiveContributor: [
      {
        contributor: "6462ef96e78b0b2dc29037c7",
        weight: 0,
        _id: "6462f18ce78b0b2dc2903972",
        createdAt: "1684205964149",
      },
    ],
    createdAt: "1684205317696",
    updatedAt: "1684205964147",
    __v: 0,
  },
];

const a = async () => {
  try {
    isRunning = true;

    // Find documents in the source collection
    const realTimedocuments = await realTimeLocation.find().lean();
    // // Insert realTimedocuments into the destination collection
    const insertedRealtime = await fiveDaysLocation.insertMany(
      realTimedocuments
    );
    // Delete documents older than 5 days from the destination collection
    const cutoffDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
    const deleteInFiveDaysLocation = await fiveDaysLocation.deleteMany({
      createdAt: { $lt: cutoffDate },
    });
    const realTimeDelete = await realTimeLocation.deleteMany({});
    const currentContributoDelete = await contributorModel.deleteMany({});

    await EmailServices.sendEmailService(
      "rahulchourasiya4567@gmail.com",
      dataTransferEmail(
        `Data transfer and document deletion successful!
         ${JSON.stringify(
           {
             totalDeletedDocumentFrom_RealTimeLocation:
               realTimeDelete?.deletedCount,
             totalDeletedDocumentFrom_CurrentContributor:
               currentContributoDelete?.deletedCount,
             insertedRealtimeInFiveDaysLocation: insertedRealtime?.length,
             totalDeletedDocumentFrom_FiveDaysOfLocation:
               deleteInFiveDaysLocation?.deletedCount,
           },
           null,
           3
         )}
        `
      )
    );
    isRunning = false;
  } catch (error) {
    console.log("Error inserting documents:", error);
  }
};

// a();

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
  //   "https://busmate.azurewebsites.net/api/admin/usersBackup",
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
};

// b();
