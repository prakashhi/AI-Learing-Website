import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class ProcessingJob extends Model {
  public id!: string;
  public bookId!: string;
  public type!: "PDF_PROCESSING";
  public status!: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  public progress!: number;
  public error!: string;
  public pgBossJobId!: string;
  public startedAt!: Date;
  public completedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProcessingJob.init(
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
    type: {
      type: DataTypes.ENUM("PDF_PROCESSING"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("QUEUED", "PROCESSING", "COMPLETED", "FAILED"),
      defaultValue: "QUEUED",
      allowNull: false,
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pgBossJobId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ProcessingJob",
    tableName: "processing_jobs",
    timestamps: true,
  }
);

export default ProcessingJob;
