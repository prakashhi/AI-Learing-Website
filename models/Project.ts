/**
 * Project Model
 * Represents projects within goals
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";
import User from "./User";
import Goal from "./Goal";

export class Project extends Model {
  public id!: string;
  public goalId!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public status!: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    goalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Goal,
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
    status: {
      type: DataTypes.ENUM("PENDING", "IN_PROGRESS", "COMPLETED"),
      defaultValue: "PENDING",
    },
  },
  {
    sequelize,
    modelName: "Project",
    tableName: "projects",
    timestamps: true,
    indexes: [
      {
        fields: ["goalId"],
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["userId", "status"],
      },
    ],
  },
);

export default Project;
