import bcrypt from "bcrypt";
import sendNotificationToUser from "../../../config/firebase/sendNotification.js";
import tempUserModel from "../../user/model/tempUserModel.js";
import userModel from "../../user/model/userModel.js";
import { generateReferralCode, generateToken, isValidEmail, isValidPassword } from "../../utils/authHelper.js";
import sendEmail from "../../utils/sendEmail.js";
// 📌 Register User + Send OTP
export const requestRegistration = async (req, res) => {
  try {
    const { userName, email, password, confirmPassword, fcmToken, profilePhoto, referredBy } = req.body;

    if (!userName || !email || !password || !confirmPassword) {
      return res.status(400).send({ message: "All fields are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).send({ message: "Invalid email" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).send({ message: "Weak password" });
    }
    if (password !== confirmPassword) {
      return res.status(400).send({ message: "Passwords do not match" });
    }

    // check if already registered
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
    }

    // cleanup previous temp registration attempts
    await tempUserModel.deleteMany({ email });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // generate otp
      const otp = Math.floor(1000 + Math.random() * 9000);

    // set expiry time (5 minutes)
    const otpExpireTime = Date.now() + 5 * 60 * 1000;

    // generate unique referral code
    const referralCode = generateReferralCode(userName);

    // save in tempUser
    const tempUser = new tempUserModel({
      userName,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      profilePhoto: profilePhoto || "",
      fcmToken: fcmToken || "",
      referralCode, // ✅ new unique code
      otp: {
        otpValue: otp,
        otpExpireTime: Date.now() + 5 * 60 * 1000,
      },
      // optional: store if user entered a referral
      referredBy: referredBy || "",
    });

    await tempUser.save();

    await sendEmail(
      email,
      "Your new OTP for Story Dive Registration",
      `<h2>Hello ${tempUser.userName},</h2>
       <p>Your new OTP is: <b>${otp}</b></p>
       <p>This OTP will expire in 3 minutes.</p>`
    );
    // TODO: Send OTP via email/SMS
    res.status(200).send({
      message: "OTP sent successfully to given email",
      email,
      otp:{
        otpValue: otp, // ⚠️ only for testing; remove in production
        otpExpireTime: otpExpireTime
      }, // ⚠️ only for testing; remove in production
      referralCode, // send back their code
    });

  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
};


export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const tempUser = await tempUserModel.findOne({ email });
    if (!tempUser) {
      return res.status(404).send({ message: "No registration request found" });
    }

    if (tempUser.otp.otpValue !== parseInt(otp)) {
      return res.status(400).send({ message: "Invalid OTP" });
    }

    if (Date.now() > tempUser.otp.otpExpireTime) {
      return res.status(400).send({ message: "OTP expired" });
    }

    // save permanent user
    const user = new userModel({
      userName: tempUser.userName,
      email: tempUser.email,
      password: tempUser.password,
      confirmPassword: tempUser.confirmPassword,
      profilePhoto: tempUser.profilePhoto || "",
      referralCode: tempUser.referralCode || "",
      isAccountVerified: true,
    });

    await user.save();
    await tempUserModel.deleteOne({ email }); // cleanup temp record

    // ✅ Generate JWT token after successful registration
    const token = generateToken(user._id);
    
    if(tempUser.fcmToken)
   await  sendNotificationToUser(
        tempUser.fcmToken,
        "Welcome to Story Dive 🎉",
        "You’ve successfully joined the world of stories!",
        "",                // optional image
        {},                // custom data
        "homePage"         // actionPage (your app can open Home screen)
      );

    res.status(201).send({
     statusCode: "200",
     success: true,
      message: "User registered successfully",
      result: {
        userId: user._id,
        email: user.email,
        profilePhoto: user.profilePhoto,
        referralCode: user.referralCode,
        token, // send token
      },
    });

  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const tempUser = await tempUserModel.findOne({ email });
    if (!tempUser) {
      return res.status(404).send({
        statusCode: "404",
        success: false,
        message: "No registration request found",
      });
    }

    // generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000); // 4 digit
    const otpExpireTime = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // update OTP
    tempUser.otp = {
      otpValue: otp,
      otpExpireTime,
    };
    await tempUser.save();

    // send OTP via email
    await sendEmail(
      email,
      "Your new OTP for Story Dive Registration",
      `<h2>Hello ${tempUser.userName},</h2>
       <p>Your new OTP is: <b>${otp}</b></p>
       <p>This OTP will expire in 3 minutes.</p>`
    );

    res.status(200).send({
      statusCode: "200",
      success: true,
      message: "New OTP sent successfully",
      email,
      otp: {
        otpValue: otp,        // ⚠️ remove in production
        otpExpireTime,
      },
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        statusCode: "400",
        success: false,
        message: "Email and password are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).send({
        statusCode: "400",
        success: false,
        message: "Invalid email" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({
        statusCode: "400",
        success: false,
        message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({
        statusCode: "400",
        success: false,
        message: "Invalid credentials" });
    }

    // ✅ Generate JWT token after successful login
    const token = generateToken(user._id);

    res.status(200).send({
      statusCode: "200",
      success: true,
      message: "Login successful",
      result: {
        userId: user._id,
        email: user.email,
        profilePhoto: user.profilePhoto,
        referralCode: user.referralCode,
        token, // send token
      },
    });

  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // 📌 taken from token, not params

    const user = await userModel.findById(userId).select("-password -confirmPassword -refferedBy -otp -resetPasswordEntry");
    if (!user) {
      return res.status(404).send({
        statusCode: "404",
        success: false,
        message: "User not found",
        result: {},
      });
    }

    res.status(200).send({
      statusCode: "200",
      success: true,
      message: "User profile fetched successfully",
      result: user,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: "500",
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const logoutUser = async (req, res) => {
    try {
        // For JWT, logout is handled on client side by deleting the token.
        // Optionally, you can implement token blacklisting on server side.
        res.status(200).send({
            statusCode: "200",
            success: true,
            message: "Logout successful"
        });
    }
    catch (error) {
        res.status(500).send({
            statusCode: "500",
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}   

export default {
  requestRegistration,
  verifyRegistrationOtp,
  resendOtp,
  loginUser,
  getUserProfile,
  logoutUser
};