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
const sampleUserData = require("../Db/userSampleData");
const cron = require("node-cron");
const fiveDaysLocation = require("./fiveDaysLocation");
const { userSchema: backupUserSchema } = require("./user");
const UserSchema = require("./user");
const realTimeLocation = require("./realTimeLocation");
const dataTransferEmail = require("../helpers/dataTransferEmail");
const EmailServices = require("../Services/emailServices");
let isRunning = false;
// Schedule the data transfer task to run every day at 2 Am
cron.schedule("30 20 * * *", async () => {
  let insertedUser;
  if (!isRunning) {
    try {
      isRunning = true;
      // Connect to the backup database

      const backupDbOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      //Establish a connection to the backup database
      const backupConnection = await mongoose.createConnection(
        process.env.SECONDARY_DATABASE,
        backupDbOptions
      );
      // Get All Data in Primary User DataBase
      const User = await UserSchema.find({}).select("-id");

      // Get All Data in Secondary User DataBase
      const UserBackupModal = backupConnection.model("User", backupUserSchema);
      const UserBackup = await UserBackupModal.find({});

      // This will compare the Primary User Database with the Secondary User Database and it will return only user Data which is not present in Secondary User Database
      const filterUserData = await User?.filter(
        (item1) => !UserBackup.some((item2) => item2.idCard === item1.idCard)
      );

      //  Insert In the Secondary User DB
      insertedUser = await UserBackupModal.insertMany(filterUserData, {
        ordered: false,
      });

      // Close the connection to Secondary Database
      backupConnection.close();
      console.log("Backup connection closed");
    } catch (err) {
      console.error("Error during backup:", err);
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
        dataTransferEmail({
          insertedUser: insertedUser?.length,
          totalDeletedDocumentFrom_RealTimeLocation:
            realTimeDelete?.deletedCount,
          totalDeletedDocumentFrom_CurrentContributor:
            currentContributoDelete?.deletedCount,
          insertedRealtimeInFiveDaysLocation: insertedRealtime?.length,
          totalDeletedDocumentFrom_FiveDaysOfLocation:
            deleteInFiveDaysLocation?.deletedCount,
        })
      );
      console.log("Task is Completed");
      isRunning = false;
    }
  } else {
    console.log(
      "Skipping cron job execution. Another worker is already running it."
    );
  }
});

module.exports = contributorModel;
