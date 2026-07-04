import type { Section } from "./chapter";

export type SearchQuery = {
  query: string;
  limit?: number;
  filters?: Record<string, any>;
};

export type SearchResult<T = any> = {
  items: T[];
  total: number;
  page: number;
};

export type SectionSearchResult = {
  section: Section;
  score: number;
  chapterTitle: string;
  bookTitle: string;
};
