import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class FlashcardReview extends Model {
  public id!: string;
  public flashcardId!: string;
  public userId!: string;
  public easeFactor!: number;
  public interval!: number;
  public repetitions!: number;
  public nextReviewAt!: Date;
  public lastReviewedAt!: Date;
}

FlashcardReview.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    flashcardId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    easeFactor: {
      type: DataTypes.FLOAT,
      defaultValue: 2.5,
      allowNull: false,
    },
    interval: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    repetitions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    nextReviewAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lastReviewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "FlashcardReview",
    tableName: "flashcard_reviews",
    timestamps: true,
  }
);

export default FlashcardReview;
