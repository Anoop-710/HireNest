import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  getSuggestedConnection,
  getUserProfile,
} from "../controllers/user.controller";

const router = Router();

router.get("/suggestions", protectRoute, getSuggestedConnection);
router.get("/:username", protectRoute, getUserProfile);
export default router;
