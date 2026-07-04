"use client";

/**
 * Register Page
 * User registration with email and password
 * Features: Green/White professional theme, advanced animations, modern design
 */

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  alpha,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { RegisterSchema } from "@/validations/validators";

// Material-UI Icons
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckBoxOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import AppleIcon from "@mui/icons-material/Apple";
import { signIn } from "next-auth/react";

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

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check for dark mode preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Calculate password strength
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "#e2e8f0";
    if (passwordStrength === 1) return "#ef4444";
    if (passwordStrength === 2) return "#f59e0b";
    if (passwordStrength === 3) return "#10b981";
    return "#059669";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "No password";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate input
      const result = RegisterSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        setError(firstError || "Validation failed");
        toast.error(firstError || "Validation failed");
        setLoading(false);
        return;
      }

      // Call registration API using custom axios wrapper
      const data = await api.post("/auth/register", formData);

      toast.success(data.message || "Account created! Redirecting...");
      router.push("/auth/login");
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    setLoading(true);
    signIn("google", { redirectTo: "/dashboard" });
  };

  // Green & White professional theme colors
  const greenTheme = {
    primary: "#059669",
    primaryLight: "#10b981",
    primaryDark: "#047857",
    secondary: "#34d399",
    accent: "#a7f3d0",
    background: isDarkMode ? "#0f172a" : "#f8fafc",
    cardBg: isDarkMode ? alpha("#1e293b", 0.95) : alpha("#ffffff", 0.98),
  };

  return (
    <motion.div
      variants={pageVariants}
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
          className="absolute top-20 right-10 w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, ${alpha("#059669", 0.2)} 0%, ${alpha(
              "#10b981",
              0.05,
            )} 70%)`,
          }}
          animate={{
            x: [0, -40, 0],
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
          className="absolute bottom-20 left-10 w-80 h-80 rounded-full"
          style={{
            background: `radial-gradient(circle, ${alpha("#34d399", 0.15)} 0%, ${alpha(
              "#a7f3d0",
              0.05,
            )} 70%)`,
          }}
          animate={{
            x: [0, 30, 0],
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

        {/* Floating decorative elements */}
        {[
          { Icon: TaskAltIcon, x: "8%", y: "15%", size: 24 },
          { Icon: AutoAwesomeIcon, x: "88%", y: "20%", size: 20 },
          { Icon: CheckCircleOutlineIcon, x: "12%", y: "80%", size: 28 },
          { Icon: AutoAwesomeIcon, x: "92%", y: "75%", size: 22 },
          { Icon: HowToRegOutlinedIcon, x: "5%", y: "50%", size: 18 },
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
                background: isDarkMode
                  ? alpha("#ffffff", 0.05)
                  : alpha("#ffffff", 0.6),
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
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <IconButton
              onClick={() => router.back()}
              sx={{
                borderRadius: "12px",
                padding: "8px",
                background: isDarkMode
                  ? alpha("#1e293b", 0.8)
                  : alpha("#f8fafc", 0.8),
                "&:hover": {
                  background: isDarkMode
                    ? alpha("#334155", 0.9)
                    : alpha("#e2e8f0", 0.9),
                  transform: "translateX(-2px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ArrowBackOutlinedIcon sx={{ color: greenTheme.primary }} />
            </IconButton>
          </motion.div>

          {/* Animated Brand Logo */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
          >
            <div className="relative">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${greenTheme.primary}, ${greenTheme.secondary})`,
                }}
              >
                <HowToRegOutlinedIcon sx={{ fontSize: 32, color: "#ffffff" }} />
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  border: `2px solid ${alpha(greenTheme.primary, 0.4)}`,
                }}
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
                variant="h2"
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
                Create Account
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: isDarkMode ? "#94a3b8" : "#475569",
                }}
              >
                Join TaskFlow AI today
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
                    background: isDarkMode
                      ? alpha("#7f1d1d", 0.5)
                      : alpha("#fee2e2", 0.8),
                    border: `1px solid ${isDarkMode ? "#991b1b" : "#fecaca"}`,
                  }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <motion.div
              variants={staggerContainer}
              animate="animate"
              className="space-y-5"
            >
              {/* Full Name Input */}
              <motion.div variants={fadeInUp}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlinedIcon
                          sx={{ color: isDarkMode ? "#64748b" : "#94a3b8" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      transition: "all 0.2s ease",
                      background: isDarkMode
                        ? alpha("#1e293b", 0.6)
                        : alpha("#f8fafc", 0.8),
                      "&:hover": {
                        background: isDarkMode
                          ? alpha("#334155", 0.8)
                          : alpha("#ffffff", 0.9),
                      },
                      "&.Mui-focused": {
                        background: isDarkMode
                          ? alpha("#1e293b", 0.9)
                          : "#ffffff",
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

              {/* Email Input */}
              <motion.div variants={fadeInUp}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
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
                      borderRadius: "16px",
                      transition: "all 0.2s ease",
                      background: isDarkMode
                        ? alpha("#1e293b", 0.6)
                        : alpha("#f8fafc", 0.8),
                      "&:hover": {
                        background: isDarkMode
                          ? alpha("#334155", 0.8)
                          : alpha("#ffffff", 0.9),
                      },
                      "&.Mui-focused": {
                        background: isDarkMode
                          ? alpha("#1e293b", 0.9)
                          : "#ffffff",
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  helperText={
                    <span className="flex items-center gap-2 mt-1">
                      <span>Password strength:</span>
                      <span
                        style={{
                          color: getPasswordStrengthColor(),
                          fontWeight: 600,
                        }}
                      >
                        {getPasswordStrengthText()}
                      </span>
                      {passwordStrength > 0 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(passwordStrength / 4) * 100}%`,
                          }}
                          className="h-1 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${getPasswordStrengthColor()}, ${greenTheme.primary})`,
                          }}
                        />
                      )}
                    </span>
                  }
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
                      borderRadius: "16px",
                      transition: "all 0.2s ease",
                      background: isDarkMode
                        ? alpha("#1e293b", 0.6)
                        : alpha("#f8fafc", 0.8),
                      "&:hover": {
                        background: isDarkMode
                          ? alpha("#334155", 0.8)
                          : alpha("#ffffff", 0.9),
                      },
                      "&.Mui-focused": {
                        background: isDarkMode
                          ? alpha("#1e293b", 0.9)
                          : "#ffffff",
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
                    "& .MuiFormHelperText-root": {
                      color: isDarkMode ? "#64748b" : "#94a3b8",
                    },
                  }}
                />
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div variants={fadeInUp}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  error={
                    formData.confirmPassword !== "" &&
                    formData.password !== formData.confirmPassword
                  }
                  helperText={
                    formData.confirmPassword !== "" &&
                    formData.password !== formData.confirmPassword
                      ? "Passwords do not match"
                      : ""
                  }
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
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? (
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
                      borderRadius: "16px",
                      transition: "all 0.2s ease",
                      background: isDarkMode
                        ? alpha("#1e293b", 0.6)
                        : alpha("#f8fafc", 0.8),
                      "&:hover": {
                        background: isDarkMode
                          ? alpha("#334155", 0.8)
                          : alpha("#ffffff", 0.9),
                      },
                      "&.Mui-focused": {
                        background: isDarkMode
                          ? alpha("#1e293b", 0.9)
                          : "#ffffff",
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

              {/* Social Registration Options */}
              <motion.div variants={fadeInUp}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    mb: 2,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    color: isDarkMode ? "#64748b" : "#94a3b8",
                  }}
                >
                  OR SIGN UP WITH
                </Typography>
                <div className="grid">
                  <Button
                    onClick={handleGoogleRegister}
                    variant="outlined"
                    size="large"
                    disabled={loading}
                    startIcon={<GoogleIcon />}
                    sx={{
                      borderRadius: "14px",
                      height: 48,
                      fontWeight: 600,
                      textTransform: "none",
                      borderColor: isDarkMode ? "#475569" : "#e2e8f0",
                      color: isDarkMode ? "#e2e8f0" : "#1e293b",
                      background: isDarkMode
                        ? alpha("#1e293b", 0.5)
                        : alpha("#ffffff", 0.8),
                      "&:hover": {
                        borderColor: greenTheme.primary,
                        background: isDarkMode
                          ? alpha("#334155", 0.8)
                          : alpha(greenTheme.accent, 0.3),
                      },
                    }}
                  >
                    Google
                  </Button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={fadeInUp} className="pt-2">
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
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
                      <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                      <span>Creating account...</span>
                    </motion.div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </motion.div>

              {/* Login Link */}
              <motion.div variants={fadeInUp} className="text-center pt-2">
                <Typography
                  variant="body2"
                  sx={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}
                >
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
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
                    Sign in
                  </Link>
                </Typography>
              </motion.div>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
