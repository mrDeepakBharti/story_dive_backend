import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      default: "",
    },
    type: {
      type: String,
      enum: ["story", "category"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Favourite", favouriteSchema);
