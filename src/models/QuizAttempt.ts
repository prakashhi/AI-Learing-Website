import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class QuizAttempt extends Model {
  public id!: string;
  public userId!: string;
  public quizId!: string;
  public score!: number;
  public totalQuestions!: number;
  public answers!: any;
  public feedback!: any;
  public weakTopics!: any;
  public strongTopics!: any;
}

QuizAttempt.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quizId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    feedback: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    weakTopics: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    strongTopics: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "QuizAttempt",
    tableName: "quiz_attempts",
    timestamps: true,
  }
);

export default QuizAttempt;
