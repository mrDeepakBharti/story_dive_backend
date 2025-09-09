import express from "express";
import favourateStoriesAndCategoriesController from "../../favourate_stories&categories/controller/favourateController.js";
import upload from "../../middleware/multer.js";
import { verifyToken } from "../../utils/authHelper.js";
const router = express.Router();

router.post(
    "/add-to-favourate",
    verifyToken,
    upload.none(),
    favourateStoriesAndCategoriesController.addToFavourate
);
router.post(
    "/remove-from-favourate",
    verifyToken,
    upload.none(),
    favourateStoriesAndCategoriesController.removeFromFavourate
);
router.get(
    "/get-favourates",
    verifyToken,
    favourateStoriesAndCategoriesController.getAllStoriesByCategory
);

export default router;