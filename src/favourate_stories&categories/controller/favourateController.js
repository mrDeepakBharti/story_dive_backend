import Story from "../../story/model/storyModel.js";
import Category from "../../story_categories/model/categoriesModel.js";
import favourateModel from "../model/favourateModel.js";

// ✅ Add to Favourites
export const addToFavourate = async (req, res) => {
  try {
    const { storyId, categoryId, type } = req.body;
    const userId = req.user.id || req.user._id;

    if (!type || !["story", "category"].includes(type)) {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Type must be 'story' or 'category'",
        result: {},
      });
    }

    if (type === "story") {
      if (!storyId) {
        return res.status(400).send({
          statusCode: 400,
          success: false,
          message: "Story ID is required",
          result: {},
        });
      }

      // ✅ check if story exists
      const story = await Story.findById(storyId);
      if (!story) {
        return res.status(404).send({
          statusCode: 404,
          success: false,
          message: "Story not found",
          result: {},
        });
      }
    }

    if (type === "category") {
      if (!categoryId) {
        return res.status(400).send({
          statusCode: 400,
          success: false,
          message: "Category ID is required",
          result: {},
        });
      }

      // ✅ check if category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).send({
          statusCode: 404,
          success: false,
          message: "Category not found",
          result: {},
        });
      }
    }

    // ✅ prevent duplicate favourites
    const exists = await favourateModel.findOne({
      user: userId,
      story: type === "story" ? storyId : null,
      category: type === "category" ? categoryId : null,
      type,
    });

    if (exists) {
      return res.status(200).send({
        statusCode: 200,
        success: true,
        message: "Already in favourites",
        result: { favourite: exists },
      });
    }

    // ✅ Save new favourite
    const favourite = new favourateModel({
      user: userId,
      story: type === "story" ? storyId : null,
      category: type === "category" ? categoryId : null,
      type,
    });

    await favourite.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Added to favourites successfully",
      result: { favourite },
    });
  } catch (error) {
    console.error("Error in addToFavourate:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
      result: { error: error.message },
    });
  }
};

// ✅ Remove from Favourites
export const removeFromFavourate = async (req, res) => {
  try {
    const { storyId, categoryId, type } = req.body;
    const userId = req.user.id || req.user._id;

    let query = { user: userId, type };
    if (type === "story") query.story = storyId;
    if (type === "category") query.category = categoryId;

    const favourite = await favourateModel.findOneAndDelete(query);

    if (!favourite) {
      return res.status(404).send({
        statusCode: 404,
        success: false,
        message: `${type} not found in favourites`,
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: `${type} removed from favourites`,
      result: {},
    });
  } catch (error) {
    console.error("Error in removeFromFavourate:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
      result: { error: error.message },
    });
  }
};

// ✅ Get User Favourites
export const getAllStoriesByCategory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch categories
    const categories = await Category.find();

    // Fetch all stories with category populated
    const stories = await Story.find().populate("category").sort({ createdAt: -1 });

    // Fetch favourites for this user
    const favourites = await favourateModel.find({ user: userId }).select("story category type");

    // Extract favourite IDs
    const favStoryIds = favourites
      .filter(f => f.type === "story")
      .map(f => f.story?.toString());

    const favCategoryIds = favourites
      .filter(f => f.type === "category")
      .map(f => f.category?.toString());

    // Group stories under categories
    const responseData = categories.map(cat => ({
      _id: cat._id,
      type: "category",
      category: {
        _id: cat._id,
        categoryName: cat.categoryName,
        categoryImage: cat.categoryImage,
        isFavourite: favCategoryIds.includes(cat._id.toString())
      },
      stories: stories
        .filter(story => story.category?._id.toString() === cat._id.toString())
        .map(story => ({
          _id: story._id,
          title: story.title,
          cover: story.cover,
          isFavourite: favStoryIds.includes(story._id.toString())
        })),
      createdAt: cat.createdAt
    }));

    return res.send({
      statusCode: 200,
      success: true,
      message: "Stories grouped by category fetched successfully",
      result: responseData
    });

  } catch (error) {
    console.error("Error in fetching stories by category", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: { error: error.message }
    });
  }
};


export default {
  addToFavourate,
  removeFromFavourate,
  getAllStoriesByCategory,
};
