import AuthUser from "./UserInterface";

interface IPost {
  createdAt: Date;
  _id: string;
  author: AuthUser;

  content: string;
  image?: string;
  likes: string[];
  comments: {
    _id: string;
    content: string;
    user: AuthUser;
    createdAt: Date;
  }[];
}

export default IPost;
