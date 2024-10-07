import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../lib/axios";
import { Home, Users, Bell, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "../../../lib/utils/utils";
type User = {
  username: string;
};
const Navbar = () => {
  const { data: authUser } = useQuery<User | null>({
    queryKey: ["authUser"],
  });

  const queryClient = useQueryClient();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const unreadNotificationCount = notifications?.data?.filter(
    (notification: { read: number }) => !notification.read
  ).length;

  const unreadConnectionRequestsCount = connectionRequests?.data?.length;

  const links = [
    { name: "home", icon: <Home />, link: "/" },
    {
      name: "My Network",
      icon: <Users />,
      link: "/network",
      badge: unreadConnectionRequestsCount,
    },
    {
      name: "Notifications",
      icon: <Bell />,
      link: "/notifications",
      badge: unreadNotificationCount,
    },
    {
      name: "My Profile",
      icon: <User />,
      link: `/profile/${authUser?.username}`,
    },
    { name: "Logout", icon: <LogOut />, link: "/", onClick: logout },
  ];
  const [currentLink, setCurrentLink] = useState(0);

  return (
    <nav className="bg-secondary shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img
                className="h-10 rounded md:h-12"
                src="https://res.cloudinary.com/dtjiwehvs/image/upload/c_thumb,w_200,g_face/v1728145653/HireNest-logo_frknmc.jpg"
                alt="HireNest Logo"
              />
            </Link>
            <h1 className="text-md md:text-xl font-bold ">HireNest</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            {authUser ? (
              <>
                <div className="relative w-full h-full center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    className="absolute"
                  >
                    <defs>
                      <filter id="goo">
                        <feGaussianBlur
                          in="SourceGraphic"
                          stdDeviation="12"
                          result="blur"
                        />
                        <feColorMatrix
                          in="blur"
                          mode="matrix"
                          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
                          result="goo"
                        />
                        <feComposite
                          in="SourceGraphic"
                          in2="goo"
                          operator="atop"
                        />
                      </filter>
                    </defs>
                  </svg>
                  <motion.ul
                    style={{
                      filter: "url(#goo)",
                    }}
                    layout
                    className="h-14 flex"
                  >
                    {links.map((link, index) => (
                      <motion.li
                        key={index}
                        onClick={() => {
                          setCurrentLink(index);
                          if (link.onClick) link.onClick();
                        }}
                        animate={{
                          x: [20, -20],
                        }}
                        className={cn(
                          "bg-black text-white px-7 h-full items-center mx-0 transition-all duration-500 cursor-pointer justify-center flex capitalize font-bold",
                          currentLink === index && "bg-blue-500 mx-6"
                        )}
                      >
                        <Link
                          to={link.link}
                          className="relative flex items-center"
                        >
                          <span className="mr-2">{link.icon}</span>
                          <span className="hidden lg:inline">{link.name}</span>
                          {link.badge > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full size-3 flex items-center justify-center">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </>
            ) : (
              <>
                <motion.div
                  className="box"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link
                    to="/login"
                    className="btn hover:bg-gray-300 hover:text-black"
                  >
                    Sign In
                  </Link>
                </motion.div>

                <motion.div
                  className="box"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link
                    to="/signup"
                    className="btn bg-green-500 text-white  hover:bg-green-600 "
                  >
                    Join now
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
