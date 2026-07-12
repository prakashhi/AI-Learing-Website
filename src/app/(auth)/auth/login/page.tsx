"use client";

/**
 * Login Page
 * User authentication with Google OAuth and email/password
 * Features: Green/White professional theme, advanced animations, modern design
 */

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Material-UI Icons
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckBoxOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {greenTheme} from '../../../../config/themcolor'

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

const cardVariants = {
  initial: { y: 50, opacity: 0, scale: 0.98 },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.21, 1.11, 0.22, 1],
      delay: 0.1,
    },
  },
};

const floatingLeafVariants = {
  animate: (i: number) => ({
    y: [0, -30 - i * 8, 0],
    x: [0, 15 + i * 5, 0],
    rotate: [0, 10 + i * 3, 0],
    transition: {
      duration: 5 + i,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.4,
    },
  }),
};

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    signIn("google", { redirectTo: "/dashboard" });
  };


  return (
    <motion.div
      // variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
          : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf9 100%)",
      }}
    >
      {/* Animated Background Elements - Green/White Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, ${alpha("#059669", 0.2)} 0%, ${alpha(
              "#10b981",
              0.05
            )} 70%)`,
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full"
          style={{
            background: `radial-gradient(circle, ${alpha("#34d399", 0.15)} 0%, ${alpha(
              "#a7f3d0",
              0.05
            )} 70%)`,
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${alpha("#059669", 0.08)} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating decorative elements - Leaves/Green accents */}
        {[
          { Icon: TaskAltIcon, x: "8%", y: "15%", size: 24 },
          { Icon: AutoAwesomeIcon, x: "88%", y: "20%", size: 20 },
          { Icon: CheckCircleOutlineIcon, x: "12%", y: "80%", size: 28 },
          { Icon: AutoAwesomeIcon, x: "92%", y: "75%", size: 22 },
          { Icon: TaskAltIcon, x: "5%", y: "50%", size: 18 },
          { Icon: CheckCircleOutlineIcon, x: "95%", y: "45%", size: 26 },
        ].map((item, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={floatingLeafVariants}
            animate="animate"
            className="absolute hidden lg:block"
            style={{ left: item.x, top: item.y }}
          >
            <div
              className="p-2 rounded-2xl backdrop-blur-sm"
              style={{
                background: isDarkMode ? alpha("#ffffff", 0.05) : alpha("#ffffff", 0.6),
                border: `1px solid ${alpha(greenTheme.primary, 0.2)}`,
              }}
            >
              <item.Icon
                style={{
                  fontSize: item.size,
                  color: greenTheme.primary,
                  opacity: 0.7,
                }}
              />
            </div>
          </motion.div>
        ))}

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(${greenTheme.primary} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <motion.div
        variants={cardVariants}
        className="w-full max-w-md relative z-10"
      >
        {/* Theme Toggle Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute -top-14 right-0"
        >
          <IconButton
            onClick={toggleTheme}
            sx={{
              borderRadius: "14px",
              padding: "10px",
              background: isDarkMode
                ? alpha("#1e293b", 0.9)
                : alpha("#ffffff", 0.9),
              backdropFilter: "blur(12px)",
              border: `1px solid ${alpha(greenTheme.primary, 0.2)}`,
              transition: "all 0.3s ease",
              "&:hover": {
                background: isDarkMode ? "#334155" : "#ffffff",
                transform: "scale(1.05)",
              },
            }}
          >
            {isDarkMode ? (
              <LightModeOutlinedIcon sx={{ color: "#fbbf24" }} />
            ) : (
              <DarkModeOutlinedIcon sx={{ color: greenTheme.primary }} />
            )}
          </IconButton>
        </motion.div>

        <Card
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: "32px",
            background: isDarkMode
              ? alpha("#1e293b", 0.92)
              : alpha("#ffffff", 0.95),
            backdropFilter: "blur(16px)",
            border: `1px solid ${alpha(greenTheme.primary, 0.15)}`,
            boxShadow: isDarkMode
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              : "0 25px 50px -12px rgba(5, 150, 105, 0.15)",
            transition: "all 0.3s ease",
          }}
        >
          {/* Animated Brand Logo */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          >
            <div className="relative">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${greenTheme.primary}, ${greenTheme.secondary})`,
                }}
              >
                <TaskAltIcon sx={{ fontSize: 32, color: "#ffffff" }} />
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ border: `2px solid ${alpha(greenTheme.primary, 0.4)}` }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Header */}
          <Box className="text-center mb-8">
            <motion.div {...fadeInUp}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  mb: 1,
                  background: `linear-gradient(135deg, ${greenTheme.primary}, ${greenTheme.secondary})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                TaskFlow AI
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: isDarkMode ? "#94a3b8" : "#475569",
                }}
              >
                Your personal productivity assistant
              </Typography>
            </motion.div>
          </Box>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-6 overflow-hidden"
              >
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: "16px",
                    background: isDarkMode ? alpha("#7f1d1d", 0.5) : alpha("#fee2e2", 0.8),
                    border: `1px solid ${isDarkMode ? "#991b1b" : "#fecaca"}`,
                  }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleEmailLogin}>
            <motion.div variants={staggerContainer} animate="animate" className="space-y-5">
              {/* Social Login Buttons */}
              <motion.div variants={fadeInUp} className="space-y-3 grid gap-3">
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  startIcon={loading ? null : <GoogleIcon />}
                  sx={{
                    borderRadius: "16px",
                    height: 48,
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: isDarkMode ? "#475569" : "#e2e8f0",
                    color: isDarkMode ? "#e2e8f0" : "#1e293b",
                    background: isDarkMode ? alpha("#1e293b", 0.5) : alpha("#ffffff", 0.8),
                    "&:hover": {
                      borderColor: greenTheme.primary,
                      background: isDarkMode ? alpha("#334155", 0.8) : alpha(greenTheme.accent, 0.3),
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                    </motion.div>
                  ) : (
                    "Continue with Google"
                  )}
                </Button>

           
              </motion.div>

              {/* Divider */}
              <motion.div variants={fadeInUp}>
                <Divider
                  sx={{
                    my: 2,
                    "&::before, &::after": {
                      borderColor: isDarkMode ? "#334155" : "#e2e8f0",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: isDarkMode ? "#64748b" : "#94a3b8",
                    }}
                  >
                    OR CONTINUE WITH EMAIL
                  </Typography>
                </Divider>
              </motion.div>

              {/* Email Input */}
              <motion.div variants={fadeInUp}>
                <TextField
                  fullWidth
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlinedIcon
                          sx={{ color: isDarkMode ? "#64748b" : "#94a3b8" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      transition: "all 0.2s ease",
                      background: isDarkMode ? alpha("#1e293b", 0.6) : alpha("#f8fafc", 0.8),
                      "&:hover": {
                        background: isDarkMode ? alpha("#334155", 0.8) : alpha("#ffffff", 0.9),
                      },
                      "&.Mui-focused": {
                        background: isDarkMode ? alpha("#1e293b", 0.9) : "#ffffff",
                        "& fieldset": {
                          borderColor: greenTheme.primary,
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode ? "#94a3b8" : "#64748b",
                      "&.Mui-focused": {
                        color: greenTheme.primary,
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Password Input */}
              <motion.div variants={fadeInUp}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{ color: isDarkMode ? "#64748b" : "#94a3b8" }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon
                              sx={{ color: isDarkMode ? "#64748b" : "#94a3b8" }}
                            />
                          ) : (
                            <VisibilityOutlinedIcon
                              sx={{ color: isDarkMode ? "#64748b" : "#94a3b8" }}
                            />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      transition: "all 0.2s ease",
                      background: isDarkMode ? alpha("#1e293b", 0.6) : alpha("#f8fafc", 0.8),
                      "&:hover": {
                        background: isDarkMode ? alpha("#334155", 0.8) : alpha("#ffffff", 0.9),
                      },
                      "&.Mui-focused": {
                        background: isDarkMode ? alpha("#1e293b", 0.9) : "#ffffff",
                        "& fieldset": {
                          borderColor: greenTheme.primary,
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkMode ? "#94a3b8" : "#64748b",
                      "&.Mui-focused": {
                        color: greenTheme.primary,
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Forgot Password Link */}
              <motion.div variants={fadeInUp} className="text-right">
                <Link
                  href="/auth/forgot-password"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: greenTheme.primary,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = greenTheme.primaryDark;
                    e.currentTarget.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = greenTheme.primary;
                    e.currentTarget.style.textDecoration = "none";
                  }}
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={fadeInUp} className="pt-2">
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  endIcon={!loading && <ArrowForwardIcon />}
                  sx={{
                    borderRadius: "16px",
                    height: 52,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                    background: `linear-gradient(135deg, ${greenTheme.primary}, ${greenTheme.secondary})`,
                    boxShadow: `0 4px 14px ${alpha(greenTheme.primary, 0.4)}`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${greenTheme.primaryDark}, ${greenTheme.primary})`,
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 20px ${alpha(greenTheme.primary, 0.5)}`,
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center gap-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 20, animation: "spin 1s linear infinite" }} />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </motion.div>

              {/* Register Link */}
              <motion.div variants={fadeInUp} className="text-center pt-2">
                <Typography
                  variant="body2"
                  sx={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}
                >
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/register"
                    style={{
                      fontWeight: 600,
                      color: greenTheme.primary,
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = greenTheme.primaryDark;
                      e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = greenTheme.primary;
                      e.currentTarget.style.textDecoration = "none";
                    }}
                  >
                    Create account
                  </Link>
                </Typography>
              </motion.div>

              {/* Social Links */}
              <motion.div variants={fadeInUp} className="flex justify-center gap-4 pt-4">
                <IconButton
                  size="small"
                  sx={{
                    color: isDarkMode ? "#64748b" : "#94a3b8",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: greenTheme.primary,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: isDarkMode ? "#64748b" : "#94a3b8",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: greenTheme.primary,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: isDarkMode ? "#64748b" : "#94a3b8",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: greenTheme.primary,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <GitHubIcon />
                </IconButton>
              </motion.div>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}