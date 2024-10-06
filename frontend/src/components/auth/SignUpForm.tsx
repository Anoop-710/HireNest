import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../../lib/axios";
import { toast } from "react-hot-toast";
import { LoaderCircle } from "lucide-react";

interface CustomError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface SignUpFormData {
  name: string;
  email: string;
  username: string;
  password: string;
}

const SignUpForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: signUpMutation, status } = useMutation<
    unknown,
    Error,
    SignUpFormData
  >({
    mutationFn: async (data: SignUpFormData) => {
      const res = await axiosInstance.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully");
    },
    onError: (error: unknown) => {
      let errorMsg = "Something went wrong, please try again";
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

  const isLoading = status === "pending";

  const handleSignUp = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    signUpMutation({
      name,
      email,
      username,
      password,
    });
  };
  return (
    <form onSubmit={handleSignUp} className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign up</h2>
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full   
 border rounded-md px-4 py-2"
          placeholder="Enter your name"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md   
 px-4 py-2"
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border   
 rounded-md px-4 py-2"
          placeholder="Enter your username"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border   
 rounded-md px-4 py-2"
          placeholder="Enter your password"
          required
        />
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="terms"
          className="h-4 w-4 border-gray-300 rounded text-green-600"
          required
        />
        <label htmlFor="terms" className="ml-2 text-gray-700">
          I agree to the terms and conditions
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-500 text-white font-bold py-2 rounded-md hover:bg-green-600 flex justify-center items-center"
      >
        {isLoading ? (
          <LoaderCircle className="animate-spin h-5 w-5" />
        ) : (
          "Sign up"
        )}
      </button>
    </form>
  );
};

export default SignUpForm;
