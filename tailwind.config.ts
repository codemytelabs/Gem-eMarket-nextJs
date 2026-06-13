import { colors } from "@/lib/theme/colors";

module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.primary.main,
          light: colors.primary.light,
          dark: colors.primary.dark,
        },
        secondary: {
          DEFAULT: colors.secondary.main,
          light: colors.secondary.light,
          dark: colors.secondary.dark,
        },
        neutral: {
          background: colors.neutral.background,
          surface: colors.neutral.surface,
          border: colors.neutral.border,
          text: colors.neutral.text,
          lightText: colors.neutral.lightText,
        },
        premium: colors.accent.premium,
        features: colors.accent.features,
      },
    },
  },
  plugins: [],
};
