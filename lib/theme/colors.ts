export const colors = {
  primary: {
    main: "#1F4E8C", // Royal Blue
    light: "#4A7FC2",
    dark: "#173D70",
  },
  secondary: {
    main: "#9CA8B8", // Platinum
    light: "#C2CBD6",
    dark: "#7E8CA0",
  },
  neutral: {
    background: "#F3F5F8",
    surface: "#FFFFFF",
    border: "#E1E6ED",
    text: "#1F2937",
    lightText: "#6B7785",
  },
  accent: {
    premium: "#9B2242", // Ruby
    features: "#1F7A5C", // Emerald
  },
};

export type ColorTheme = typeof colors;
export type ColorKey = keyof typeof colors;
