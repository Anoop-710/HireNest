import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import { Link, useParams } from "react-router-dom";
import {
  LoaderCircle,
  MessageCircle,
  Send,
  ThumbsUp,
  Trash2,
} from "lucide-react";

import PostAction from "./PostAction";
import { v4 as uuidv4 } from "uuid";
import { formatDistanceToNow } from "date-fns";
import ApplyModal from "./Modal/ApplyModal";

interface User {
  _id: string;
  name: string;
  profilePicture?: string;
  username: string;
  headline?: string;
  resume?: string;
}

interface Comment {
  _id: string;
  content: string;
  user: User;
  createdAt: Date;
}

interface Post {
  _id: string;
  author: User;
  content: string;
  image?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

interface PostProps {
  post: Post;
  authUser: User;
}

const Post = ({ post }: PostProps) => {
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const isOwner = authUser ? authUser._id === post.author._id : false; // Safely access _id
  const isLiked = authUser ? post.likes.includes(authUser._id) : false; // Safely check if liked
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isRestructured, setIsRestructured] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [newResumeUrl, setNewResumeUrl] = useState<string | null>(null);

  const { postId } = useParams();

  const queryClient = useQueryClient();

  // delete post
  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/posts/delete/${post._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to delete post, please try again");
      }
    },
  });

  // create comment
  const { mutate: createComment, isPending: isAddingComment } = useMutation({
    mutationFn: async (newComment: string) => {
      await axiosInstance.post(`/posts/${post._id}/comment`, {
        content: newComment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Comment created successfully");
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create comment, please try again");
      }
    },
  });

  // like post
  const { mutate: likePost, isPending: isLikingPost } = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(`/posts/${post._id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const handleDeletePost = () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    deletePost();
  };

  const handleLikePost = async () => {
    if (isLikingPost) return;
    likePost();
  };

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newComment.trim()) {
      createComment(newComment);
      setNewComment("");
      setComments([
        ...comments,
        {
          _id: uuidv4(), // Generate a unique ID for the comment
          content: newComment,
          user: {
            _id: authUser?._id || "",
            name: authUser?.name || "",
            profilePicture: authUser?.profilePicture || "",
            username: authUser?.username || "",
          },
          createdAt: new Date(),
        },
      ]);
    }
  };

  const handleApplyClick = () => {
    if (!authUser?.resume) {
      toast.error("Please upload a resume before applying.");
      return;
    }
    setShowApplyModal(true);
  };

  const handleRestructure = async () => {
    try {
      setIsDownloading(true);

      const response = await axiosInstance.post(
        `/restructure`,
        {
          resumeUrl: authUser?.resume,
          jobDescription: post.content,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setIsRestructured(true);
        setNewResumeUrl(response.data.pdfUrl);
        toast.success("Resume restructured successfully! Ready to apply!");
      } else {
        toast.error("Failed to restructure resume");
      }

      // If restructure was successful, update the state
      if (response.data.pdfUrl) {
        setIsRestructured(true);
        toast.success("Resume restructured successfully!");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: string | any) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error restructuring resume:", {
          message: error.message,
          code: error.code,
          responseData: error.response?.data || null,
          request: error.request,
          config: error.config,
        });
        toast.error(
          error.response?.data?.message || "Failed to restructure resume."
        );
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleApply = () => {
    if (!authUser?.resume) {
      toast.error("Please upload a resume before applying.");
      return;
    }
    setShowApplyModal(false);
    toast.success(
      isRestructured
        ? "Application sent with restructured resume!"
        : "Application sent with original resume!"
    );
  };
  return (
    <div className="bg-secondary rounded-lg shadow mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link to={`/profile/${post?.author?.username}`}>
              <img
                src={post.author.profilePicture || "/avatar.png"}
                alt={post.author.name}
                className="size-10 rounded-full mr-3"
              />
            </Link>

            <div>
              <Link to={`/profile/${post?.author?.username}`}>
                <h3 className="font-semibold">
                  {post.author ? post.author.name : "Unknown Author"}
                </h3>
              </Link>
              <p className="text-xs text-info">{post.author?.headline}</p>
              <p className="text-xs text-info">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={handleDeletePost}
              className="text-red-500 hover:text-red-700"
            >
              {isDeletingPost ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          )}
        </div>

        <p className="mb-4">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post content"
            className="rounded-lg w-full mb-4"
          />
        )}

        <div className="flex justify-between text-info">
          <PostAction
            icon={
              <ThumbsUp
                size={18}
                className={isLiked ? "text-blue-500  fill-blue-300" : ""}
              />
            }
            text={`Like (${post.likes.length})`}
            onClick={handleLikePost}
          />

          <PostAction
            icon={<MessageCircle size={18} />}
            text={`Comment (${comments.length})`}
            onClick={() => setShowComments(!showComments)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-primary-dark transition duration-300"
            onClick={handleApplyClick}
          >
            Apply
          </button>
          {showApplyModal && (
            <ApplyModal onClose={() => setShowApplyModal(false)}>
              <div className="p-4">
                <h3 className="text-lg font-semibold">Resume Options</h3>
                <p className="text-sm mb-4">
                  Would you like to restructure your resume before applying?
                </p>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handleRestructure}
                    className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded"
                    disabled={isDownloading}
                  >
                    {isDownloading ? "Restructuring..." : "Build AI Resume"}
                  </button>
                  {isRestructured && newResumeUrl && (
                    <a
                      href={newResumeUrl}
                      download
                      className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded text-center"
                    >
                      Download Resume
                    </a>
                  )}

                  {isRestructured ? (
                    <div></div>
                  ) : (
                    <button
                      onClick={handleApply}
                      className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 border-b-4 border-gray-700 hover:border-gray-500 rounded"
                    >
                      Apply directly
                    </button>
                  )}
                </div>
              </div>
            </ApplyModal>
          )}
        </div>
      </div>

      {showComments && (
        <div className="px-4 pb-4">
          <div className="mb-4 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="mb-2 bg-base-100 p-2 rounded flex items-start"
              >
                <img
                  src={comment.user.profilePicture || "/avatar.png"}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                />
                <div className="flex-grow">
                  <div className="flex items-center mb-1">
                    <span className="font-semibold mr-2">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-info">
                      {formatDistanceToNow(new Date(comment.createdAt))}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow p-2 rounded-l-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              type="submit"
              className="bg-primary text-white p-2 rounded-r-full hover:bg-primary-dark transition duration-300"
              disabled={isAddingComment}
            >
              {isAddingComment ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;
