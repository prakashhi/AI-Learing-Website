import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class ConversationMessage extends Model {
  public id!: string;
  public userId!: string;
  public bookId!: string;
  public chapterId!: string;
  public role!: "USER" | "AI";
  public content!: string;
  public metadata!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConversationMessage.init(
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
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("USER", "AI"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ConversationMessage",
    tableName: "conversation_messages",
    timestamps: true,
  }
);

export default ConversationMessage;
