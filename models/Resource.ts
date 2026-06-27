/**
 * Resource Model
 * Represents learning resources (links, notes, articles, videos)
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";
import User from "./User";

export class Resource extends Model {
  public id!: string;
  public userId!: string;
  public type!: "LINK" | "NOTE" | "ARTICLE" | "VIDEO";
  public title!: string;
  public description!: string;
  public url!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Resource.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    type: {
      type: DataTypes.ENUM("LINK", "NOTE", "ARTICLE", "VIDEO"),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
  },
  {
    sequelize,
    modelName: "Resource",
    tableName: "resources",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["userId", "type"],
      },
    ],
  },
);

export default Resource;
