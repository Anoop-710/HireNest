import { Router } from "express";
import {
  signup,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.middleware";
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// protected routes
router.get("/my-profile", protectRoute, getCurrentUser);
export default router;
