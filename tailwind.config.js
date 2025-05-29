import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: "var(--font-inter)",
        omnes: "var(--font-omnes)",
        sf: "var(--font-sf-pro)",
        youth: "var(--font-youth)",
      },

      backgroundColor: {
        "theme-blue": "#000099",
        "theme-blue-2": "#146EF5",
        "theme-skyBlue": "#DDEEFC",
        "theme-darkBlue": "#000099",
        "theme-gray": "#F0F0F0",
      },
      colors: {
        "theme-black-2": "#202125",
        "theme-blue": "#000099",
        "theme-blue-2": "#146EF5",
        "theme-skyBlue": "#DDEEFC",
        "theme-darkBlue": "#000099",
        "theme-gray": "#F0F0F0",
        "theme-gray-2": "#747472",
        "theme-gray-3": "#494E57",
        "theme-psGray": "#707481",
      },
      boxShadow: {
        "theme-shadow": "0px 0px 6px 0px #00000029",
      },
      screens: {
        extraSmall: "375px",
        small: "425px",
        tablet: "841px",
        smallDesktop: "1200px",
        desktop: "1430px",
        largeDesktop: "1600px",
        extraLargeDesktop: "1920px",
        ultraLargeDesktop: "2100px",
      },
      height: {
        "screen-minus-5vh": "calc(100vh - 5vh)",
        "screen-minus-9vh": "calc(100vh - 9vh)",
        "screen-minus-12vh": "calc(100vh - 12vh)",
        "screen-minus-18vh": "calc(100vh - 18vh)",
        "screen-minus-10vh": "calc(100vh - 20vh)",
        "screen-minus-30vh": "calc(100vh - 30vh)",
        "screen-minus-40vh": "calc(100vh - 40vh)",
        "screen-minus-50vh": "calc(100vh - 50vh)",
        "screen-minus-53vh": "calc(100vh - 53vh)",
        "screen-minus-60vh": "calc(100vh - 60vh)",
      },

    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
