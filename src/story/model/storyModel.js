import mongoose from "mongoose";
const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    cover: { type: String, required: true },
    pages: [{ type: String, required: true }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
    },
    isVisible: { type: Boolean, default: true }, // ✅ for enable/disable
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);