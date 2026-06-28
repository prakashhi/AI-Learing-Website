import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class RevisionSchedule extends Model {
  public id!: string;
  public userId!: string;
  public bookId!: string;
  public chapterId!: string;
  public scheduledAt!: Date;
  public completedAt!: Date;
  public interval!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RevisionSchedule.init(
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
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    interval: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RevisionSchedule",
    tableName: "revision_schedules",
    timestamps: true,
  }
);

export default RevisionSchedule;
