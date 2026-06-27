/**
 * Goal Model
 * Represents user goals (high-level objectives)
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";
import User from "./User";

export class Goal extends Model {
  public id!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public targetDate!: Date | null;
  public priority!: "HIGH" | "MEDIUM" | "LOW";
  public progress!: number; // 0-100
  public status!: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Goal.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    targetDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("HIGH", "MEDIUM", "LOW"),
      defaultValue: "MEDIUM",
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "COMPLETED", "ARCHIVED"),
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "Goal",
    tableName: "goals",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["userId", "status"],
      },
    ],
  },
);

export default Goal;
