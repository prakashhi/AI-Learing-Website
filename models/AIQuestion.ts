/**
 * AIQuestion Model
 * Stores AI-generated questions and suggestions
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";
import User from "./User";

export class AIQuestion extends Model {
  public id!: string;
  public userId!: string;
  public question!: string;
  public answer!: string | null;
  public category!: "DAILY_QUESTION" | "RECOMMENDATION" | "REVIEW" | "ROADMAP";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIQuestion.init(
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
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "DAILY_QUESTION",
        "RECOMMENDATION",
        "REVIEW",
        "ROADMAP",
      ),
      defaultValue: "DAILY_QUESTION",
    },
  },
  {
    sequelize,
    modelName: "AIQuestion",
    tableName: "ai_questions",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["userId", "category"],
      },
    ],
  },
);

export default AIQuestion;
