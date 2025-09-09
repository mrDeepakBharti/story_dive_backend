import favourateModel from "../../favourate_stories&categories/model/favourateModel.js";
import Story from "../../story/model/storyModel.js";
import Category from "../../story_categories/model/categoriesModel.js";
import cloudinary from "../../utils/cloudinary.js";


export const addStory = async (req, res) => {
  try {
    let { title, pages, categoryId } = req.body;

    // Check required fields except cover (it will come from file)
    const requiredFields = ["title", "pages", "categoryId"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (!req.file) missingFields.push("cover");

    if (missingFields.length > 0) {
      return res.send({
        statusCode: 400,
        success: false,
        message: `${missingFields.join(", ")} field(s) are required`,
        result: {},
      });
    }

    // ✅ parse pages (string → JSON)
    if (pages) {
      if (typeof pages === "string") {
        try {
          pages = JSON.parse(pages);
        } catch {
          pages = [pages]; // fallback in case it's a plain string
        }
      }
    }

    // ✅ upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "stories_dive/story",
    });

    // ✅ check category existence
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Category not found",
        result: {},
      });
    }

    // ✅ create new story
    const story = new Story({
      title,
      cover: result.secure_url, // save uploaded image URL
      pages,
      category: categoryId, // ✅ match schema field
    });

    await story.save();

    return res.send({
      statusCode: 201,
      success: true,
      message: "Story added successfully",
      result: { story },
    });
  } catch (error) {
    console.log("Error in adding story", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: { error: error.message },
    });
  }
};


export const getAllStories = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // ✅ current logged in user

    // 1️⃣ Fetch all stories
    const stories = await Story.find()
      .populate("category")
      .sort({ createdAt: -1 });

    // 2️⃣ Fetch user's favourite stories
    const favourites = await favourateModel.find({
      user: userId,
      type: "story",
    }).select("story");

    // 3️⃣ Extract favourite story IDs
    const favouriteStoryIds = favourites.map(f => f.story.toString());

    // 4️⃣ Attach isFavourite flag to each story
    const storiesWithFav = stories.map(story => ({
      ...story.toObject(),
      isFavourite: favouriteStoryIds.includes(story._id.toString()),
    }));

    return res.send({
      statusCode: 200,
      success: true,
      message: "Stories fetched successfully",
      result: {
        stories: storiesWithFav,
      },
    });
  } catch (error) {
    console.log("Error in fetching stories", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: { error: error.message },
    });
  }
};

export const deleteStory= async(req,res)=>{
    try {
        const {storyId}=req.body;
        if(!storyId){
            return res.send({
                statusCode:400,
                success:false,
                message:"Story ID is required",
                result:{}
            });
        }
        const story= await Story.findById(storyId);
        if(!story){
            return res.send({
                statusCode:404,
                success:false,
                message:"Story not found",
                result:{}
            });
        }
        await Story.findByIdAndDelete(storyId);
        return res.send({
            statusCode:200,
            success:true,
            message:"Story deleted successfully",
            result:{}
        });
    } catch (error) {
        console.log("Error in deleting story", error);
        return res.send({
            statusCode:500,
            success:false,
            message:"Internal server error",
            result:{
                error: error.message
            }
        });
    }
}

export const editStory = async (req, res) => {
  try {
    let { storyId ,title, cover, pages, categoryId } = req.body;

    if (!storyId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Story ID is required",
        result: {},
      });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Story not found",
        result: {},
      });
    }

    // ✅ Handle category update
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.send({
          statusCode: 404,
          success: false,
          message: "Category not found",
          result: {},
        });
      }
      story.category = categoryId; // ✅ correct field
    }

    // ✅ Handle cover update
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "stories_dive/story",
      });
      story.cover = result.secure_url;
    } else if (cover) {
      story.cover = cover;
    }

    // ✅ Handle title update
    if (title) story.title = title;

    // ✅ Handle pages update
    if (pages) {
      if (typeof pages === "string") {
        try {
          pages = JSON.parse(pages);
        } catch {
          pages = [pages]; // fallback
        }
      }
      story.pages = pages;
    }

    await story.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Story updated successfully",
      result: { story },
    });
  } catch (error) {
    console.log("Error in updating story", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: { error: error.message },
    });
  }
};

export default{
    addStory,
    editStory,
    getAllStories,
    deleteStory
}