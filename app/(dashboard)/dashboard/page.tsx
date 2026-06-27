"use client";

/**
 * Dashboard Home Page
 * Main dashboard with stats and analytics
 */

import { Box, Typography, Grid, Card, CardContent, alpha, useMediaQuery, LinearProgress, Avatar, Chip, Button } from "@mui/material";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/styles/animations";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import TaskIcon from "@mui/icons-material/Task";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AddIcon from "@mui/icons-material/Add";
import InsightsIcon from "@mui/icons-material/Insights";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface DashboardPageProps {
  isDarkMode?: boolean;
}

// Green & White professional theme colors
const greenTheme = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#047857",
  secondary: "#34d399",
  accent: "#a7f3d0",
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
  isDarkMode?: boolean;
}

const StatCard = ({ title, value, icon, trend, color, isDarkMode = false }: StatCardProps) => {
  const themeColors = {
    background: isDarkMode ? alpha("#1e293b", 0.95) : alpha("#ffffff", 0.98),
    text: isDarkMode ? "#f1f5f9" : "#0f172a",
    textSecondary: isDarkMode ? "#94a3b8" : "#475569",
  };

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card
        sx={{
          background: themeColors.background,
          backdropFilter: "blur(12px)",
          border: `1px solid ${alpha(greenTheme.primary, 0.1)}`,
          borderRadius: 3,
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: alpha(greenTheme.primary, 0.3),
            boxShadow: `0 8px 32px ${alpha(greenTheme.primary, 0.15)}`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(color || greenTheme.primary, 0.1),
                color: color || greenTheme.primary,
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
            {trend && (
              <Chip
                icon={trend > 0 ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                label={`${Math.abs(trend)}%`}
                size="small"
                sx={{
                  bgcolor: trend > 0 ? alpha("#10b981", 0.1) : alpha("#ef4444", 0.1),
                  color: trend > 0 ? "#10b981" : "#ef4444",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: themeColors.textSecondary,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: themeColors.text,
              mt: 1,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            {value}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface ActivityItemProps {
  title: string;
  time: string;
  status: "completed" | "pending" | "in-progress";
  isDarkMode?: boolean;
}

const ActivityItem = ({ title, time, status, isDarkMode = false }: ActivityItemProps) => {
  const statusConfig = {
    completed: { icon: <CheckCircleIcon />, color: "#10b981", label: "Completed" },
    pending: { icon: <PendingIcon />, color: "#f59e0b", label: "Pending" },
    "in-progress": { icon: <ScheduleIcon />, color: "#3b82f6", label: "In Progress" },
  };

  const config = statusConfig[status];
  const themeColors = {
    text: isDarkMode ? "#f1f5f9" : "#0f172a",
    textSecondary: isDarkMode ? "#94a3b8" : "#475569",
    border: isDarkMode ? alpha("#334155", 0.5) : alpha("#cbd5e1", 0.5),
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 2,
        borderBottom: `1px solid ${themeColors.border}`,
        "&:last-child": { borderBottom: 0 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: alpha(config.color, 0.1), color: config.color, width: 40, height: 40 }}>
          {config.icon}
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 600, color: themeColors.text }}>{title}</Typography>
          <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>{time}</Typography>
        </Box>
      </Box>
      <Chip
        label={config.label}
        size="small"
        sx={{
          bgcolor: alpha(config.color, 0.1),
          color: config.color,
          fontWeight: 500,
        }}
      />
    </Box>
  );
};

export default function DashboardPage({ isDarkMode = false }: DashboardPageProps) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:960px)");

  const themeColors = {
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    cardBg: isDarkMode ? alpha("#1e293b", 0.95) : alpha("#ffffff", 0.98),
    text: isDarkMode ? "#f1f5f9" : "#0f172a",
    textSecondary: isDarkMode ? "#94a3b8" : "#475569",
    border: isDarkMode ? alpha("#334155", 0.5) : alpha("#cbd5e1", 0.5),
  };

  // Sample data - replace with real data from your API
  const stats = [
    { title: "Total Goals", value: "12", icon: <EmojiEventsIcon />, trend: 8, color: "#10b981" },
    { title: "Active Projects", value: "8", icon: <FolderSpecialIcon />, trend: -2, color: "#3b82f6" },
    { title: "Tasks Completed", value: "47", icon: <TaskIcon />, trend: 15, color: "#8b5cf6" },
    { title: "Current Streak", value: "7", icon: <WhatshotIcon />, trend: 12, color: "#f59e0b" },
  ];

  const recentActivities = [
    { title: "Completed UI Design for Dashboard", time: "2 hours ago", status: "completed" as const },
    { title: "Review pull request #42", time: "5 hours ago", status: "completed" as const },
    { title: "Team meeting about Q2 goals", time: "Yesterday", status: "completed" as const },
    { title: "Update documentation", time: "Yesterday", status: "pending" as const },
    { title: "Deploy to production", time: "2 days ago", status: "in-progress" as const },
  ];

  const weeklyProgress = [
    { day: "Mon", completed: 12, total: 15 },
    { day: "Tue", completed: 10, total: 12 },
    { day: "Wed", completed: 14, total: 16 },
    { day: "Thu", completed: 8, total: 10 },
    { day: "Fri", completed: 11, total: 14 },
    { day: "Sat", completed: 5, total: 8 },
    { day: "Sun", completed: 3, total: 5 },
  ];

  const completionRate = (stats[2].value as number) / 100 * 100;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Welcome Header */}
        <motion.div variants={itemVariants}>
          <Box
            sx={{
              mb: 4,
              p: { xs: 2, sm: 3, md: 4 },
              background: `linear-gradient(135deg, ${alpha(greenTheme.primary, 0.05)}, ${alpha(greenTheme.secondary, 0.02)})`,
              borderRadius: 4,
              border: `1px solid ${alpha(greenTheme.primary, 0.1)}`,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${themeColors.text}, ${greenTheme.primary})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                mb: 1,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
              }}
            >
              Welcome back, User! 👋
            </Typography>
            <Typography sx={{ color: themeColors.textSecondary, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              Here's what's happening with your productivity today.
            </Typography>
          </Box>
        </motion.div>

        {/* Stats Grid */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard {...stat} isDarkMode={isDarkMode} />
            </Grid>
          ))}
        </Grid>

        {/* Charts and Activity Section */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Weekly Progress Chart */}
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  background: themeColors.cardBg,
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${alpha(greenTheme.primary, 0.1)}`,
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text }}>
                        Weekly Progress
                      </Typography>
                      <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                        Tasks completed this week
                      </Typography>
                    </Box>
                    <Chip
                      icon={<TrendingUpIcon />}
                      label="+12% vs last week"
                      size="small"
                      sx={{
                        bgcolor: alpha("#10b981", 0.1),
                        color: "#10b981",
                      }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {weeklyProgress.map((day) => (
                      <Box key={day.day}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: themeColors.text }}>
                            {day.day}
                          </Typography>
                          <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                            {day.completed}/{day.total} tasks
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(day.completed / day.total) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(greenTheme.primary, 0.1),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, ${greenTheme.primary}, ${greenTheme.secondary})`,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  background: themeColors.cardBg,
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${alpha(greenTheme.primary, 0.1)}`,
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text }}>
                      Recent Activity
                    </Typography>
                    <AssignmentTurnedInIcon sx={{ color: greenTheme.primary }} />
                  </Box>
                  <Box>
                    {recentActivities.map((activity, index) => (
                      <ActivityItem key={index} {...activity} isDarkMode={isDarkMode} />
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<InsightsIcon />}
                    sx={{
                      mt: 2,
                      borderColor: alpha(greenTheme.primary, 0.3),
                      color: greenTheme.primary,
                      "&:hover": {
                        borderColor: greenTheme.primary,
                        bgcolor: alpha(greenTheme.primary, 0.05),
                      },
                    }}
                  >
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${alpha(greenTheme.primary, 0.05)}, ${alpha(greenTheme.secondary, 0.02)})`,
                  border: `1px solid ${alpha(greenTheme.primary, 0.1)}`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, mb: 2 }}>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    {["Create New Goal", "Add Task", "Start Journal", "Ask AI Assistant"].map((action) => (
                      <Grid item xs={12} sm={6} md={3} key={action}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AddIcon />}
                          sx={{
                            bgcolor: alpha(greenTheme.primary, 0.1),
                            color: greenTheme.primary,
                            textTransform: "none",
                            fontWeight: 600,
                            py: 1.5,
                            "&:hover": {
                              bgcolor: alpha(greenTheme.primary, 0.2),
                              transform: "translateY(-2px)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          {action}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Empty State (shown when no data) */}
        {stats[0].value === "0" && (
          <motion.div variants={itemVariants}>
            <Card sx={{ mt: 4, background: themeColors.cardBg }}>
              <CardContent sx={{ py: { xs: 6, sm: 8, md: 12 }, textAlign: "center" }}>
                <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "2rem", sm: "3rem" } }}>
                  🚀
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, mb: 1 }}>
                  Get Started with TaskFlow AI
                </Typography>
                <Typography sx={{ color: themeColors.textSecondary, mb: 3 }}>
                  Create your first goal to begin tracking your productivity journey!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: greenTheme.primary,
                    "&:hover": { bgcolor: greenTheme.primaryDark },
                  }}
                >
                  Create First Goal
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </Box>
    </motion.div>
  );
}