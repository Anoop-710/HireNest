interface AuthUser {
  _id: string;
  username: string;
  name: string;
  profilePicture?: string;
  headline?: string;
  connections?: string[];
  notifications?: Notification[];
  followers?: number;
  following?: number;
  coverPicture?: string;
  about?: string;
  location?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  resume?: string;
}

interface Experience {
  _id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  currentlyWorking: boolean;
}

interface Education {
  _id?: string;
  school: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
}
export default AuthUser;
