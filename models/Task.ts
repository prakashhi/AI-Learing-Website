/**
 * Task Model
 * Represents tasks within projects
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";
import User from "./User";
import Project from "./Project";

export class Task extends Model {
  public id!: string;
  public projectId!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public dueDate!: Date | null;
  public status!: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  public priority!: "HIGH" | "MEDIUM" | "LOW";
  public completed!: boolean;
  public completedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Project,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "IN_PROGRESS", "COMPLETED"),
      defaultValue: "PENDING",
    },
    priority: {
      type: DataTypes.ENUM("HIGH", "MEDIUM", "LOW"),
      defaultValue: "MEDIUM",
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
    timestamps: true,
    indexes: [
      {
        fields: ["projectId"],
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["userId", "completed"],
      },
      {
        fields: ["userId", "status"],
      },
    ],
  },
);

export default Task;
