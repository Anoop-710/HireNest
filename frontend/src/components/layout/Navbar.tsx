import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../lib/axios";

const Navbar = () => {
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const queryClient = useQueryClient(); // refresh page on logout
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => axiosInstance.get("/notifications"),
    enabled: !!authUser, // Only fetch notifications if authUser is available
  });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => axiosInstance.get("/connections/requests"),
    enabled: !!authUser,
  });

  // logout

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      await axiosInstance.post("/auth/logout");
    },
  });

  const unreadNotifications = notifications?.data?.filter(
    (notification: { read: number }) => !notification.read
  ).length;

  const unreadConnectionRequests = connectionRequests?.data?.length;

  return <div>Navbar</div>;
};

export default Navbar;
