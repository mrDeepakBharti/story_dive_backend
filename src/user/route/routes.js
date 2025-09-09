import express from "express";
import upload from "../../middleware/multer.js";
import { verifyToken } from "../../utils/authHelper.js";
import userController from "../controller/userController.js";
const router = express.Router();

router.post(
    "/register-user",
    upload.none(),
    userController.requestRegistration
);
router.post(
    "/verify-registration-otp",
    upload.none(),
    userController.verifyRegistrationOtp
);

router.post(
    "/resend-otp",
    upload.none(),
    userController.resendOtp
);
router.post(
    "/login-user",
    upload.none(),
    userController.loginUser
);

router.get(
    "/get-user-profile",
    verifyToken,
    userController.getUserProfile
);

router.post(
    "/logout-user",
    upload.none(),
    userController.logoutUser
);

export default router;