export { LoginSchema, RegisterSchema } from "./auth";
export type { LoginInput, RegisterInput } from "./auth";

export { UploadBookSchema, UpdateUserBookSchema } from "./book";
export type { UploadBookInput, UpdateUserBookInput } from "./book";

export { GenerateQuizSchema, QuizSubmitSchema, ChatMessageSchema } from "./quiz";
export type { GenerateQuizInput, QuizSubmitInput, ChatMessageInput } from "./quiz";

export { CreateNoteSchema } from "./note";
export type { CreateNoteInput } from "./note";

export { ReviewFlashcardSchema } from "./flashcard";
export type { ReviewFlashcardInput } from "./flashcard";

export { BookSearchSchema, SearchSchema, PaginationSchema, RevisionCompleteSchema } from "./search";
export type { BookSearchInput, RevisionCompleteInput } from "./search";
