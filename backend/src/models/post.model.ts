import mongoose, { Document } from "mongoose";
import { IPost } from "../Interfaces/post.interface";

const postSchema = new mongoose.Schema<IPost & Document>(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: false, // Update according to your requirement
    },
    image: {
      type: String,
      required: false, // Update according to your requirement
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        content: { type: String, required: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model<IPost & Document>("Post", postSchema);

export default Post;
