import daisyui from "daisyui";
import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui, tailwindcssAnimate],
  daisyui: {
    themes: [
      {
        linkedin: {
          primary: "#0A66C2", // LinkedIn Blue
          secondary: "#FFFFFF", // White
          accent: "#7FC15E", // LinkedIn Green (for accents)
          neutral: "#000000", // Black (for text)
          ghost: "#F3F2EF", // Light Gray (background)
          info: "#5E5E5E", // Dark Gray (for secondary text)
          success: "#057642", // Dark Green (for success messages)
          warning: "#F5C75D", // Yellow (for warnings)
          error: "#CC1016", // Red (for errors)
        },
      },
    ],
  },
};
