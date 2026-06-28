'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Enable pgvector extension (skip if not available — embeddings use float array fallback)
    try {
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS vector');
    } catch (e) {
      console.warn('⚠️ pgvector extension not available, embeddings will use float array fallback');
    }

    // 2. Create users table (self-contained — works if old migration was deleted)
    await queryInterface.createTable('users', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      name: { type: DataTypes.STRING, allowNull: true },
      image: { type: DataTypes.STRING, allowNull: true },
      password: { type: DataTypes.STRING, allowNull: true },
      emailVerified: { type: DataTypes.DATE, allowNull: true },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('users', ['email'], { unique: true, name: 'users_email_unique' });

    // 3. Create books table
    await queryInterface.createTable('books', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: DataTypes.STRING, allowNull: false },
      author: { type: DataTypes.STRING, allowNull: true },
      fileType: { type: DataTypes.STRING, allowNull: false },
      fileUrl: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.ENUM('PROCESSING', 'READY', 'ERROR'), defaultValue: 'PROCESSING', allowNull: false },
      totalChapters: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('books', ['userId'], { name: 'books_userId_idx' });
    await queryInterface.addIndex('books', ['userId', 'status'], { name: 'books_userId_status_idx' });

    // 4. Create book_chapters table
    await queryInterface.createTable('book_chapters', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      bookId: { type: DataTypes.UUID, allowNull: false, references: { model: 'books', key: 'id' }, onDelete: 'CASCADE' },
      index: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      summary: { type: DataTypes.TEXT, allowNull: true },
      keyPoints: { type: DataTypes.JSONB, allowNull: true },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('book_chapters', ['bookId', 'index'], { unique: true, name: 'book_chapters_bookId_index_unique' });
    await queryInterface.addIndex('book_chapters', ['bookId'], { name: 'book_chapters_bookId_idx' });

    // Add vector column for embeddings (post-create because Sequelize doesn't have vector type)
    try {
      await queryInterface.sequelize.query('ALTER TABLE book_chapters ADD COLUMN embedding vector(1536)');
    } catch (e) {
      await queryInterface.sequelize.query('ALTER TABLE book_chapters ADD COLUMN embedding DOUBLE PRECISION[]');
      console.warn('⚠️ Using float array for embeddings instead of vector type');
    }

    // 5. Create user_books table
    await queryInterface.createTable('user_books', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      bookId: { type: DataTypes.UUID, allowNull: false, references: { model: 'books', key: 'id' }, onDelete: 'CASCADE' },
      currentChapterIndex: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
      learningMode: { type: DataTypes.ENUM('BEGINNER', 'STUDENT', 'INTERVIEW', 'ADVANCED'), defaultValue: 'STUDENT', allowNull: false },
      learningGoal: { type: DataTypes.TEXT, allowNull: true },
      dailyStudyMinutes: { type: DataTypes.INTEGER, defaultValue: 30, allowNull: false },
      completed: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('user_books', ['userId', 'bookId'], { unique: true, name: 'user_books_userId_bookId_unique' });
    await queryInterface.addIndex('user_books', ['userId'], { name: 'user_books_userId_idx' });
    await queryInterface.addIndex('user_books', ['bookId'], { name: 'user_books_bookId_idx' });

    // 6. Create learning_sessions table
    await queryInterface.createTable('learning_sessions', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      bookId: { type: DataTypes.UUID, allowNull: false, references: { model: 'books', key: 'id' }, onDelete: 'CASCADE' },
      chapterId: { type: DataTypes.UUID, allowNull: false, references: { model: 'book_chapters', key: 'id' }, onDelete: 'CASCADE' },
      duration: { type: DataTypes.INTEGER, allowNull: false },
      type: { type: DataTypes.ENUM('LESSON', 'QUIZ', 'REVISION', 'CHAT'), allowNull: false },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('learning_sessions', ['userId'], { name: 'learning_sessions_userId_idx' });
    await queryInterface.addIndex('learning_sessions', ['bookId'], { name: 'learning_sessions_bookId_idx' });
    await queryInterface.addIndex('learning_sessions', ['userId', 'type'], { name: 'learning_sessions_userId_type_idx' });

    // 7. Create quizzes table
    await queryInterface.createTable('quizzes', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      bookId: { type: DataTypes.UUID, allowNull: false, references: { model: 'books', key: 'id' }, onDelete: 'CASCADE' },
      chapterId: { type: DataTypes.UUID, allowNull: false, references: { model: 'book_chapters', key: 'id' }, onDelete: 'CASCADE' },
      type: { type: DataTypes.ENUM('MCQ', 'SHORT_ANSWER', 'CODING', 'SCENARIO'), allowNull: false },
      questions: { type: DataTypes.JSONB, allowNull: false },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('quizzes', ['bookId'], { name: 'quizzes_bookId_idx' });
    await queryInterface.addIndex('quizzes', ['chapterId'], { name: 'quizzes_chapterId_idx' });

    // 8. Create quiz_attempts table
    await queryInterface.createTable('quiz_attempts', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      quizId: { type: DataTypes.UUID, allowNull: false, references: { model: 'quizzes', key: 'id' }, onDelete: 'CASCADE' },
      score: { type: DataTypes.INTEGER, allowNull: false },
      totalQuestions: { type: DataTypes.INTEGER, allowNull: false },
      answers: { type: DataTypes.JSONB, allowNull: false },
      feedback: { type: DataTypes.JSONB, allowNull: true },
      weakTopics: { type: DataTypes.JSONB, allowNull: true },
      strongTopics: { type: DataTypes.JSONB, allowNull: true },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('quiz_attempts', ['userId'], { name: 'quiz_attempts_userId_idx' });
    await queryInterface.addIndex('quiz_attempts', ['quizId'], { name: 'quiz_attempts_quizId_idx' });
    await queryInterface.addIndex('quiz_attempts', ['userId', 'createdAt'], { name: 'quiz_attempts_userId_createdAt_idx' });

    // 9. Create flashcards table
    await queryInterface.createTable('flashcards', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      bookId: { type: DataTypes.UUID, allowNull: false, references: { model: 'books', key: 'id' }, onDelete: 'CASCADE' },
      chapterId: { type: DataTypes.UUID, allowNull: false, references: { model: 'book_chapters', key: 'id' }, onDelete: 'CASCADE' },
      front: { type: DataTypes.TEXT, allowNull: false },
      back: { type: DataTypes.TEXT, allowNull: false },
      difficulty: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('flashcards', ['userId'], { name: 'flashcards_userId_idx' });
    await queryInterface.addIndex('flashcards', ['bookId', 'chapterId'], { name: 'flashcards_bookId_chapterId_idx' });

    // 10. Create flashcard_reviews table
    await queryInterface.createTable('flashcard_reviews', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      flashcardId: { type: DataTypes.UUID, allowNull: false, references: { model: 'flashcards', key: 'id' }, onDelete: 'CASCADE' },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      easeFactor: { type: DataTypes.FLOAT, defaultValue: 2.5, allowNull: false },
      interval: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
      repetitions: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
      nextReviewAt: { type: DataTypes.DATE, allowNull: false },
      lastReviewedAt: { type: DataTypes.DATE, allowNull: false },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('flashcard_reviews', ['flashcardId'], { name: 'flashcard_reviews_flashcardId_idx' });
    await queryInterface.addIndex('flashcard_reviews', ['userId', 'nextReviewAt'], { name: 'flashcard_reviews_userId_nextReviewAt_idx' });

    // 11. Create conversation_messages table
    await queryInterface.createTable('conversation_messages', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      bookId: { type: DataTypes.UUID, allowNull: false, references: { model: 'books', key: 'id' }, onDelete: 'CASCADE' },
      chapterId: { type: DataTypes.UUID, allowNull: true, references: { model: 'book_chapters', key: 'id' }, onDelete: 'SET NULL' },
      role: { type: DataTypes.ENUM('USER', 'AI'), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      metadata: { type: DataTypes.JSONB, allowNull: true },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('conversation_messages', ['userId', 'bookId'], { name: 'conv_messages_userId_bookId_idx' });
    await queryInterface.addIndex('conversation_messages', ['bookId', 'createdAt'], { name: 'conv_messages_bookId_createdAt_idx' });

    // 12. Create user_notes table
    await queryInterface.createTable('user_notes', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      bookId: { type: DataTypes.UUID, allowNull: false, references: { model: 'books', key: 'id' }, onDelete: 'CASCADE' },
      chapterId: { type: DataTypes.UUID, allowNull: false, references: { model: 'book_chapters', key: 'id' }, onDelete: 'CASCADE' },
      content: { type: DataTypes.TEXT, allowNull: false },
      type: { type: DataTypes.ENUM('NOTE', 'HIGHLIGHT', 'BOOKMARK'), defaultValue: 'NOTE', allowNull: false },
      pageRef: { type: DataTypes.STRING, allowNull: true },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('user_notes', ['userId', 'bookId'], { name: 'user_notes_userId_bookId_idx' });
    await queryInterface.addIndex('user_notes', ['bookId', 'chapterId'], { name: 'user_notes_bookId_chapterId_idx' });

    // 13. Create revision_schedules table
    await queryInterface.createTable('revision_schedules', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      bookId: { type: DataTypes.UUID, allowNull: false, references: { model: 'books', key: 'id' }, onDelete: 'CASCADE' },
      chapterId: { type: DataTypes.UUID, allowNull: false, references: { model: 'book_chapters', key: 'id' }, onDelete: 'CASCADE' },
      scheduledAt: { type: DataTypes.DATE, allowNull: false },
      completedAt: { type: DataTypes.DATE, allowNull: true },
      interval: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    });
    await queryInterface.addIndex('revision_schedules', ['userId', 'scheduledAt'], { name: 'revision_schedules_userId_scheduledAt_idx' });
    await queryInterface.addIndex('revision_schedules', ['userId', 'bookId'], { name: 'revision_schedules_userId_bookId_idx' });
  },

  async down(queryInterface, Sequelize) {
    // Drop new tables in reverse order (respect FK constraints)
    await queryInterface.dropTable('revision_schedules');
    await queryInterface.dropTable('user_notes');
    await queryInterface.dropTable('conversation_messages');
    await queryInterface.dropTable('flashcard_reviews');
    await queryInterface.dropTable('flashcards');
    await queryInterface.dropTable('quiz_attempts');
    await queryInterface.dropTable('quizzes');
    await queryInterface.dropTable('learning_sessions');
    await queryInterface.dropTable('user_books');
    await queryInterface.dropTable('book_chapters');
    await queryInterface.dropTable('books');
    await queryInterface.dropTable('users');
  }
};
