'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. users table (no dependencies)
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
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
        allowNull: true,
      },
      emailVerified: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    await queryInterface.addIndex('users', ['email'], { unique: true, name: 'users_email_unique' });

    // 2. goals table (depends on users)
    await queryInterface.createTable('goals', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [3, 100] },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      targetDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM('HIGH', 'MEDIUM', 'LOW'),
        defaultValue: 'MEDIUM',
      },
      progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0, max: 100 },
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'ARCHIVED'),
        defaultValue: 'ACTIVE',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    await queryInterface.addIndex('goals', ['userId'], { name: 'goals_userId_idx' });
    await queryInterface.addIndex('goals', ['userId', 'status'], { name: 'goals_userId_status_idx' });

    // 3. projects table (depends on users, goals)
    await queryInterface.createTable('projects', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      goalId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'goals', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [3, 100] },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED'),
        defaultValue: 'PENDING',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    await queryInterface.addIndex('projects', ['goalId'], { name: 'projects_goalId_idx' });
    await queryInterface.addIndex('projects', ['userId'], { name: 'projects_userId_idx' });
    await queryInterface.addIndex('projects', ['userId', 'status'], { name: 'projects_userId_status_idx' });

    // 4. tasks table (depends on users, projects)
    await queryInterface.createTable('tasks', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'projects', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [3, 100] },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED'),
        defaultValue: 'PENDING',
      },
      priority: {
        type: DataTypes.ENUM('HIGH', 'MEDIUM', 'LOW'),
        defaultValue: 'MEDIUM',
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    await queryInterface.addIndex('tasks', ['projectId'], { name: 'tasks_projectId_idx' });
    await queryInterface.addIndex('tasks', ['userId'], { name: 'tasks_userId_idx' });
    await queryInterface.addIndex('tasks', ['userId', 'completed'], { name: 'tasks_userId_completed_idx' });
    await queryInterface.addIndex('tasks', ['userId', 'status'], { name: 'tasks_userId_status_idx' });

    // 5. resources table (depends on users)
    await queryInterface.createTable('resources', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      type: {
        type: DataTypes.ENUM('LINK', 'NOTE', 'ARTICLE', 'VIDEO'),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [3, 200] },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isUrl: true },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    await queryInterface.addIndex('resources', ['userId'], { name: 'resources_userId_idx' });
    await queryInterface.addIndex('resources', ['userId', 'type'], { name: 'resources_userId_type_idx' });

    // 6. daily_logs table (depends on users)
    await queryInterface.createTable('daily_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      learned: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      hourStudied: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: { min: 0, max: 24 },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mood: {
        type: DataTypes.ENUM('HAPPY', 'NEUTRAL', 'TIRED', 'FRUSTRATED', 'EXCITED'),
        defaultValue: 'NEUTRAL',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    await queryInterface.addIndex('daily_logs', ['userId', 'date'], { unique: true, name: 'daily_logs_userId_date_unique' });
    await queryInterface.addIndex('daily_logs', ['userId'], { name: 'daily_logs_userId_idx' });

    // 7. streaks table (depends on users)
    await queryInterface.createTable('streaks', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      currentStreak: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 },
      },
      longestStreak: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 },
      },
      lastActivityDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    await queryInterface.addIndex('streaks', ['userId'], { unique: true, name: 'streaks_userId_unique' });

    // 8. ai_questions table (depends on users)
    await queryInterface.createTable('ai_questions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.ENUM('DAILY_QUESTION', 'RECOMMENDATION', 'REVIEW', 'ROADMAP'),
        defaultValue: 'DAILY_QUESTION',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    await queryInterface.addIndex('ai_questions', ['userId'], { name: 'ai_questions_userId_idx' });
    await queryInterface.addIndex('ai_questions', ['userId', 'category'], { name: 'ai_questions_userId_category_idx' });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order to avoid FK constraint errors
    await queryInterface.dropTable('ai_questions');
    await queryInterface.dropTable('streaks');
    await queryInterface.dropTable('daily_logs');
    await queryInterface.dropTable('resources');
    await queryInterface.dropTable('tasks');
    await queryInterface.dropTable('projects');
    await queryInterface.dropTable('goals');
    await queryInterface.dropTable('users');
  }
};