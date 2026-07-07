import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class LearningSession extends Model {
  public id!: string;
  public userId!: string;
  public bookId!: string;
  public chapterId!: string;
  public duration!: number;
  public type!: "LESSON" | "QUIZ" | "REVISION" | "CHAT";
}

LearningSession.init(
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
    chapterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("LESSON", "QUIZ", "REVISION", "CHAT"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LearningSession",
    tableName: "learning_sessions",
    timestamps: true,
  }
);

export default LearningSession;
