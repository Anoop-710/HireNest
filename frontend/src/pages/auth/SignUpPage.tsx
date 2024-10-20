import { Link } from "react-router-dom";
import SignUpForm from "../../components/auth/SignUpForm";
import { motion } from "framer-motion";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          className="box"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0,
            ease: [0, 0.71, 0.2, 1.01],
          }}
        >
          <h1 className="text-center text-4xl font-bold leading-9 tracking-tight md:text-6xl bg-gradient-to-r from-green-500 to-blue-600  text-transparent bg-clip-text">
            HireNest
          </h1>
        </motion.div>

        <motion.div
          className="box"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.25,
            ease: [0, 0.71, 0.2, 1.01],
          }}
        >
          <h2 className="text-center text-md font-bold leading-9 tracking-tight text-gray-900">
            Connecting You to the Right Talent
          </h2>
        </motion.div>

        <motion.div
          className="box"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
          }}
        >
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md shadow-md">
            <div className="bg-white pb-8 px-4 shadow shadow-gray-400 sm:rounded-lg sm:px-10">
              <SignUpForm />

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white font-medium text-gray-800">
                      Already on HireNest?
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    to="/login"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-gray-200 hover:bg-gray-300"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
