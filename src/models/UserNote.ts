import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class UserNote extends Model {
  public id!: string;
  public userId!: string;
  public bookId!: string;
  public chapterId!: string;
  public content!: string;
  public type!: "NOTE" | "HIGHLIGHT" | "BOOKMARK";
  public pageRef!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserNote.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("NOTE", "HIGHLIGHT", "BOOKMARK"),
      defaultValue: "NOTE",
      allowNull: false,
    },
    pageRef: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "UserNote",
    tableName: "user_notes",
    timestamps: true,
  }
);

export default UserNote;
