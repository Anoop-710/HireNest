import mongoose, { Document } from "mongoose";
import { User } from "./user.interface";

export interface IConnectionRequest extends Document {
  sender: mongoose.Types.ObjectId | User;
  recipient: mongoose.Types.ObjectId | User;
  status: "pending" | "accepted" | "rejected";
}
