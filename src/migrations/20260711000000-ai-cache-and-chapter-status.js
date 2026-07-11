"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ai_cache", {
      key: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      value: { type: DataTypes.TEXT, allowNull: false },
      model: { type: DataTypes.STRING, allowNull: false },
      provider: { type: DataTypes.STRING, allowNull: false },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      hitCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex("ai_cache", ["expiresAt"], {
      name: "ai_cache_expiresAt_idx",
    });
    await queryInterface.addIndex("ai_cache", ["provider", "model"], {
      name: "ai_cache_provider_model_idx",
    });

    await queryInterface.addColumn("book_chapters", "status", {
      type: Sequelize.ENUM("PENDING", "PROCESSING", "COMPLETED", "FAILED"),
      defaultValue: "PENDING",
      allowNull: false,
    });
    await queryInterface.addColumn("book_chapters", "error", {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    await queryInterface.removeColumn("book_sections", "embedding");
    try {
      await queryInterface.sequelize.query(
        "ALTER TABLE book_sections DROP COLUMN IF EXISTS embedding_vector",
      );
    } catch (e) {
      console.warn("book_sections.embedding_vector already absent");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("book_sections", "embedding", {
      type: DataTypes.ARRAY(DataTypes.FLOAT),
      allowNull: true,
    });
    await queryInterface.removeColumn("book_chapters", "error");
    await queryInterface.removeColumn("book_chapters", "status");
    await queryInterface.dropTable("ai_cache");
  },
};
