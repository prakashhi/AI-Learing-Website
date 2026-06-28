import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class UserBook extends Model {
  public id!: string;
  public userId!: string;
  public bookId!: string;
  public currentChapterIndex!: number;
  public learningMode!: "BEGINNER" | "STUDENT" | "INTERVIEW" | "ADVANCED";
  public learningGoal!: string;
  public dailyStudyMinutes!: number;
  public completed!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserBook.init(
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
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    currentChapterIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    learningMode: {
      type: DataTypes.ENUM("BEGINNER", "STUDENT", "INTERVIEW", "ADVANCED"),
      defaultValue: "STUDENT",
      allowNull: false,
    },
    learningGoal: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dailyStudyMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserBook",
    tableName: "user_books",
    timestamps: true,
  }
);

export default UserBook;
