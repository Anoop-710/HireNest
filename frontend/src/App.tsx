import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import NotificationsPage from "./pages/NotificationsPage";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { AxiosError } from "axios";
import NetworkPage from "./pages/ConnectionPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/my-profile");
        return res.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError?.response && axiosError.response.status === 401) {
          return null;
        }

        // Extract message from error response data
        const errorMessage =
          (axiosError.response?.data as { message?: string })?.message ||
          "Something went wrong, please try again";

        toast.error(errorMessage);
      }
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={authUser ? <Homepage /> : <Navigate to="/login" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />

          <Route
            path="/notifications"
            element={
              authUser ? <NotificationsPage /> : <Navigate to={"/login"} />
            }
          />
          <Route
            path="/network"
            element={authUser ? <NetworkPage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/post/:postId"
            element={authUser ? <PostPage /> : <Navigate to={"/login"} />}
          />

          <Route
            path="/profile/:username"
            element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />}
          />
        </Routes>

        <Toaster />
      </Layout>
    </>
  );
}

export default App;
