// controllers/searchController.js
import Story from "../../story/model/storyModel.js";
import Category from "../../story_categories/model/categoriesModel.js";

export const searchStories = async (req, res) => {
  try {
    // 🔹 Accept both ?query=abc and ?search=abc
    const searchTerm = req.query.query || req.query.search;
    const userId = req.user.id || req.user._id;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Please provide a search term",
        result: {},
      });
    }

    // 🔹 Try to match category name
    const category = await Category.findOne({
      categoryName: { $regex: searchTerm, $options: "i" },
    });

    let stories = [];

    if (category) {
      // ✅ If category found → get stories under this category
      stories = await Story.find({
        category: category._id,
        isVisible: true,
      })
        .populate("category", "categoryName categoryImage")
        .lean();
    } else {
      // ✅ Otherwise search by story title
      stories = await Story.find({
        title: { $regex: searchTerm, $options: "i" },
        isVisible: true,
      })
        .populate("category", "categoryName categoryImage")
        .lean();
    }

    return res.status(200).send({
      statusCode: 200,
      success: true,
      count: stories?.length || 0,
      result: { stories: stories || [] },
    });
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      error: error.message,
      result: {},
    });
  }
};

export default {
searchStories,
};
