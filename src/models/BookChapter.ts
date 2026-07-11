import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class BookChapter extends Model {
  public id!: string;
  public bookId!: string;
  public index!: number;
  public title!: string;
  public rawText!: string;
  public cleanText!: string;
  public fullExplanation!: string;
  public summary!: string;
  public learningMaterial!: any;
  public status!: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  public error!: string;
}

BookChapter.init(
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
    index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rawText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cleanText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fullExplanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    learningMaterial: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "PROCESSING", "COMPLETED", "FAILED"),
      defaultValue: "PENDING",
      allowNull: false,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "BookChapter",
    tableName: "book_chapters",
    timestamps: true,
  }
);

export default BookChapter;
