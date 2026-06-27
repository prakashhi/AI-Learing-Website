/**
 * Sequelize Database Initialization
 * Connection and instance configuration
 */

import { Sequelize } from "sequelize";
import pg from "pg"

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
  throw new Error("Database environment variables are missing");
}



export const sequelize = new Sequelize(
  DB_NAME,      // Database name
  DB_USER,      // Username
  DB_PASSWORD,  // Password
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    dialectModule: pg,
    logging:
      process.env.NODE_ENV === "development"
        ? console.log
        : false,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    dialectOptions: {
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    },
  }
);

// Test connection
export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("✅ Database models synced");
    } else {
      console.log("✅ Database models ready (managed by migrations)");
    }
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
}

export default sequelize;
