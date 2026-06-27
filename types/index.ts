/**
 * TaskFlow AI - Domain Types
 * Centralized TypeScript type definitions for all entities
 */

// User Types
export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Goal Types
export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type GoalStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export type Goal = {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: Date | null;
  priority: Priority;
  progress: number; // 0-100
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
};

// Project Types
export type ProjectStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type Project = {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
};

// Task Types
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type Task = {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  description: string;
  dueDate: Date | null;
  status: TaskStatus;
  priority: Priority;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Resource Types
export type ResourceType = "LINK" | "NOTE" | "ARTICLE" | "VIDEO";

export type Resource = {
  id: string;
  userId: string;
  type: ResourceType;
  title: string;
  description: string;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Daily Log Types
export type Mood = "HAPPY" | "NEUTRAL" | "TIRED" | "FRUSTRATED" | "EXCITED";

export type DailyLog = {
  id: string;
  userId: string;
  date: Date;
  learned: string;
  hourStudied: number;
  notes: string;
  mood: Mood;
  createdAt: Date;
  updatedAt: Date;
};

// Streak Types
export type Streak = {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// AI Question Types
export type AICategory =
  | "DAILY_QUESTION"
  | "RECOMMENDATION"
  | "REVIEW"
  | "ROADMAP";

export type AIQuestion = {
  id: string;
  userId: string;
  question: string;
  answer: string | null;
  category: AICategory;
  createdAt: Date;
  updatedAt: Date;
};

// Server Action Response Types
export type ServerActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Session Types
export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export type Session = {
  user: SessionUser;
  expires: string;
};

// Form Input Types
export type CreateGoalInput = Omit<
  Goal,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateGoalInput = Partial<CreateGoalInput>;

export type CreateProjectInput = Omit<
  Project,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateTaskInput = Omit<
  Task,
  "id" | "userId" | "completedAt" | "createdAt" | "updatedAt"
>;
export type UpdateTaskInput = Partial<CreateTaskInput>;

export type CreateResourceInput = Omit<
  Resource,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateResourceInput = Partial<CreateResourceInput>;

export type CreateDailyLogInput = Omit<
  DailyLog,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateDailyLogInput = Partial<CreateDailyLogInput>;

// Dashboard Types
export type DashboardStats = {
  totalGoals: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  recentActivities: Activity[];
};

export type Activity = {
  id: string;
  type: "GOAL_CREATED" | "PROJECT_CREATED" | "TASK_COMPLETED" | "LOG_CREATED";
  description: string;
  timestamp: Date;
  entityId?: string;
};

// Chart Data Types
export type ChartDataPoint = {
  date: string;
  completed: number;
  hours: number;
};

export type ActivityCalendarData = {
  date: string;
  count: number;
};
