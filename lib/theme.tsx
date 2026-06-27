"use client";

import { createTheme, ThemeProvider, CssBaseline, PaletteMode } from "@mui/material";
import { useMemo, useState, useEffect, ReactNode } from "react";
import { themeColors } from "@/config/themeColors";

interface ThemeWrapperProps {
  children: ReactNode;
}

function getDesignTokens(mode: PaletteMode) {
  const colors = mode === "dark" ? themeColors.dark : themeColors.light;

  return {
    palette: {
      mode,
      primary: {
        main: themeColors.primary,
        light: themeColors.primaryLight,
        dark: themeColors.primaryDark,
        contrastText: "#ffffff",
      },
      secondary: {
        main: themeColors.secondary,
        light: themeColors.accent,
        contrastText: "#ffffff",
      },
      background: {
        default: colors.background,
        paper: colors.paper,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
      divider: colors.divider,
      success: {
        main: themeColors.success,
      },
      warning: {
        main: themeColors.warning,
      },
      error: {
        main: themeColors.error,
      },
      info: {
        main: themeColors.info,
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: "-0.02em" },
      h2: { fontWeight: 800, letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, letterSpacing: "-0.01em" },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 24px",
            fontSize: "0.9375rem",
            transition: "all 0.2s ease",
          },
          contained: {
            boxShadow: "0 4px 14px rgba(5, 150, 105, 0.3)",
            "&:hover": {
              boxShadow: "0 8px 20px rgba(5, 150, 105, 0.4)",
              transform: "translateY(-2px)",
            },
          },
          outlined: {
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
          variant: "outlined",
        },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              transition: "all 0.2s ease",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            boxShadow: mode === "dark"
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              : "0 10px 40px -10px rgba(5, 150, 105, 0.15)",
            border: `1px solid ${colors.border}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: colors.textSecondary,
            "&.Mui-focused": {
              color: themeColors.primary,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& fieldset": {
              borderColor: colors.border,
              borderWidth: 1.5,
            },
            "&:hover fieldset": {
              borderColor: themeColors.primary,
            },
            "&.Mui-focused fieldset": {
              borderColor: themeColors.primary,
              borderWidth: 2,
            },
          },
        },
      },
    },
  };
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const [mode, setMode] = useState<PaletteMode>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem("theme") as PaletteMode | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialMode = savedMode || (prefersDark ? "dark" : "light");
    setMode(initialMode);
    document.documentElement.classList.toggle("dark", initialMode === "dark");
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
    document.documentElement.classList.toggle("dark", newMode === "dark");
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // Provide toggle function via context if needed
  if (!mounted) {
    return (
      <ThemeProvider theme={createTheme(getDesignTokens("light"))}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export { themeColors, toggleTheme } from "@/config/themeColors";
export type { PaletteMode };