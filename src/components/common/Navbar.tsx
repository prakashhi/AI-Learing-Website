"use client";

/**
 * Navbar Component
 * Top navigation bar with user profile and settings
 * Featuring green theme, animations, and responsive design
 */

import { Box, Button, Avatar, Menu, MenuItem, Typography, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, alpha } from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

// Green theme configuration
const greenTheme = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
  secondary: "#34d399",
  accent: "#a7f3d0",
};

interface NavbarProps {
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

export default function Navbar({ isDarkMode = false, onThemeToggle }: NavbarProps) {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  // Dynamic theme colors based on dark mode
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    cardBg: isDarkMode ? alpha("#1e293b", 0.95) : alpha("#ffffff", 0.98),
    text: isDarkMode ? "#f1f5f9" : "#0f172a",
    textSecondary: isDarkMode ? "#94a3b8" : "#475569",
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut({ redirectTo: "/auth/login" });
  };

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Navigation items
  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
    { text: "Tasks", icon: <AssignmentIcon />, href: "/tasks" },
    { text: "Settings", icon: <SettingsIcon />, href: "/settings" },
  ];

  // Mobile drawer content
  const drawerContent = (
    <Box
      sx={{
        width: 280,
        height: "100%",
        bgcolor: themeColors.cardBg,
        backdropFilter: "blur(12px)",
        borderRight: `1px solid ${alpha(greenTheme.primary, 0.1)}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: `1px solid ${alpha(greenTheme.primary, 0.1)}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${greenTheme.primary}, ${greenTheme.secondary})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          TaskFlow AI
        </Typography>
        <IconButton onClick={handleMobileToggle}>
          <CloseIcon sx={{ color: themeColors.text }} />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            href={item.href}
            onClick={handleMobileToggle}
            sx={{
              py: 1.5,
              mx: 1,
              borderRadius: 2,
              "&:hover": {
                bgcolor: alpha(greenTheme.primary, 0.1),
                "& .MuiListItemIcon-root": {
                  color: greenTheme.primary,
                },
              },
            }}
          >
            <Box sx={{ mr: 2, color: themeColors.textSecondary }}>{item.icon}</Box>
            <ListItemText
              primary={item.text}
              sx={{
                "& .MuiTypography-root": {
                  fontWeight: 500,
                  color: themeColors.text,
                },
              }}
            />
          </ListItem>
        ))}
        <ListItem
          onClick={() => {
            handleLogout();
            handleMobileToggle();
          }}
          sx={{
            py: 1.5,
            mx: 1,
            borderRadius: 2,
            "&:hover": {
              bgcolor: alpha("#ef4444", 0.1),
              "& .MuiListItemIcon-root": {
                color: "#ef4444",
              },
            },
          }}
        >
          <Box sx={{ mr: 2, color: themeColors.textSecondary }}>
            <LogoutIcon />
          </Box>
          <ListItemText
            primary="Sign Out"
            sx={{
              "& .MuiTypography-root": {
                fontWeight: 500,
                color: themeColors.text,
              },
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          bgcolor: themeColors.cardBg,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${alpha(greenTheme.primary, 0.15)}`,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1.5, md: 2 },
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            borderBottomColor: alpha(greenTheme.primary, 0.3),
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "1400px",
            mx: "auto",
          }}
        >
          {/* Logo / Title with animation */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
              "&:hover .logo-gradient": {
                backgroundPosition: "200% center",
              },
            }}
            component={Link}
            href="/dashboard"
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${greenTheme.primary}, ${greenTheme.secondary})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05) rotate(5deg)",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 20,
                  color: "white",
                }}
              >
                TF
              </Typography>
            </Box>
            <Typography
              className="logo-gradient"
              variant="h5"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(90deg, ${greenTheme.primary}, ${greenTheme.secondary}, ${greenTheme.primary})`,
                backgroundSize: "200% auto",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                transition: "background-position 0.5s ease",
                display: { xs: "none", sm: "block" },
                letterSpacing: "-0.02em",
              }}
            >
              TaskFlow AI
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && session?.user && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: alpha(themeColors.background, 0.5),
                borderRadius: 4,
                p: 0.5,
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  href={item.href}
                  startIcon={item.icon}
                  sx={{
                    color: themeColors.textSecondary,
                    borderRadius: 3,
                    px: 2,
                    py: 0.75,
                    textTransform: "none",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(greenTheme.primary, 0.1),
                      color: greenTheme.primary,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* Right side - Theme Toggle & User Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            {/* Theme Toggle Button */}
            {onThemeToggle && (
              <IconButton
                onClick={onThemeToggle}
                sx={{
                  color: themeColors.textSecondary,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: greenTheme.primary,
                    transform: "rotate(15deg)",
                    bgcolor: alpha(greenTheme.primary, 0.1),
                  },
                }}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            )}

            {session?.user && (
              <>
                {/* Mobile Menu Button */}
                {isMobile && (
                  <IconButton
                    onClick={handleMobileToggle}
                    sx={{
                      color: themeColors.textSecondary,
                      "&:hover": {
                        color: greenTheme.primary,
                        bgcolor: alpha(greenTheme.primary, 0.1),
                      },
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}

                {/* User Avatar - Desktop & Mobile */}
                <Avatar
                  alt={session.user.name || "User"}
                  src={session.user.image || ""}
                  onClick={handleMenuOpen}
                  sx={{
                    cursor: "pointer",
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                    border: `2px solid ${alpha(greenTheme.primary, 0.3)}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      borderColor: greenTheme.primary,
                      boxShadow: `0 0 0 3px ${alpha(greenTheme.primary, 0.2)}`,
                    },
                  }}
                />
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      bgcolor: themeColors.cardBg,
                      backdropFilter: "blur(12px)",
                      borderRadius: 3,
                      border: `1px solid ${alpha(greenTheme.primary, 0.1)}`,
                      boxShadow: `0 8px 32px ${alpha(greenTheme.primary, 0.1)}`,
                      minWidth: 200,
                    },
                  }}
                >
                  <MenuItem disabled sx={{ flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: themeColors.text }}>
                      {session.user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                      {session.user.email}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      // Navigate to profile
                    }}
                    sx={{
                      gap: 1,
                      "&:hover": { bgcolor: alpha(greenTheme.primary, 0.1) },
                    }}
                  >
                    <SettingsIcon fontSize="small" sx={{ color: greenTheme.primary }} />
                    <Typography variant="body2" sx={{ color: themeColors.text }}>
                      Profile Settings
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      gap: 1,
                      "&:hover": { bgcolor: alpha("#ef4444", 0.1) },
                    }}
                  >
                    <LogoutIcon fontSize="small" sx={{ color: "#ef4444" }} />
                    <Typography variant="body2" sx={{ color: "#ef4444" }}>
                      Sign Out
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleMobileToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            bgcolor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}