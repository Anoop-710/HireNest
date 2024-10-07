import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  console.log(authUser);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4">{children}</main>
    </div>
  );
};

export default Layout;
