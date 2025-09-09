import mongoose from "mongoose";

const categoriesSchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true,
        unique:true,
    },
    categoryImage:{
        type:String,
        required:true,
        default:""
    }
},
{timestamps:true}
);

const categoriesModel= mongoose.model('Categories',categoriesSchema);
export default categoriesModel; 