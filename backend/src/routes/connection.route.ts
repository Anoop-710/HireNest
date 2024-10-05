import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  getUserConnections,
  removeConnection,
  getConnectionStatus,
} from "../controllers/connection.controller";

const router = Router();

router.post("/request/:userId", protectRoute, sendConnectionRequest);
router.post("/accept/:userId", protectRoute, acceptConnectionRequest);
router.post("/reject/:userId", protectRoute, rejectConnectionRequest);

// get all connection requests for current user
router.get("/requests", protectRoute, getConnectionRequests);

// get all connections for a user
router.get("/", protectRoute, getUserConnections);
router.delete("/:userId", protectRoute, removeConnection);
router.get("/status/:userId", protectRoute, getConnectionStatus);
export default router;
