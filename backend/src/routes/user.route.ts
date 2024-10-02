import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  getSuggestedConnection,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller";

const router = Router();

router.get("/suggestions", protectRoute, getSuggestedConnection);
router.get("/:username", protectRoute, getUserProfile);

// update user profile
router.put("/:username", protectRoute, updateUserProfile);
export default router;
