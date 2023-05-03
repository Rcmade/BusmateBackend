const mongoose = require("mongoose");
const { Schema } = mongoose;
const contributerData = new Schema(
  {
    currentContributer: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "User",
    },

    previousFiveContributer: [
      {
        contributer: {
          type: mongoose.Schema.Types.ObjectId,
          trim: true,
          ref: "User",
        },

        createdAt: {
          type: Date,
          required: true,
          default: Date.now,
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

const cron = require("node-cron");
const fiveDaysLocation = require("./fiveDaysLocation");
const realTimeLocation = require("./realTimeLocation");
const dataTransferEmail = require("../helpers/dataTransferEmail");
const EmailServices = require("../Services/emailServices");

// Schedule the data transfer task to run every day at 2 Am
cron.schedule("30 20 * * *", async () => {
  console.log("Starting data transfer task and deleting old documents...");
  try {
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
        `Data transfer and document deletion successful! ${cutoffDate?.toLocaleString()}`
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
  }
});

module.exports = mongoose.model("contributerData", contributerData);

const a = async () => {
  /*   try {
    console.log("inside");
    // Find super admin
    const superAdmin = await User.findOne({ email: process.env.SUPER_ADMIN });
    if (superAdmin) {
      // const cutoffDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 days ago
      // const allUser = await User.find({ createdAt: { $gte: cutoffDate } });

      const { data } = await axios.get(
        "https://maroon-python-ring.cyclic.app/api/admin/user-sync",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${superAdmin.token}`,
          },
        }
      );

      console.log({ data });
      if (data?.length) {
        for (let i = 0; i < data.length; i++) {
          const element = data[i];
          const findUser = await User.findOne({ email: element.email });
          element._id = undefined;
          if (findUser) {
            await User.findOneAndUpdate(
              { email: element.email },
              {
                $set: element,
              }
            );
          } else {
            await User.create(element);
          }
        }
      }
    }
    console.log("Data transfer and document deletion successful!");
  } catch (error) {
    await EmailServices.sendEmailService(
      "rahulchourasiya4567@gmail.com",
      dataTransferEmail(error)
    );
    console.error("An error occurred during data transfer:", error);
  } */
};

// a();
