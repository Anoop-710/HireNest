import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/auth.model";

type AuthenticatedRequest = Request & {
  user?: typeof User.prototype; // typeof User.prototype gives you the type of the Mongoose user instance
};

export const protectRoute = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies["jwt-hireNest"];

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // decoded token
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (!decodedToken) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(decodedToken.userId).select("-password");

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(
      `Error in protectRoute middleware: ${(error as Error).message}`
    );
    res.status(401).json({ message: "Unauthorized" });
  }
};
