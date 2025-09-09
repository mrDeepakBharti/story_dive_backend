import express from "express";
import upload from "../../middleware/multer.js";
import { decodeAdminToken, isAdmin } from "../../middleware/verifyJWT.js";
import adminController from "../controller/adminController.js";

const router = express.Router();

router.post(
  "/admin-login",
  upload.none(),
  adminController.adminLogin
);
router.get("/get-all-users",
    decodeAdminToken,

  isAdmin,
  adminController.getAllUsers);
router.post(
  "/delete-user",
    decodeAdminToken,
  isAdmin,
  upload.none(),
  adminController.deleteUser
);
router.get("/get-user",
  decodeAdminToken,
   isAdmin,
   upload.none(),
  adminController.getUserById);
router.get("/get-dashboard-stats",
  decodeAdminToken,
  isAdmin,
  adminController.getDashboardStats);

export default router;
