import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { restructureResume } from "../controllers/restructuredResume.controller";

const router = Router();
router.post("/", protectRoute, restructureResume);

export default router;
