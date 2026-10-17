/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        aura: {
          bg: "#0b0714",
          card: "#15101f",
          border: "#2a2140",
          pink: "#ff3d9a",
          violet: "#7c3aed",
          gold: "#ffcc4d",
        },
      },
      backgroundImage: {
        "aura-glow":
          "radial-gradient(circle at 20% 20%, rgba(124,58,237,0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,61,154,0.3), transparent 45%), radial-gradient(circle at 50% 100%, rgba(255,204,77,0.15), transparent 50%)",
      },
    },
  },
  plugins: [],
};
