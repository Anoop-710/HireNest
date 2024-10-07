import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../../../lib/axios";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";

interface CustomError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}
interface LoginFormData {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();

  const { mutate: loginMutation, status } = useMutation<
    unknown,
    Error,
    LoginFormData
  >({
    mutationFn: (userData: LoginFormData) =>
      axiosInstance.post("/auth/login", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error: unknown) => {
      let errorMsg = "Something went wrong, please try again.";
      const customError = error as CustomError;
      if (
        customError.response &&
        customError.response.data &&
        customError.response.data.message
      ) {
        errorMsg = customError.response.data.message;
      } else if (customError.message) {
        errorMsg = customError.message;
      }
      toast.error(errorMsg);
    },
  });

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    loginMutation({ username, password });
  };

  const isLoading = status === "pending";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <input
        type="text"
        placeholder="    Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full h-12 border rounded-md "
        required
      />
      <input
        type="password"
        placeholder="    Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full h-12 border rounded-md"
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-500 text-white font-bold py-2 rounded-md hover:bg-green-600 flex justify-center items-center"
      >
        {isLoading ? (
          <LoaderCircle className="animate-spin h-5 w-5" />
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
};

export default LoginForm;
