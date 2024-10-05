import mongoose, { Document } from "mongoose";
import { IConnectionRequest } from "../Interfaces/connection.interface";

const connectionRequestSchema = new mongoose.Schema<
  IConnectionRequest & Document
>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ConnectionRequest = mongoose.model<IConnectionRequest & Document>(
  "ConnectionRequest",
  connectionRequestSchema
);

export default ConnectionRequest;
