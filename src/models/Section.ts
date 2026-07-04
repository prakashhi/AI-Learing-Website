import { DataTypes, Model } from "sequelize";
import sequelize from "@/lib/db/sequelize";

export class Section extends Model {
  public id!: string;
  public chapterId!: string;
  public index!: number;
  public sectionText!: string;
  public explanation!: string;
  public concepts!: any;
  public examples!: any;
  public definitions!: any;
  public embedding!: number[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Section.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    chapterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sectionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    concepts: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    examples: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    definitions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    embedding: {
      type: DataTypes.ARRAY(DataTypes.FLOAT),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Section",
    tableName: "book_sections",
    timestamps: true,
  }
);

export default Section;
