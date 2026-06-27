/**
 * Streak Model
 * Tracks user streaks (consecutive active days)
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";
import User from "./User";

export class Streak extends Model {
  public id!: string;
  public userId!: string;
  public currentStreak!: number;
  public longestStreak!: number;
  public lastActivityDate!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Streak.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    lastActivityDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Streak",
    tableName: "streaks",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
        unique: true,
      },
    ],
  },
);

export default Streak;
