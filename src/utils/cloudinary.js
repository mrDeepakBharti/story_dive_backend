import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (req, res) => {
  try {
    const file = req.file.path; // if using multer
    const result = await cloudinary.uploader.upload(file, {
      folder: "stories_dive", // optional: creates folder in Cloudinary
    });

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFromCloudinary= async(public_id)=>{
    try {
        const result= await cloudinary.uploader.destroy(public_id);
        return result;
    } catch (error) {
        console.log("Error in deleting from cloudinary",error);
        throw error;
    }
}
export default cloudinary;
