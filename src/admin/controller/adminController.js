import bcrypt from "bcrypt";
// import validator from "email-validator";
import validator from "validator";
import { generateAuthJWT } from "../../middleware/verifyJWT.js";
import User from "../../user/model/userModel.js";
import Admin from "../model/adminModel.js";
const isValidEmail = (email) => {
  return validator.isEmail(email);  // ✅ correct method
};
const isValidPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
};

export const adminLogin=async(req,res)=>{
    try {
        let {email,password}=req.body;
        if(!email){
            return res.send({
                statusCode:400,
                success:false,
                message:"Email is required",
                result:{}
            });
        }
        if(!isValidEmail(email)){
            return res.send({
                statusCode:400,
                success:false,
                message:"Invalid email format",
                result:{}
            });
        }
        if(!password){
            return res.send({
                statusCode:400,
                success:false,
                message:"Password is required",
                result:{}
            });
        }
        if(!isValidPassword(password)){
            return res.send({
                statusCode:400,
                success:false,
                message:"Invalid password format. Password should be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
                result:{}
            });
        }
       let admin= await Admin.findOne({email});
         if(!admin){
          return res.send({
                statusCode:401,
                success:false,
                message:"Invalid credentials",
                result:{}
          });
         } 
       let isPasswordMatch= await bcrypt.compare(password,admin.password);
       if(!isPasswordMatch){
        return res.send({
            statusCode:401,
            success:false,
            message:"Invalid credentials",
            result:{}
      });
       }
       const token= generateAuthJWT({
        adminId:admin._id,
        email:admin.email,
        role:'admin',
        expires_in:process.env.JWT_EXPIRES_IN
       });  
         return res.send({
           statusCode:200,
           success:true,
           message:"Login successful",
           result:{
               token
           }
       });
    } catch (error) {
        console.log("Error in admin login",error);
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

export const getAllUsers=async(req,res)=>{
    try {
        let users= await User.find().select('-password -refferedBy -otp -resetPasswordEntry').sort({createdAt:-1});
        return res.send({
            statusCode:200,
            success:true,
            message:"Users fetched successfully",
            result:{
                users
            }
        });
    } catch (error) {
        console.log("Error in fetching users",error);
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

export const deleteUser=async(req,res)=>{
    try {
        let {userId}=req.body;
        if(!userId){
            return res.send({
                statusCode:400,
                success:false,
                message:"User ID is required",
                result:{}
            });
        }
        let user= await User.findById(userId);
        if(!user){
            return res.send({
                statusCode:404,
                success:false,
                message:"User not found",
                result:{}
            });
        }
        await User.findByIdAndDelete(userId);
        return res.send({
            statusCode:200,
            success:true,
            message:"User deleted successfully",
            result:{}
        });
    } catch (error) {
        console.log("Error in deleting user",error);
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

export const getUserById=async(req,res)=>{
    try {
        let {userId}=req.body;
        if(!userId){
            return res.send({
                statusCode:400,
                success:false,
                message:"User ID is required",
                result:{}
            });
        }
        let user= await User.findById(userId).select('-password -refferedBy -otp -resetPasswordEntry');
        if(!user){
            return res.send({
                statusCode:404,
                success:false,
                message:"User not found",
                result:{}
            });
        }
        return res.send({
            statusCode:200,
            success:true,
            message:"User fetched successfully",
            result:{
                user
            }
        });
    } catch (error) {
        console.log("Error in fetching user",error);
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

export const getDashboardStats=async(req,res)=>{
    try {
        let totalUsers= await User.countDocuments();
        let totalActiveUsers= await User.countDocuments({isActive:true});
        let totalInactiveUsers= await User.countDocuments({isActive:false});
        return res.send({
            statusCode:200,
            success:true,
            message:"Dashboard stats fetched successfully",
            result:{
                totalUsers,
                totalActiveUsers,
                totalInactiveUsers
            }
        });
    } catch (error) {
        console.log("Error in fetching dashboard stats",error);
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


export default{
    adminLogin,
    getAllUsers,
    deleteUser,
    getUserById,
    getDashboardStats
}