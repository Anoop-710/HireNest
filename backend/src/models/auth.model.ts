import mongoose from "mongoose";
import { User } from "../Interfaces/user.interface";

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  startDate: Date,
  endDate: Date,
  description: String,
});

const educationSchema = new mongoose.Schema({
  school: String,
  fieldOfStudy: String,
  startYear: Number,
  endYear: Number,
});

const socialsSchema = new mongoose.Schema({
  facebook: String,
  instagram: String,
  twitter: String,
  linkedin: String,
  github: String,
});

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    resume: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "HireNest user",
    },
    location: {
      type: String,
      default: "Earth",
    },
    about: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: [experienceSchema],
    education: [educationSchema],

    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    socials: socialsSchema,
  },
  { timestamps: true }
);

const User = mongoose.model<User>("User", userSchema);

export default User;
