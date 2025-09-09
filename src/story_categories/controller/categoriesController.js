import favourateModel from "../../favourate_stories&categories/model/favourateModel.js";
import Category from "../../story_categories/model/categoriesModel.js";
import cloudinary from "../../utils/cloudinary.js";

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Category name is required",
        result: {},
      });
    }

    if (!req.file) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Category image is required",
        result: {},
      });
    }

    // 📌 Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "stories_dive/categories",
    });

    // 📌 Save category
    const category = new Category({
      categoryName: name,
      categoryImage: result.secure_url,
    });

    await category.save();

    return res.send({
      statusCode: "200",
      success: true,
      message: "Category added successfully",
      result: { category },
    });
  } catch (error) {
    console.log("Error in adding category", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: { error: error.message },
    });
  }
};


export const getAllCategories = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Fetch categories
    const categories = await Category.find().sort({ createdAt: -1 });

    // Fetch user's favourites for categories
    const favourites = await favourateModel.find({
      user: userId,
      type: "category",
    }).select("category");

    // Extract favourite category IDs
    const favouriteCategoryIds = favourites.map(f => f.category.toString());

    // Attach isFavourite field to categories
    const categoriesWithFav = categories.map(cat => ({
      ...cat.toObject(),
      isFavourite: favouriteCategoryIds.includes(cat._id.toString()),
    }));

    return res.send({
      statusCode: 200,
      success: true,
      message: "Categories fetched successfully",
      result: { categories: categoriesWithFav },
    });
  } catch (error) {
    console.log("Error in fetching categories", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: { error: error.message },
    });
  }
};
export const deleteCategory= async(req,res)=>{
    try {
      const {categoryId}=req.body;
      if(!categoryId){
        return res.send({
            statusCode:400,
            success:false,
            message:"Category ID is required",
            result:{}
        });
      }
      const category= await Category.findById(categoryId);
      if(!category){
        return res.send({
            statusCode:404,
            success:false,
            message:"Category not found",
            result:{}
        });
      }
       
        await Category.findByIdAndDelete(categoryId);
        return res.send({
            statusCode:200,
            success:true,
            message:"Category deleted successfully",
            result:{}
        });
        
    } catch (error) {
        console.log("Error in deleting category",error);
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

export const editCategory = async (req, res) => {
  try {
    const { name, imageUrl, categoryId } = req.body;

    if (!categoryId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Category ID is required",
        result: {},
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Category not found",
        result: {},
      });
    }

    // ✅ use correct schema field names
    if (name) category.categoryName = name;
    if (imageUrl) category.categoryImage = imageUrl;

    await category.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Category updated successfully",
      result: { category },
    });
  } catch (error) {
    console.log("Error in editing category", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Internal server error",
      result: { error: error.message },
    });
  }
};

export const toggleCategoryVisibility= async(req,res)=>{
    try {
       const {categoryId}=req.params;
       if(!categoryId){
        return res.send({
            statusCode:400,
            success:false,
            message:"Category ID is required",
            result:{}
        });
       }
       const category= await Category.findById(categoryId);
       if(!category){
        return res.send({
            statusCode:404,
            success:false,
            message:"Category not found",
            result:{}
        });
       }
       category.isVisible = !category.isVisible;
       await category.save();
       return res.send({
        statusCode:200,
        success:true,
        message:"Category visibility toggled successfully",
        result:{
            category
        }
       }); 
    } catch (error) {
        console.log("Error in toggling category visibility",error);
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

export default {
    addCategory,
    getAllCategories,
    deleteCategory,
    editCategory,
    toggleCategoryVisibility
    
}