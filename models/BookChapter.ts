import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class BookChapter extends Model {
  public id!: string;
  public bookId!: string;
  public index!: number;
  public title!: string;
  public content!: string;
  public embedding!: number[];
  public summary!: string;
  public keyPoints!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    embedding: {
      type: DataTypes.ARRAY(DataTypes.FLOAT),
      allowNull: true,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    keyPoints: {
      type: DataTypes.JSONB,
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
