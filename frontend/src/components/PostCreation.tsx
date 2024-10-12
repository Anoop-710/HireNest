import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Image, Loader } from "lucide-react";
import AuthUser from "../../Interface/UserInterface";
interface PostData {
  content: string;
  image?: string;
}

interface PostCreationProps {
  user: AuthUser;
}
const PostCreation = ({ user }: PostCreationProps) => {
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null
  );

  const queryClient = useQueryClient();

  const { mutate: createPostMutation, isPending } = useMutation({
    mutationFn: async (postData: PostData) => {
      const res = await axiosInstance.post("/posts/create", postData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    },

    onSuccess: () => {
      resetForm();
      toast.success("Post created successfully");
      // fetch posts immediately after new posts are created
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response) {
        toast.error(
          error.response.data.message ||
            "Something went wrong, please try again"
        );
      } else {
        toast.error("Something went wrong, please try again");
      }
    },
  });

  const handlePostCreation = async () => {
    try {
      const postData: PostData = {
        content,
      };
      if (image) {
        postData.image = (await readFileAsDataURL(image)) as string;
      }

      createPostMutation(postData);
    } catch (error) {
      console.error("Error in handlePostCreation", error);
    }
  };

  // reset form
  const resetForm = () => {
    setContent("");
    setImage(null);
    setImagePreview(null);
  };

  // keep track of image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      readFileAsDataURL(file).then((preview) => {
        setImagePreview(preview);
      });
    } else {
      setImagePreview(null);
    }
  };

  const readFileAsDataURL = (
    file: File
  ): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  return (
    <div className="bg-secondary rounded-lg shadow mb-4 p-4">
      <div className="flex space-x-3">
        <img
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          className="size-12 rounded-full"
        />
        <textarea
          placeholder="What's on your mind?"
          className="w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none resize-none transition-colors duration-200 min-h-[100px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {imagePreview && typeof imagePreview === "string" && (
        <div className="mt-4">
          <img
            src={imagePreview}
            alt="Selected"
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-4">
          <label className="flex items-center text-info hover:text-info-dark transition-colors duration-200 cursor-pointer">
            <Image size={20} className="mr-2" />
            <span>Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <button
          className="bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors duration-200"
          onClick={handlePostCreation}
          disabled={isPending}
        >
          {isPending ? <Loader className="size-5 animate-spin" /> : "Share"}
        </button>
      </div>
    </div>
  );
};

export default PostCreation;
