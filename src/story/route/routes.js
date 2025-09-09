import express from "express";
import upload from "../../middleware/multer.js";
import { decodeAdminToken, isAdmin } from "../../middleware/verifyJWT.js";
import storiesController from '../../story/controller/storyController.js';
import { verifyToken } from "../../utils/authHelper.js";


const router=express.Router();

router.post(
    "/add-stories",
    decodeAdminToken,
    isAdmin,
    upload.single("image"),
    storiesController.addStory
);

router.post(
    "/edit-story",
    decodeAdminToken,
    isAdmin,
    upload.single("image"),
    storiesController.editStory
);

router.get(
    "/get-story",
    verifyToken,
    storiesController.getAllStories
);

router.post(
"/delete-story",
decodeAdminToken,
isAdmin,
upload.none(),
storiesController.deleteStory
);
export default router;