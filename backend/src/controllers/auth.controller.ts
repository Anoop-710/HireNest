import { Request, Response } from "express";
import User from "../models/auth.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password } = req.body;

    // Validate input
    if (!name || !username || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const existingUserName = await User.findOne({ username });
    if (existingUserName) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }

    if (password.length < 12) {
      res
        .status(400)
        .json({ message: "Password must be at least 12 characters" });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // Save user to database
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.cookie("jwt-hireNest", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // Send success response
    res.status(201).json({
      message: "User created successfully",
    });

    //  todo send verification email
  } catch (error) {
    console.log(`Error in sign ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = (req: Request, res: Response): void => {
  res.send("login");
};

export const logout = (req: Request, res: Response): void => {
  res.send("logout");
};
