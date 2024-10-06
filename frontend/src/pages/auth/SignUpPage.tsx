import { Link } from "react-router-dom";
import SignUpForm from "../../components/auth/SignUpForm";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-36 w-auto"
          src="https://res.cloudinary.com/dtjiwehvs/image/upload/c_fill,g_auto,h_250,w_970/b_rgb:000000,e_gradient_fade,y_-0.50/c_scale,co_rgb:ffffff,fl_relative,l_text:montserrat_25_style_light_align_center:HireNest,w_0.5,y_0.18/v1728145653/HireNest-logo_frknmc.jpg"
          alt="HireNest"
        />
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Connecting You to the Right Talent
        </h2>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md shadow-md">
          <div className="bg-white pb-8 px-4 shadow shadow-green-200 sm:rounded-lg sm:px-10">
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
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-bold text-white bg-green-500 hover:bg-green-600"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
