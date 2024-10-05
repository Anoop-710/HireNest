import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../controllers/notification.controller";
const router = Router();

router.get("/", protectRoute, getUserNotifications);

// mark as read
router.put("/:id/read", protectRoute, markNotificationAsRead);

// delete notification
router.delete("/:id", protectRoute, deleteNotification);
export default router;
