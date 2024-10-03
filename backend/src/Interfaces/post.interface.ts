import mongoose from "mongoose";
import { User } from "./user.interface";

export interface IPost extends Document {
  author: mongoose.Types.ObjectId | User; // Union type to allow both ObjectId or a populated User
  content: string;
  image: string;
  likes: mongoose.Types.ObjectId[];
  comments: {
    content: string;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
}
