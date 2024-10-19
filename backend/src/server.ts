import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import postRoutes from "./routes/post.route";
import notificationRoutes from "./routes/notification.routes";
import connectionRoutes from "./routes/connection.route";
import resumeRestructureRoutes from "./routes/restructuredResume";
import cors from "cors";
import path from "path";

import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "5mb" })); // parse JSON request bodies
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

//post routes
app.use("/api/v1/posts", postRoutes);

// notification route
app.use("/api/v1/notifications", notificationRoutes);

// connection route
app.use("/api/v1/connections", connectionRoutes);

// resume restructuring route
app.use("/api/v1/restructure", resumeRestructureRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
