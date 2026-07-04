export type LearningState = "NEW" | "LEARNING" | "REVIEW";

export type Flashcard = {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  front: string;
  back: string;
  difficulty: number;
  learningState: LearningState;
  createdAt: Date;
  updatedAt: Date;
};

export type FlashcardReview = {
  id: string;
  flashcardId: string;
  userId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
  lastReviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type SpacedRepetition = {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
};
