import { Request, Response } from "express";
import Notification from "../models/notification.model";
import User from "../models/auth.model";

type AuthenticatedRequest = Request & { user?: typeof User.prototype };
export const getUserNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({
        createdAt: -1,
      })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "content image");

    res.status(200).json(notifications);
  } catch (error) {
    console.error(`Error in getUserNotifications ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const notificationId = req.params.id;
  try {
    const notification = await Notification.findByIdAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    res.status(200).json(notification);
  } catch (error) {
    console.error(
      `Error in markNotificationAsRead ${(error as Error).message}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const notificationId = req.params.id;

  try {
    await Notification.findByIdAndDelete({
      _id: notificationId,
      recipient: req.user?._id,
    });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteNotification ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
