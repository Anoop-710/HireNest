import { Response, Request } from "express";
import User from "../models/auth.model";
import cloudinary from "../lib/cloudinary";

interface UpdatedData {
  [key: string]: any; // allows any key with any value, or you can specify specific fields and types
}

type AuthenticatedRequest = Request & {
  user?: typeof User.prototype;
};

const uploadToCloudinary = async (fileBuffer: Buffer, options: any) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
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
      .limit(10);

    res.json(suggestedUser);
  } catch (error) {
    console.error(
      `Error in getSuggestedConnection ${(error as Error).message}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPublicProfile = async (
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

    res.status(200).json(user);
  } catch (error) {
    console.error(`Error in getUserProfile ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const allowedFields = [
      "name",
      "headline",
      "profilePicture",
      "coverPicture",
      "headline",
      "about",
      "location",
      "experience",
      "education",
      "socials",
      "skills",
      "resume",
    ];

    const updatedData: UpdatedData = {};

    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    }

    // Profile picture and cover picture
    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      updatedData.profilePicture = result.secure_url;
    }

    if (req.body.coverPicture) {
      const result = await cloudinary.uploader.upload(req.body.coverPicture);
      updatedData.coverPicture = result.secure_url;
    }

    // Add user resume

    if (req.file) {
      const result: any = await uploadToCloudinary(req.file.buffer, {
        resource_type: "raw",
        format: "pdf",
      });

      updatedData.resume = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.error(`Error in updateUserProfile ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
