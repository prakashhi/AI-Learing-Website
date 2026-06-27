"use client";

/**
 * Sidebar Component
 * Left navigation sidebar with menu items, animations, and theme toggle
 */

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  alpha,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TaskIcon from "@mui/icons-material/Task";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import JournalIcon from "@mui/icons-material/Javascript";
import TimelineIcon from "@mui/icons-material/Timeline";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

// Green theme configuration
const greenTheme = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
  secondary: "#34d399",
  accent: "#a7f3d0",
};

interface SidebarProps {
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  isCollapsed?: boolean;
  onCollapseToggle?: () => void;
}

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Goals", href: "/dashboard/goals", icon: EmojiEventsIcon },
  { label: "Tasks", href: "/dashboard/tasks", icon: TaskIcon },
  { label: "Resources", href: "/dashboard/resources", icon: MenuBookIcon },
  { label: "Journal", href: "/dashboard/journal", icon: JournalIcon },
  { label: "Activity", href: "/dashboard/activity", icon: TimelineIcon },
  { label: "AI Assistant", href: "/dashboard/ai", icon: SmartToyIcon },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: SettingsIcon },
  { label: "Help", href: "/help", icon: HelpOutlineIcon },
];

export default function Sidebar({ 
  isDarkMode = false, 
  onThemeToggle,
  isCollapsed = false,
  onCollapseToggle 
}: SidebarProps) {
  const pathname = usePathname();

  // Dynamic theme colors based on dark mode
  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    sidebarBg: isDarkMode ? alpha("#1e293b", 0.98) : alpha("#ffffff", 0.98),
    border: isDarkMode ? alpha("#334155", 0.5) : alpha("#cbd5e1", 0.5),
    text: isDarkMode ? "#f1f5f9" : "#0f172a",
    textSecondary: isDarkMode ? "#94a3b8" : "#475569",
    hoverBg: isDarkMode ? alpha("#059669", 0.15) : alpha("#059669", 0.08),
    activeBg: isDarkMode ? alpha("#059669", 0.25) : alpha("#059669", 0.12),
  };

  // Animation variants
  const sidebarVariants = {
    expanded: { width: 280, transition: { duration: 0.3, ease: "easeInOut" } },
    collapsed: { width: 80, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const menuItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
    hover: { 
      x: 5,
      transition: { duration: 0.2 },
      backgroundColor: themeColors.hoverBg,
    },
  };

  const logoVariants = {
    expanded: { 
      scale: 1,
      transition: { duration: 0.3 }
    },
    collapsed: { 
      scale: 0.8,
      transition: { duration: 0.3 }
    },
  };

  const textVariants = {
    expanded: { opacity: 1, display: "inline-block", transition: { duration: 0.2, delay: 0.1 } },
    collapsed: { opacity: 0, display: "none", transition: { duration: 0.1 } },
  };

  return (
    <motion.div
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: themeColors.sidebarBg,
          backdropFilter: "blur(12px)",
          borderRight: `1px solid ${themeColors.border}`,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          transition: "background-color 0.3s ease",
          overflowX: "hidden",
        }}
      >
        {/* Logo Section */}
        <Box
          sx={{
            p: isCollapsed ? 2 : 3,
            pb: isCollapsed ? 2 : 2,
            borderBottom: `1px solid ${themeColors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            position: "relative",
          }}
        >
          <motion.div
            variants={logoVariants}
            animate={isCollapsed ? "collapsed" : "expanded"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${greenTheme.primary}, ${greenTheme.secondary})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "rotate(5deg) scale(1.05)",
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
            <motion.div variants={textVariants}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${greenTheme.primary}, ${greenTheme.secondary})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                TaskFlow AI
              </Typography>
            </motion.div>
          </motion.div>

          {/* Collapse Toggle Button */}
          <Tooltip title={isCollapsed ? "Expand" : "Collapse"} placement="right">
            <IconButton
              onClick={onCollapseToggle}
              size="small"
              sx={{
                color: themeColors.textSecondary,
                transition: "all 0.3s ease",
                "&:hover": {
                  color: greenTheme.primary,
                  transform: "scale(1.1)",
                  bgcolor: alpha(greenTheme.primary, 0.1),
                },
                ...(isCollapsed && {
                  position: "absolute",
                  right: -12,
                  top: 20,
                  bgcolor: themeColors.sidebarBg,
                  border: `1px solid ${themeColors.border}`,
                  "&:hover": {
                    bgcolor: alpha(greenTheme.primary, 0.1),
                  },
                }),
              }}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Main Navigation */}
        <Box sx={{ flex: 1, py: 2, overflowY: "auto" }}>
          <List disablePadding>
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <motion.div
                  key={item.href}
                  custom={index}
                  initial="initial"
                  animate="animate"
                  variants={menuItemVariants}
                  whileHover="hover"
                >
                  <ListItem disablePadding sx={{ mb: 1, px: isCollapsed ? 1 : 2 }}>
                    <Link href={item.href} style={{ width: "100%" }}>
                      <Tooltip title={isCollapsed ? item.label : ""} placement="right">
                        <ListItemButton
                          selected={isActive}
                          sx={{
                            borderRadius: 2,
                            justifyContent: isCollapsed ? "center" : "flex-start",
                            px: isCollapsed ? 1 : 2,
                            py: 1,
                            transition: "all 0.2s ease",
                            backgroundColor: isActive ? themeColors.activeBg : "transparent",
                            "&:hover": {
                              backgroundColor: themeColors.hoverBg,
                              transform: "translateX(4px)",
                            },
                            "&.Mui-selected": {
                              backgroundColor: themeColors.activeBg,
                              "&:hover": {
                                backgroundColor: themeColors.activeBg,
                              },
                              "& .MuiListItemIcon-root": {
                                color: greenTheme.primary,
                              },
                              "& .MuiListItemText-primary": {
                                color: greenTheme.primary,
                                fontWeight: 600,
                              },
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: isCollapsed ? "auto" : 40,
                              justifyContent: "center",
                              color: isActive ? greenTheme.primary : themeColors.textSecondary,
                              transition: "color 0.2s ease",
                            }}
                          >
                            <Icon />
                          </ListItemIcon>
                          <motion.div variants={textVariants}>
                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{
                                fontSize: "0.875rem",
                                fontWeight: isActive ? 600 : 500,
                                sx: {
                                  color: isActive ? greenTheme.primary : themeColors.text,
                                  whiteSpace: "nowrap",
                                },
                              }}
                            />
                          </motion.div>
                        </ListItemButton>
                      </Tooltip>
                    </Link>
                  </ListItem>
                </motion.div>
              );
            })}
          </List>
        </Box>

        {/* Bottom Section */}
        <Box sx={{ mt: "auto" }}>
          <Divider sx={{ borderColor: themeColors.border, my: 1 }} />
          
          {/* Bottom Menu Items */}
          <List disablePadding sx={{ mb: 1 }}>
            {bottomItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial="initial"
                  animate="animate"
                  variants={menuItemVariants}
                  custom={menuItems.length + index}
                >
                  <ListItem disablePadding sx={{ px: isCollapsed ? 1 : 2 }}>
                    <Link href={item.href} style={{ width: "100%" }}>
                      <Tooltip title={isCollapsed ? item.label : ""} placement="right">
                        <ListItemButton
                          sx={{
                            borderRadius: 2,
                            justifyContent: isCollapsed ? "center" : "flex-start",
                            px: isCollapsed ? 1 : 2,
                            py: 1,
                            "&:hover": {
                              backgroundColor: themeColors.hoverBg,
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: isCollapsed ? "auto" : 40,
                              justifyContent: "center",
                              color: themeColors.textSecondary,
                            }}
                          >
                            <Icon />
                          </ListItemIcon>
                          <motion.div variants={textVariants}>
                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{
                                fontSize: "0.875rem",
                                sx: { color: themeColors.text, whiteSpace: "nowrap" },
                              }}
                            />
                          </motion.div>
                        </ListItemButton>
                      </Tooltip>
                    </Link>
                  </ListItem>
                </motion.div>
              );
            })}
          </List>

          {/* Theme Toggle Button */}
          <ListItem disablePadding sx={{ px: isCollapsed ? 1 : 2, mb: 2 }}>
            <Tooltip title={isCollapsed ? (isDarkMode ? "Light Mode" : "Dark Mode") : ""} placement="right">
              <ListItemButton
                onClick={onThemeToggle}
                sx={{
                  borderRadius: 2,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  px: isCollapsed ? 1 : 2,
                  py: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: themeColors.hoverBg,
                    transform: "translateX(4px)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isCollapsed ? "auto" : 40,
                    justifyContent: "center",
                  }}
                >
                  {isDarkMode ? (
                    <LightModeOutlinedIcon sx={{ color: "#fbbf24" }} />
                  ) : (
                    <DarkModeOutlinedIcon sx={{ color: greenTheme.primary }} />
                  )}
                </ListItemIcon>
                <motion.div variants={textVariants}>
                  <ListItemText
                    primary={isDarkMode ? "Light Mode" : "Dark Mode"}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      sx: { color: themeColors.text, whiteSpace: "nowrap" },
                    }}
                  />
                </motion.div>
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* Logout Button */}
          <ListItem disablePadding sx={{ px: isCollapsed ? 1 : 2, mb: 2 }}>
            <Tooltip title={isCollapsed ? "Logout" : ""} placement="right">
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  px: isCollapsed ? 1 : 2,
                  py: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: alpha("#ef4444", 0.1),
                    transform: "translateX(4px)",
                    "& .MuiListItemIcon-root": {
                      color: "#ef4444",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isCollapsed ? "auto" : 40,
                    justifyContent: "center",
                    color: themeColors.textSecondary,
                    transition: "color 0.2s ease",
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <motion.div variants={textVariants}>
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      sx: { color: themeColors.text, whiteSpace: "nowrap" },
                    }}
                  />
                </motion.div>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </Box>

        {/* Footer */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  pt: 2,
                  pb: 2,
                  borderTop: `1px solid ${themeColors.border}`,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: themeColors.textSecondary,
                    fontSize: "0.7rem",
                  }}
                >
                  © 2026 TaskFlow AI
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
}