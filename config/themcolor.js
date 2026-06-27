   import { alpha,
  } from "@mui/material";
    const isDarkMode = document.documentElement.classList.contains("dark");
  export const greenTheme = {
    primary: "#059669",
    primaryLight: "#10b981",
    primaryDark: "#047857",
    secondary: "#34d399",
    accent: "#a7f3d0",
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    cardBg: isDarkMode ? alpha("#1e293b", 0.95) : alpha("#ffffff", 0.98),
  };