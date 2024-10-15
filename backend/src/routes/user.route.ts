import { Router, Request, Response } from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  getSuggestedConnection,
  getPublicProfile,
  updateUserProfile,
} from "../controllers/user.controller";
import upload from "../lib/multer";

const router = Router();

router.get("/suggestions", protectRoute, getSuggestedConnection);
router.get("/:username", protectRoute, getPublicProfile);

// update user profile
router.put(
  "/profile",
  protectRoute,
  upload.single("resume"),
  updateUserProfile
);

export default router;
