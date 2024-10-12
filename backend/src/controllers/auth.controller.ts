import { Request, Response } from "express";
import User from "../models/auth.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers";

type AuthenticatedRequest = Request & {
  user?: typeof User.prototype; // typeof User.prototype gives you the type of the Mongoose user instance
};
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password } = req.body;

    console.log("Email from signup form:", email);
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

    const profileUrl = `${process.env.CLIENT_URL}/profile/${user.username}`;
    try {
      await sendWelcomeEmail(user.name, user.email, profileUrl);
      // profileUrl routes to user HireNest profile
    } catch (emailError) {
      console.error(
        `Error sending welcome email: ${(emailError as Error).message}`
      );
    }
  } catch (error) {
    console.log(`Error in sign ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // check if email and password are empty
    if (!username || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials, User not found" });
      return;
    }

    // check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    // create and send token
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

    res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    console.error(`Error in login ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie("jwt-hireNest");
  res.json({ message: "logged out successfully" });
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error(`Error in getCurrentUser ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
