/**
 * DailyLog Model
 * Represents daily journal entries
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";
import User from "./User";

export class DailyLog extends Model {
  public id!: string;
  public userId!: string;
  public date!: Date;
  public learned!: string;
  public hourStudied!: number;
  public notes!: string;
  public mood!: "HAPPY" | "NEUTRAL" | "TIRED" | "FRUSTRATED" | "EXCITED";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DailyLog.init(
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    learned: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hourStudied: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 24,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mood: {
      type: DataTypes.ENUM(
        "HAPPY",
        "NEUTRAL",
        "TIRED",
        "FRUSTRATED",
        "EXCITED",
      ),
      defaultValue: "NEUTRAL",
    },
  },
  {
    sequelize,
    modelName: "DailyLog",
    tableName: "daily_logs",
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "date"],
        unique: true,
      },
      {
        fields: ["userId"],
      },
    ],
  },
);

export default DailyLog;
