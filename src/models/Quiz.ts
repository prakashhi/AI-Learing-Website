import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class Quiz extends Model {
  public id!: string;
  public bookId!: string;
  public chapterId!: string;
  public type!: "MCQ" | "SHORT_ANSWER" | "CODING" | "SCENARIO";
  public questions!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Quiz.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    chapterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("MCQ", "SHORT_ANSWER", "CODING", "SCENARIO"),
      allowNull: false,
    },
    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Quiz",
    tableName: "quizzes",
    timestamps: true,
  }
);

export default Quiz;
