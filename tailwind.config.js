/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#D4AF37", // Gold
        "brand-secondary": "#F0E68C", // Light Gold
        "brand-dark": "#1A1A1A", // Almost Black
        "brand-light": "#F5F5F5", // Off-White
        "brand-gray": "#333333", // Dark Gray
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
