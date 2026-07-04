/**
 * Material-UI Theme Configuration
 * Apple Design System colors and settings
 */

import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#007AFF", // Apple Blue
      light: "#E8F4FF",
      dark: "#0051D5",
    },
    success: {
      main: "#34C759", // Apple Green
      light: "#E8F9EE",
    },
    warning: {
      main: "#FF9500", // Apple Orange
      light: "#FFF3E0",
    },
    error: {
      main: "#FF3B30", // Apple Red
      light: "#FFECEB",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#000000",
      secondary: "#424245",
    },
    divider: "#E5E5EA",
    grey: {
      50: "#F5F5F7",
      100: "#E5E5EA",
      300: "#BFBFBF",
      500: "#86868B",
      700: "#424245",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "40px",
      fontWeight: 700,
      lineHeight: "48px",
      letterSpacing: "-0.4px",
    },
    h2: {
      fontSize: "28px",
      fontWeight: 600,
      lineHeight: "34px",
    },
    h3: {
      fontSize: "22px",
      fontWeight: 600,
      lineHeight: "28px",
    },
    h4: {
      fontSize: "18px",
      fontWeight: 600,
    },
    h5: {
      fontSize: "16px",
      fontWeight: 600,
    },
    h6: {
      fontSize: "14px",
      fontWeight: 600,
    },
    body1: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
      letterSpacing: "0.5px",
    },
    body2: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
    },
    caption: {
      fontSize: "12px",
      fontWeight: 500,
      lineHeight: "16px",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: "16px",
          padding: "12px 24px",
          height: "44px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
        },
        contained: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
          border: "1px solid #E5E5EA",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "6px",
            "& fieldset": {
              borderColor: "#BFBFBF",
            },
            "&:hover fieldset": {
              borderColor: "#86868B",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#007AFF",
              boxShadow: "0 0 0 3px rgba(0, 122, 255, 0.1)",
            },
          },
          "& .MuiOutlinedInput-input": {
            fontSize: "16px",
            padding: "12px 16px",
            height: "44px",
            boxSizing: "border-box",
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        backdrop: {
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#007AFF",
      light: "#E8F4FF",
      dark: "#0051D5",
    },
    success: {
      main: "#34C759",
      light: "#E8F9EE",
    },
    warning: {
      main: "#FF9500",
      light: "#FFF3E0",
    },
    error: {
      main: "#FF3B30",
      light: "#FFECEB",
    },
    background: {
      default: "#000000",
      paper: "#1D1D1F",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#A1A1A6",
    },
    divider: "#424245",
    grey: {
      50: "#1D1D1F",
      100: "#424245",
      300: "#86868B",
      500: "#BFBFBF",
      700: "#E5E5EA",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "40px",
      fontWeight: 700,
      lineHeight: "48px",
      letterSpacing: "-0.4px",
    },
    h2: {
      fontSize: "28px",
      fontWeight: 600,
      lineHeight: "34px",
    },
    h3: {
      fontSize: "22px",
      fontWeight: 600,
      lineHeight: "28px",
    },
    body1: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
      letterSpacing: "0.5px",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: "16px",
          padding: "12px 24px",
          height: "44px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          backgroundColor: "#1D1D1F",
          border: "none",
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default lightTheme;
