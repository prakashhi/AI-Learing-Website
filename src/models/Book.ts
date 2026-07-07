import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class Book extends Model {
  public id!: string;
  public userId!: string;
  public title!: string;
  public author!: string;
  public fileType!: string;
  public fileUrl!: string;
  public status!: "PROCESSING" | "READY" | "ERROR";
  public totalChapters!: number;
}

Book.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PROCESSING", "READY", "ERROR"),
      defaultValue: "PROCESSING",
      allowNull: false,
    },
    totalChapters: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Book",
    tableName: "books",
    timestamps: true,
  }
);

export default Book;
