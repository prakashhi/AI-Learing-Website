/**
 * User Model
 * Represents application users
 */

import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class User extends Model {
  public id!: string;
  public email!: string;
  public name!: string | null;
  public image!: string | null;
  public password!: string | null; // For email/password auth
  public emailVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Null if using OAuth
    },
    emailVerified: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    indexes: [
      {
        fields: ["email"],
        unique: true,
      },
    ],
  },
);

export default User;
