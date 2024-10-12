import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  getSuggestedConnection,
  getPublicProfile,
  updateUserProfile,
} from "../controllers/user.controller";

const router = Router();

router.get("/suggestions", protectRoute, getSuggestedConnection);
router.get("/:username", protectRoute, getPublicProfile);

// update user profile
router.put("/:profile", protectRoute, updateUserProfile);

export default router;
