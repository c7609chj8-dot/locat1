/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 14px 40px rgba(31, 41, 55, 0.11)",
        card: "0 5px 18px rgba(31, 41, 55, 0.08)",
      },
      colors: {
        kakao: "#FEE500",
        ink: "#1D1D1F",
        coral: "#FF5D4A",
      },
    },
  },
  plugins: [],
};
