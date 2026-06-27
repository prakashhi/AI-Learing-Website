/**
 * Database Model Initialization & Associations
 * Sets up all model relationships
 */

import User from "@/models/User";
import Goal from "@/models/Goal";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Resource from "@/models/Resource";
import DailyLog from "@/models/DailyLog";
import Streak from "@/models/Streak";
import AIQuestion from "@/models/AIQuestion";

export function initializeModels() {
  // User relationships
  User.hasMany(Goal, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(Project, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(Task, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(Resource, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(DailyLog, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasOne(Streak, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(AIQuestion, { foreignKey: "userId", onDelete: "CASCADE" });

  // Goal relationships
  Goal.belongsTo(User, { foreignKey: "userId" });
  Goal.hasMany(Project, { foreignKey: "goalId", onDelete: "CASCADE" });

  // Project relationships
  Project.belongsTo(User, { foreignKey: "userId" });
  Project.belongsTo(Goal, { foreignKey: "goalId" });
  Project.hasMany(Task, { foreignKey: "projectId", onDelete: "CASCADE" });

  // Task relationships
  Task.belongsTo(User, { foreignKey: "userId" });
  Task.belongsTo(Project, { foreignKey: "projectId" });

  // Resource relationships
  Resource.belongsTo(User, { foreignKey: "userId" });

  // DailyLog relationships
  DailyLog.belongsTo(User, { foreignKey: "userId" });

  // Streak relationships
  Streak.belongsTo(User, { foreignKey: "userId" });

  // AIQuestion relationships
  AIQuestion.belongsTo(User, { foreignKey: "userId" });
}

// Export all models
export { User, Goal, Project, Task, Resource, DailyLog, Streak, AIQuestion };
