import express from "express";
import upload from "../../middleware/multer.js";
import { decodeAdminToken, isAdmin } from "../../middleware/verifyJWT.js";
import categories from "../../story_categories/controller/categoriesController.js";
import { verifyToken } from "../../utils/authHelper.js";

const router = express.Router();

router.post(
    "/add-categories",
    decodeAdminToken,
    isAdmin,
    upload.single("image"),
    categories.addCategory
);

router.get(
    "/get-categories",
    verifyToken,
    categories.getAllCategories
);

router.post(
    "/delete-category",
    decodeAdminToken,
    isAdmin,
    upload.none(),
    categories.deleteCategory
);

router.post(
    "/edit-category",
    upload.none(),
    decodeAdminToken,
    isAdmin,
    categories.editCategory
);

router.post(
    "/toggleVisibility",
    decodeAdminToken,
    isAdmin,
    categories.toggleCategoryVisibility
)

export default router;