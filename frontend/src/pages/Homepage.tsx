import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import PostCreation from "../components/PostCreation";
import { Users } from "lucide-react";
import PostComponent from "../components/Post";
import RecommendedUser from "../components/RecommendedUser";

interface AuthUser {
  _id: string;
  username: string;
  name: string;
  profilePicture?: string;
  connections?: string[];
  notifications?: Notification[];
  followers?: number;
  following?: number;
  coverPicture?: string;
  headline?: string;
}

interface Post {
  _id: string;
  author: AuthUser;
  content: string;
  image?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  user: AuthUser;
  createdAt: Date;
}

interface RecommendedUser {
  _id: string;
  username: string;
  name: string;
  profilePicture?: string;
}

const Homepage: React.FC = () => {
  const { data: authUser } = useQuery<AuthUser>({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/my-profile");
        return res.data;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Something went wrong");
        }
        return undefined;
      }
    },
  });

  const { data: recommendedUsers } = useQuery<RecommendedUser[]>({
    queryKey: ["recommendedUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/suggestions");
      return res.data;
    },
  });

  const { data: posts } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/posts");
      return res?.data;
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 my-auto">
      <div className="hidden lg:block lg:col-span-1 mt-12">
        {authUser && <Sidebar user={authUser} />}
      </div>

      <div className="col-span-1 lg:col-span-2 order-first lg:order-none mt-12">
        {authUser ? <PostCreation user={authUser} /> : null}

        {posts?.map((post) =>
          authUser ? (
            <PostComponent key={post._id} post={post} authUser={authUser} />
          ) : null
        )}

        {posts?.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <Users size={64} className="mx-auto text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              No Posts Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect with others to start seeing posts in your feed!
            </p>
          </div>
        )}
      </div>

      {(recommendedUsers?.length ?? 0) > 0 && (
        <div className="col-span-1 lg:col-span-1 hidden lg:block mt-12">
          <div className="bg-secondary rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">People you may know</h2>
            {recommendedUsers?.map((user) => (
              <RecommendedUser key={user._id} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
