const User = require("../models/user");
const { hashPassword, comparePassword } = require("../helpers/auth");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const upload = require("../middlewares/storage");
const cloudinary = require("../config/config");
const AuthServices = require("../Services/otp");
const hashService = require("../Services/hashService");
const EmailServices = require("../Services/emailServices");
const emailHtml = require("../helpers/emailHtml");
const { OAuth2Client } = require("google-auth-library");

const signup = async (req, res) => {
  // console.log({ body: req.body, file: req.files });
  // res.json({ data: "You Hit" });

  const files = req.files;
  try {
    // validation
    const { name, email, idCard, busNumber, photo } = req.body;

    if (!name || !email || !busNumber || !idCard) {
      return res.json({ error: "All fields are required" });
    }

    const exist = await User.findOne({ $or: [{ email }, { idCard }] });
    if (exist) {
      return res.json({
        error: "This Id Card or Email Is Already Registered",
      });
    }

    try {
      const results = [];

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

      const imgsObj = {};

      results.forEach((element) => {
        // console.log(element);
        Object.assign(imgsObj, { [element["type"]]: element["uri"] });
      });

      const user = await new User({
        name,
        email,
        // password,
        idCard,
        busNumber,

        photo,
        ...imgsObj,
      }).save();

      // create signed token
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );

      res.cookie("login", token, {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
      });

      user.password = undefined;
      return res.json({
        token,
        user,
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};

const otpSendController = async (req, res) => {
  const { email, name } = req.body;

  if (email) {
    const otp = await AuthServices.createOtp();
    //Time to leave
    const ttl = 1000 * 60 * 10; // 10 minutes
    const expires = Date.now() + ttl;
    const data = `${email}.${otp}.${expires}`;
    const hash = await hashService.hashOtp(data);
    // console.log({ otp });
    try {
     const a  =  await EmailServices.sendEmailService(
        email,
        emailHtml(email, name, otp, 10)
      );
      console.log("Email sent status:", {a});
      return res.json({
        hash: `${hash}.${expires}`,
        message: "OTP has been sent to your email",
      });
    } catch (error) {
      console.log(error);
      return res.json({ error: error, hash: `${hash}.${expires}` });
    }
  } else {
    return res.json({ error: "Email Is Required" });
  }
};

const verifyOtp = async (req, res) => {
  const { otp, hash, email } = req.body;
  if (!otp || !hash || !email) {
    return res.json({ message: "All fields are required!" });
  }

  const [hashedOtp, expires] = hash.split(".");
  if (Date.now() > +expires) {
    return res.json({ message: "OTP expired!" });
  }

  const data = `${email}.${+otp}.${+expires}`;
  const isValid = await AuthServices.verifyOtp(hashedOtp, data);
  if (!isValid) {
    return res.json({ error: "Invalid OTP" });
  } else {
    return res.status(200).json({ message: "You Are Varified" });
  }
};

const signin = async (req, res) => {
  try {
    // const client =await new OAuth2Client(process.env.WEB_CLIENT_ID);

    const ticket = {
      payload: {
        email: req.body.email,
      },
    };
    // const ticket = await client.verifyIdToken({
    //   idToken: req.body.idToken,
    //   audience: process.env.WEB_CLIENT_ID,
    // });

    if (ticket.payload) {
      // check if our db has user with that email
      let user = await User.findOne({
        $or: [
          { email: ticket.payload.email },
          { idCard: ticket.payload.email },
        ],
      });
      if (!user) {
        return res.json({
          error: "No user found",
        });
      }

      if (req.body?.manual) {
        const match = await comparePassword(req.body.password, user.password);
        if (!match) {
          return res.json({
            error: "Invalid Email or Password",
          });
        }
      }
      // create signed token
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          createdAt: user.createdAt,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );

      res.cookie("login", token, {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
      });
      const updatedUser = await User.findByIdAndUpdate(user._id, {
        $set: { token: token },
      }).select(
        "name _id email idCard profileImage busNumber weight isAuthenticated photo role"
      );
      return res.json({
        token,
        user: updatedUser,
      });
    } else {
      return res.json({
        error: "Somthing went wrong please try after some time ",
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ error: "Someting Went Wront. Try again later." });
  }
};

const userInitialRoute = async (req, res) => {
  if (req.user) {
    return res.status(200).json({ user: req.user });
  } else {
    return res.status(200).json({ user: null });
  }
};

const forgotPassword = async (req, res) => {
  const { email, password } = req.body;
  // find user by email
  const updateUser = await User.findOneAndUpdate(
    { email },
    { $set: { password } }
  );
  // await updateProfile.save();
  if (updateUser) {
    return res.json({ message: "Password updated successfully" });
  } else {
    return res.json({ error: "User not found" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password, resetCode } = req.body;
    // find user based on email and resetCode
    const user = await User.findOne({ email, resetCode });
    // if user not found
    if (!user) {
      return res.json({ error: "Email or reset code is invalid" });
    }
    // if password is short
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetCode = "";
    user.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

const logout = async (req, res) => {
  try {
    await res.clearCookie("login");
    return res.json({ message: "Logout" });
  } catch (err) {
    console.log(err);
  }
};

const updateProfile = async (req, res) => {
  try {
    console.log({body:req.body})
    if (!req.body?.name || !req.body?.busNumber) {
      return res.json({ error: "All fields are required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: req.body,
      },
      { new: true }
    ).select(
      "name _id email idCard profileImage busNumber weight isAuthenticated photo"
    );

    if (user) {
      return res.json({
        user: user,
        message: "Your Profile Has Been Updated Successfully.",
      });
    } else {
      return res.json({ error: "Id not Found" });
    }
  } catch (err) {
    console.log(err);
    return res.json({ error: err.message });
  }
};

module.exports = {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  userInitialRoute,
  logout,
  otpSendController,
  verifyOtp,
  updateProfile,
};
