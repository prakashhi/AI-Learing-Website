/**
 * Framer Motion Animation Presets
 * Reusable animation configurations following Apple design
 */

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

export const modalVariant = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

export const buttonHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.15 },
};

export const cardHover = {
  whileHover: {
    y: -4,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
  transition: { duration: 0.2 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
};

export const slideInFromBottom = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 50, opacity: 0 },
  transition: { duration: 0.3 },
};

export const slideInFromLeft = {
  initial: { x: -300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -300, opacity: 0 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

export const spinnerAnimation = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: "linear" },
};

export const scaleUpAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3 },
};

export const checkmarkAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3, ease: "easeOut" },
};

export const shimmerAnimation = {
  animate: { backgroundPosition: ["0% 0%", "100% 0%"] },
  transition: { duration: 1.5, repeat: Infinity },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ease: "easeOut", duration: 0.3 },
  },
};

export const gestureSettings = {
  whileHover: "hover",
  whileTap: "tap",
};

export const easing = {
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
};
