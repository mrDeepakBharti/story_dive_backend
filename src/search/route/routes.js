import express from "express";
import { verifyToken } from "../../utils/authHelper.js";
import searchController from "../controller/searchController.js";

const router=express.Router();


router.get("/searchStories",verifyToken, searchController.searchStories);

export default router;
