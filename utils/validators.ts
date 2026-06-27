/**
 * TaskFlow AI - Zod Validators
 * Centralized input validation schemas
 */

import { z } from "zod";
import {
  Priority,
  ProjectStatus,
  TaskStatus,
  ResourceType,
  Mood,
} from "@/types";

// Auth Validators
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Goal Validators
export const CreateGoalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  targetDate: z.string().datetime().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  progress: z.number().int().min(0).max(100).default(0),
});

export const UpdateGoalSchema = CreateGoalSchema.partial();

// Project Validators
export const CreateProjectSchema = z.object({
  goalId: z.string().uuid("Invalid goal ID"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

// Task Validators
export const CreateTaskSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  completed: z.boolean().default(false),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const ToggleTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  completed: z.boolean(),
});

// Resource Validators
export const CreateResourceSchema = z
  .object({
    type: z.enum(["LINK", "NOTE", "ARTICLE", "VIDEO"]),
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z.string().max(1000).optional(),
    url: z.string().url("Invalid URL").optional(),
  })

export const UpdateResourceSchema = CreateResourceSchema.refine(
    (data) => {
      // URL is required for LINK, ARTICLE, VIDEO
      if (["LINK", "ARTICLE", "VIDEO"].includes(data.type)) {
        return !!data.url;
      }
      return true;
    },
    {
      message: "URL is required for this resource type",
      path: ["url"],
    },
);

// export const UpdateResourceSchema = ResourceSchema.partial();

// Daily Log Validators
export const CreateDailyLogSchema = z.object({
  date: z.string().datetime(),
  learned: z.string().min(1, "What did you learn?").max(1000),
  hourStudied: z.number().min(0).max(24).default(0),
  notes: z.string().max(1000).optional(),
  mood: z.enum(["HAPPY", "NEUTRAL", "TIRED", "FRUSTRATED", "EXCITED"]),
});

export const UpdateDailyLogSchema = CreateDailyLogSchema.partial();

// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

// Search & Filter
export const SearchSchema = z.object({
  query: z.string().max(100).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

export const FilterSchema = z.object({
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  status: z.string().optional(),
  type: z.enum(["LINK", "NOTE", "ARTICLE", "VIDEO"]).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

// Type exports for use in server actions
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type CreateResourceInput = z.infer<typeof CreateResourceSchema>;
export type UpdateResourceInput = z.infer<typeof UpdateResourceSchema>;
export type CreateDailyLogInput = z.infer<typeof CreateDailyLogSchema>;
export type UpdateDailyLogInput = z.infer<typeof UpdateDailyLogSchema>;
