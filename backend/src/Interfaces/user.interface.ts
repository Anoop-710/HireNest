import mongoose, { Document } from "mongoose";

export interface User extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  coverPicture?: string;
  headline?: string;
  location?: string;
  about?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  connections?: mongoose.Types.ObjectId[];
  followers?: mongoose.Types.ObjectId[];
  following?: mongoose.Types.ObjectId[];
  socials?: Socials;
}

interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  startYear: number;
  endYear: number;
}

interface Socials {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
}
