import { Response, Request } from "express";
import User from "../models/auth.model";

type AuthenticatedRequest = Request & {
  user?: typeof User.prototype;
};
export const getSuggestedConnection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUser = await User.findById(req.user?._id).select(
      "connections"
    );

    // find users who are not in the current user's connections (not connected to the current user)
    // don't recommend own profile

    const suggestedUser = await User.find({
      _id: {
        $ne: req.user?._id,
        $nin: currentUser?.connections,
      },
    })
      .select("name username profilePicture headline")
      .limit(4);

    res.json(suggestedUser);
  } catch (error) {
    console.error(
      `Error in getSuggestedConnection ${(error as Error).message}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(`Error in getUserProfile ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
