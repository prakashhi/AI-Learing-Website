import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class AICache extends Model {
  public key!: string;
  public value!: string;
  public model!: string;
  public provider!: string;
  public expiresAt!: Date;
  public hitCount!: number;
}

AICache.init(
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hitCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "AICache",
    tableName: "ai_cache",
    timestamps: true,
  }
);

export default AICache;
