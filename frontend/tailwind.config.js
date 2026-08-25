/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 深海军蓝系 - 全局深色背景
        navy: {
          50: "#f0f4fa",
          100: "#d9e2f3",
          200: "#b6c7e6",
          300: "#85a3d2",
          400: "#5a7db8",
          500: "#3d5fa0",
          600: "#2f4b84",
          700: "#263c6b",
          800: "#1f3258",
          900: "#1a2332",
        },
        surface: {
          DEFAULT: "#1a2332",
          deep: "#131a26",
        },
        // 米白文字
        ivory: {
          DEFAULT: "#f5f2ea",
        },
        // 主色：低饱和金色
        primary: {
          50: "#fdf8ef",
          100: "#f7ecd7",
          200: "#eed9ae",
          300: "#e6cd96",
          400: "#d8b97e",
          500: "#c9a86a",
          600: "#b8935a",
          700: "#9d7f4c",
          800: "#82683e",
          900: "#6a5434",
        },
        // 柔和青绿点缀
        accent: {
          DEFAULT: "#7fc3b8",
          light: "#9fd8cf",
        },
        window: {
          frame: "#c9a86a",
          shadow: "#1a2332",
          glass: "rgba(255,255,255,0.05)",
        },
      },
      boxShadow: {
        window: "0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(201, 168, 106, 0.25) inset",
        "window-deep": "0 35px 60px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        glass: "inset 0 1px 1px rgba(255,255,255,0.08), inset 0 -1px 1px rgba(0,0,0,0.1)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "thinking-bubble": "thinkingBubble 2s ease-in-out infinite",
        "cloud-drift": "cloudDrift 20s linear infinite",
        sparkle: "sparkle 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        thinkingBubble: {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.95)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        cloudDrift: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100vw)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
      },
    },
  },
  plugins: [],
};