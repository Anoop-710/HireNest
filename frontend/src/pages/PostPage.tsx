import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import AuthUser from "../../interfaces/UserInterface";

const PostPage = () => {
  const { postId } = useParams();
  const { data: authUser } = useQuery<AuthUser>({ queryKey: ["authUser"] });

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => axiosInstance.get(`/posts/${postId}`),
  });

  if (isLoading) return <div>Loading post...</div>;
  if (!post?.data) return <div>Post not found</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-12">
      <div className="hidden lg:block lg:col-span-1">
        {authUser && <Sidebar user={authUser} />}
      </div>

      <div className="col-span-1 lg:col-span-3">
        <Post post={post.data} authUser={authUser} />
      </div>
    </div>
  );
};

export default PostPage;
