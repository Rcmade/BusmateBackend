const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      required: function () {
        return this.role !== "driver";
      },
      unique: true,
    },

    password: {
      type: String,
      // min: 6,
      // max: 64,
    },

    role: {
      type: String,
      enum: ["student", "driver", "admin", "superAdmin"],
      default: "student",
    },

    idCard: {
      type: String,
      trim: true,
      required: function () {
        return this.role !== "driver";
      },
      unique: true,
    },

    profileImage: {
      type: String,
      trim: true,
      required: function () {
        return this.role !== "driver";
      },
    },

    photo: {
      type: String,
    },

    idImage: {
      type: String,
      trim: true,
      // required: function () {
      //   return this.role !== "driver";
      // },

      default: null,
    },

    busNumber: {
      type: String,
      trim: true,
      required: true,
      default: 1,
    },

    weight: {
      type: Number,
      trim: true,
      required: true,
      default: 1,
    },

    isAuthenticated: {
      type: Boolean,
      required: true,
      default: false,
    },
    token: {
      type: String,
    },
    penalty: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// userSchema.pre("findOneAndUpdate", async function (next) {
//   if (this.getUpdate()?.$set.password) {
//     this._update.$set.password = await bcrypt.hash(
//       this.getUpdate()?.$set.password,
//       12
//     );
//   }
//   next();
// });

// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 12);
//   }
//   next();
// });

module.exports = mongoose.model("User", userSchema);

module.exports.userSchema = userSchema;
