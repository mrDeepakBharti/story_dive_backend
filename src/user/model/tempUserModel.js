import mongoose from "mongoose";
const tempUserSchema = new mongoose.Schema({
    userName:{ 
        type:String,
        required:true,
        default:""
    },
    email:{
        type:String,
        required:true,
        unique:true,
        default:""
    },
    password:{
        type:String,
        required:true,
        default:""
    },
     confirmPassword:{
        type:String,
        required:true,
        default:""
     },
     profilePhoto:{
        type:String,
        default:""},
    fcmToken:{
        type:String,
        default:""
    },
    referralCode:{
        type:String,
        default:""
    },
    otp:{
      otpValue: {
      type: Number,
      default: 0
    },
    otpExpireTime: {
      type: Date,
      default: () => Date.now() + 5 * 60 * 1000 // ✅ function, not evaluated once at schema load
    }
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:300 // document will be removed after 5 minutes
    }
});
const TempUser= mongoose.model("TempUser",tempUserSchema);
export default TempUser;