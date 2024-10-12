import mongoose from "mongoose";

export interface INotification {
  recipient: mongoose.Types.ObjectId;
  type: "like" | "comment" | "connectionAccepted";
  relatedUser?: mongoose.Types.ObjectId;
  relatedPost?: mongoose.Types.ObjectId;
  read?: boolean;
}
