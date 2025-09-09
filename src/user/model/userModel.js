import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
        default:""},
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
    refferedBy:{
        code:{
            type:String,
            default:""
        },
        status:{
            type:String,
            enum:["pending","approved","rejected"],
            default:"pending"
        }
           
        },
        otp:{
          otpValue:{
            type:Number,
            default:0
          },
          otpExpireTime: {
            type:Date,
            default:Date.now() + 5 * 60 * 1000
          }
        },
        resetPasswordEntry:{
            resetPasswordToken:{
                type:String,
                default:""
            },
            resetPasswordExpireTime:{
                type:Date,
                default:Date.now()
            }
        },
        isAccountVerified:{
            type:Boolean,
            default:false
        },
        deactivateAt:{
            type:String,
            default:""
        }
     

});
const userModel= mongoose.model('User',userSchema);
export default userModel;