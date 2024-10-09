interface AuthUser {
  _id: string;
  username: string;
  connections: string;
  notifications: string;
  followers: number;
  following: number;
  profilePicture: string;
  coverPicture: string;
  name: string;
  headline: string;
}

export default AuthUser;
