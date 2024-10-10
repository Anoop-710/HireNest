import { Request, Response } from "express";
import ConnectionRequest from "../models/connection.model";
import User from "../models/auth.model";
import Notification from "../models/notification.model";
import { IConnectionRequest } from "../Interfaces/connection.interface";
import { sendConnectionAcceptedEmail } from "../emails/emailHandlers";

type AuthenticatedRequest = Request & { user?: typeof User.prototype };
export const sendConnectionRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const senderId = req.user?._id;

    if (senderId.toString() === userId) {
      res
        .status(400)
        .json({ message: "You can't send connection request to yourself." });
      return;
    }

    if (req.user.connections.includes(userId)) {
      res.status(400).json({ message: "You are already connected" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });

    if (existingRequest) {
      // res.status(400).json({ message: `You have already sent a connection request to ${userId}` });
      res.status(200).json({ message: `Connection request sent successfully` });
    }

    const newRequest = new ConnectionRequest({
      sender: senderId,
      recipient: userId,
    });

    await newRequest.save();

    // res.status(200).json({ message: `Connection request sent to ${userId} successfully` });

    res.status(200).json({ message: `Connection request sent successfully` });
  } catch (error) {
    console.error(`Error in sendConnectionRequest ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptConnectionRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    if (!requestId) {
      res.status(400).json({ message: "Invalid request ID" });
      return;
    }

    const request = await ConnectionRequest.findById(requestId).populate([
      { path: "sender", select: "name email username" },
      { path: "recipient", select: "name email username" },
    ]);

    if (!request) {
      res.status(404).json({ message: "Connection request not found" });
      return;
    }

    if (request.recipient._id.toString() !== userId.toString()) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    if (request.status !== "pending") {
      res
        .status(400)
        .json({ message: "Connection request has already been processed" });
      return;
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: {
        connections: userId,
      },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        connections: request.sender._id,
      },
    });

    const notification = new Notification({
      recipient: request.sender._id,
      type: "connectionAccepted",
      relatedUser: userId,
    });

    await notification.save();

    // Send success response
    res
      .status(200)
      .json({ message: "Connection request accepted successfully" });

    // Asynchronous email notification
    const sender = request.sender as User;
    const recipient = request.recipient as User;

    const senderEmail = sender.email;
    const senderName = sender.name;
    const recipientName = recipient.name;
    const profileUrl = `${process.env.CLIENT_URL}/profile/${recipient.username}`;

    try {
      await sendConnectionAcceptedEmail(
        senderEmail,
        senderName,
        recipientName,
        profileUrl
      );
    } catch (emailError) {
      console.error(
        `Error in sendConnectionAcceptedEmail ${(emailError as Error).message}`
      );
      // No response here since it's already sent
    }
  } catch (error) {
    console.error(
      `Error in acceptConnectionRequest ${(error as Error).message}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectConnectionRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    if (!requestId) {
      res.status(400).json({ message: "Invalid request ID" });
      return;
    }

    const request = await ConnectionRequest.findById(requestId);

    // ensures that only the intended recipient of the connection request can reject it
    if (request?.recipient.toString() !== userId.toString()) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    if (request?.status !== "pending") {
      res
        .status(400)
        .json({ message: "Connection request has already been processed" });
      return;
    }

    request.status = "rejected";
    await request.save();
    res
      .status(200)
      .json({ message: "Connection request rejected successfully" });
  } catch (error) {
    console.error(
      `Error in rejectConnectionRequest ${(error as Error).message}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

// get all connection requests for current user
export const getConnectionRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      recipient: userId,
      status: "pending",
    }).populate("sender", "name username profilePicture headline connections");

    res.status(200).json(requests);
  } catch (error) {
    console.error(`Error in getConnectionRequests ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get all connections for a user
export const getUserConnections = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );

    res.status(200).json(user?.connections);
  } catch (error) {
    console.error(`Error in getUserConnections ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

// remove connection
export const removeConnection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    await User.findByIdAndUpdate(myId, {
      $pull: {
        connections: userId,
      },
    });

    await User.findByIdAndUpdate(userId, {
      $pull: {
        connections: myId,
      },
    });

    res.status(200).json({ message: "Connection removed successfully" });
  } catch (error) {
    console.error(`Error in removeConnection ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get connection status
export const getConnectionStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const currentUser = req.user;

    if (currentUser.connections.includes(targetUserId)) {
      res.status(200).json({ status: "connected" });
      return;
    }

    // query checks for any pending connection requests between the current user and the target user.
    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      // If the current user is the sender:
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        res.status(200).json({ status: "pending" });
        return;
      } else {
        // If the target user is the sender:
        res
          .status(200)
          .json({ status: "received", requestId: pendingRequest._id });
        return;
      }
    }

    // if no connection or pending requests found
    res.status(200).json({ status: "not_connected" });
  } catch (error) {
    console.error(`Error in getConnectionStatus ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
