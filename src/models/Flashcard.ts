import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class Flashcard extends Model {
  public id!: string;
  public userId!: string;
  public bookId!: string;
  public chapterId!: string;
  public front!: string;
  public back!: string;
  public difficulty!: number;
  public learningState!: "NEW" | "LEARNING" | "REVIEW";
}

Flashcard.init(
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
    front: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    back: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    learningState: {
      type: DataTypes.ENUM("NEW", "LEARNING", "REVIEW"),
      defaultValue: "NEW",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Flashcard",
    tableName: "flashcards",
    timestamps: true,
  }
);

export default Flashcard;
