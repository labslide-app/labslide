/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 天蓝色系 - 天空、窗户玻璃
        sky: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // 深蓝色系 - 理工科、实验
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
          900: "#1a2a4a",
        },
        // 窗户边框 - 暖白木质感
        window: {
          frame: "#f8fafc",
          shadow: "#cbd5e1",
          glass: "rgba(255,255,255,0.25)",
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      boxShadow: {
        window: "0 25px 50px -12px rgba(14, 165, 233, 0.25), 0 0 0 1px rgba(186, 230, 253, 0.5) inset",
        "window-deep": "0 35px 60px -15px rgba(12, 74, 110, 0.3), inset 0 1px 0 rgba(255,255,255,0.6)",
        glass: "inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 1px rgba(0,0,0,0.05)",
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
