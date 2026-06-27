# AI Learning Platform — Implementation Plan

## Tech Stack
- **Framework:** Next.js 16.2.6 (App Router)
- **ORM:** Sequelize + sequelize-cli
- **Database:** Supabase PostgreSQL + pgvector
- **File Storage:** Supabase Storage
- **Auth:** NextAuth.js (existing, keep)
- **UI:** Material UI v9 + Tailwind CSS v4
- **AI:** Pluggable provider architecture (default: Gemini 2.5 Pro)
- **Language:** TypeScript

---

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│                 Next.js 16 App                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Auth     │ │ Learning │ │  Dashboard &     │  │
│  │  Pages   │ │ Interface│ │  Library         │  │
│  └──────────┘ └──────────┘ └──────────────────┘  │
│  ┌──────────────────────────────────────────────┐ │
│  │           API Routes (REST)                   │ │
│  └──────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│   Sequelize ORM (single instance)                 │
├──────────────────────────────────────────────────┤
│         Supabase PostgreSQL + pgvector            │
│              Supabase Storage                     │
└──────────────────────────────────────────────────┘
```

---

## Memory Architecture (Layered)

```
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 1: DATABASE (Permanent, structured)                       │
│  • user_books: current chapter, progress %, learning mode        │
│  • learning_sessions: time spent per session                     │
│  • quiz_attempts: scores, weak/strong topics per quiz            │
│  • conversation_messages: EVERY chat message ever stored         │
│  • flashcard_reviews: spaced repetition intervals                │
│  • revision_schedules: what to review on which date              │
│                                                                    │
│  LAYER 2: EMBEDDINGS (Semantic search via pgvector)               │
│  • Each chapter/section stored as vector(1536) embedding         │
│  • User question → semantic search on completed chapters only    │
│                                                                    │
│  LAYER 3: PROMPT CONTEXT (Assembled per request)                  │
│  Every AI request assembles:                                      │
│    1. Current chapter content                                     │
│    2. Last 5-10 conversation messages                             │
│    3. Quiz performance summary (weak/strong topics)               │
│    4. Previous chapter summaries (concise)                        │
│    5. Learning mode preference                                    │
│  → All injected into the AI provider prompt                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## AI Provider Architecture (Pluggable)

```
lib/ai/
├── providers/
│   ├── BaseProvider.ts          # Abstract interface
│   │   - chat(req): Response
│   │   - chatStream(req): AsyncIterable<string>
│   │   - generateEmbedding(text): number[]
│   │   - name: string
│   ├── GeminiProvider.ts        # Google Gemini (default)
│   ├── OpenAIProvider.ts        # GPT-4o / o3 (future)
│   └── ClaudeProvider.ts        # Anthropic Claude (future)
├── types.ts                     # Unified request/response types
├── registry.ts                  # getProvider(model?): BaseAIProvider
└── index.ts                     # Public API
```

Provider selected via `AI_PROVIDER` env var or per-user `preferredModel` column.

---

## Phase 1: Foundation & Infrastructure

**Goal:** Install deps, set up Supabase client, build pluggable AI provider layer, update env.

### Dependencies to install
```bash
npm install @supabase/supabase-js @google/generative-ai mammoth pdf-parse epub-parser react-markdown rehype-highlight
```

### Files to CREATE

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client singleton (storage + anon key) |
| `lib/ai/types.ts` | Unified `AIProviderConfig`, `AIChatMessage`, `AIChatRequest`, `AIChatResponse` |
| `lib/ai/providers/BaseProvider.ts` | Abstract class: `chat()`, `chatStream()`, `generateEmbedding()`, `name` |
| `lib/ai/providers/GeminiProvider.ts` | Implements `BaseProvider` using `@google/generative-ai` |
| `lib/ai/registry.ts` | `getProvider(model?)` — returns correct provider by name/env |
| `lib/ai/index.ts` | Re-exports `getProvider` and types |

### Files to MODIFY

| File | Changes |
|------|---------|
| `.env` | Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, `AI_PROVIDER=gemini` |

### Test & Verify (Strong Rule)

| # | Test | How |
|---|------|-----|
| 1 | `npm install` succeeds | Run command, no errors |
| 2 | `npm run dev` starts on port 3000 | Visit `http://localhost:3000` |
| 3 | Supabase client connects | Init client, list storage buckets |
| 4 | AI provider instantiates | `getProvider().chat({messages: [{role:"user",content:"hello"}]})` → returns response |
| 5 | Provider switching works | Set `AI_PROVIDER` to different value, verify different provider loaded |

**If any test fails → Phase 1 is BLOCKED. Do not proceed.**

---

## Phase 2: Database Schema — New Models + Migration

**Goal:** Create all 11 new models, drop all 6 old models, create migration, update init.

### Files to CREATE (11 models)

| File | Key Fields |
|------|------------|
| `models/Book.ts` | id, userId, title, author, fileType, fileUrl, status(enum: PROCESSING/READY/ERROR), totalChapters |
| `models/BookChapter.ts` | id, bookId, index, title, content, embedding(vector(1536)), summary, keyPoints(JSONB) |
| `models/UserBook.ts` | id, userId, bookId, currentChapterIndex, learningMode(enum:BEGINNER/STUDENT/INTERVIEW/ADVANCED), learningGoal, dailyStudyMinutes, completed(boolean) |
| `models/LearningSession.ts` | id, userId, bookId, chapterId, duration(seconds), type(enum:LESSON/QUIZ/REVISION/CHAT) |
| `models/Quiz.ts` | id, bookId, chapterId, type(enum:MCQ/SHORT_ANSWER/CODING/SCENARIO), questions(JSONB) |
| `models/QuizAttempt.ts` | id, userId, quizId, score, totalQuestions, answers(JSONB), feedback(JSONB), weakTopics(JSONB), strongTopics(JSONB) |
| `models/Flashcard.ts` | id, userId, bookId, chapterId, front, back, difficulty |
| `models/FlashcardReview.ts` | id, flashcardId, easeFactor, interval, repetitions, nextReviewAt |
| `models/ConversationMessage.ts` | id, userId, bookId, chapterId, role(enum:USER/AI), content, metadata(JSONB) |
| `models/UserNote.ts` | id, userId, bookId, chapterId, content, type(enum:NOTE/HIGHLIGHT/BOOKMARK), pageRef(string) |
| `models/RevisionSchedule.ts` | id, userId, bookId, chapterId, scheduledAt, completedAt, interval(days) |

All models use: UUID PK, timestamps, proper FK with CASCADE, indexed.

### Files to DELETE (6 old models)

- `models/Goal.ts`
- `models/Project.ts`
- `models/Task.ts`
- `models/Resource.ts`
- `models/DailyLog.ts`
- `models/Streak.ts`

### Files to MODIFY

| File | Changes |
|------|---------|
| `lib/db/init.ts` | Remove all old imports/associations. Add new 11 model imports. Add all new associations |
| `lib/db/sequelize.ts` | REMOVE `sequelize.sync({ alter: true })`. App must use migrations only in all envs |

### Migration: `migrations/20260607121600-create-learning-platform.js`

```
up:
1. CREATE EXTENSION IF NOT EXISTS vector
2. DROP TABLE IF EXISTS goals, projects, tasks, resources, daily_logs, streaks, ai_questions CASCADE
3. CREATE TABLE books (...)
4. CREATE TABLE book_chapters (...)
5. CREATE TABLE user_books (...)
6. CREATE TABLE learning_sessions (...)
7. CREATE TABLE quizzes (...)
8. CREATE TABLE quiz_attempts (...)
9. CREATE TABLE flashcards (...)
10. CREATE TABLE flashcard_reviews (...)
11. CREATE TABLE conversation_messages (...)
12. CREATE TABLE user_notes (...)
13. CREATE TABLE revision_schedules (...)
All with proper FK, indexes, enums

down: DROP all new tables, recreate old tables
```

### Model Associations (in `init.ts`)

```
User ──hasMany──> Book
User ──hasMany──> UserBook
User ──hasMany──> LearningSession
User ──hasMany──> QuizAttempt
User ──hasMany──> Flashcard
User ──hasMany──> ConversationMessage
User ──hasMany──> UserNote
User ──hasMany──> RevisionSchedule

Book ──belongsTo──> User
Book ──hasMany──> BookChapter
Book ──hasMany──> Quiz
Book ──hasMany──> UserBook

BookChapter ──belongsTo──> Book
BookChapter ──hasMany──> LearningSession
BookChapter ──hasMany──> Quiz
BookChapter ──hasMany──> Flashcard
BookChapter ──hasMany──> UserNote
BookChapter ──hasMany──> RevisionSchedule

UserBook ──belongsTo──> User, Book
Quiz ──belongsTo──> Book, BookChapter
QuizAttempt ──belongsTo──> User, Quiz
Flashcard ──belongsTo──> User, Book, BookChapter
FlashcardReview ──belongsTo──> Flashcard
ConversationMessage ──belongsTo──> User, Book, BookChapter
UserNote ──belongsTo──> User, Book, BookChapter
RevisionSchedule ──belongsTo──> User, Book, BookChapter
LearningSession ──belongsTo──> User, Book, BookChapter
```

### Test & Verify (Strong Rule)

| # | Test | How |
|---|------|-----|
| 1 | `npm run db:migrate` exits with code 0 | Run command, check exit code |
| 2 | All 11 new tables exist | `psql` or Supabase table editor |
| 3 | Old tables are gone | `goals`, `projects`, `tasks`, etc. should not exist |
| 4 | pgvector extension exists | `SELECT * FROM pg_extension WHERE extname='vector'` |
| 5 | Models load without error | `npm run dev` → no model import errors |
| 6 | All associations work | Create User → create Book → create BookChapter → query relationships |
| 7 | `npx tsc --noEmit` passes | No TypeScript errors |

**If any table missing or TS error → Phase 2 is BLOCKED.**

---

## Phase 3: Update Types & Validators

**Goal:** Replace all TaskFlow AI types/validators with Learning Platform types.

### Files to MODIFY

| File | Changes |
|------|---------|
| `types/index.ts` | DELETE: Goal, Priority, GoalStatus, Project, ProjectStatus, Task, TaskStatus, Resource, ResourceType, DailyLog, Mood, Streak, AIQuestion, AICategory, all old Input types, DashboardStats, Activity, ChartDataPoint, ActivityCalendarData |
| | ADD: Book, BookStatus(PROCESSING/READY/ERROR), BookChapter, UserBook, LearningMode(BEGINNER/STUDENT/INTERVIEW/ADVANCED), SessionType(LESSON/QUIZ/REVISION/CHAT), Quiz, QuestionType(MCQ/SHORT_ANSWER/CODING/SCENARIO), QuizAttempt, Flashcard, FlashcardReview, ConversationMessage, MessageRole(USER/AI), UserNote, NoteType(NOTE/HIGHLIGHT/BOOKMARK), RevisionSchedule, LearningStats, WeakTopic, StrongTopic |
| `utils/validators.ts` | DELETE: all old Zod schemas. ADD: UploadBookSchema, UpdateUserBookSchema, ChatMessageSchema, QuizSubmitSchema, CreateNoteSchema, GenerateQuizSchema, ReviewFlashcardSchema, BookSearchSchema, RevisionCompleteSchema |

### Test & Verify

| # | Test | How |
|---|------|-----|
| 1 | `npx tsc --noEmit` passes | No type errors |
| 2 | All old type references removed | `rg "Goal\|DailyLog\|Streak" types/` → no matches |
| 3 | New validators parse correctly | Validate sample data with Zod → success/failure expected |

---

## Phase 4: Book Upload & Text Extraction Pipeline

**Goal:** Upload files → Supabase Storage → Extract text → Split chapters → Generate embeddings → Store in pgvector.

### Files to CREATE

| File | Purpose |
|------|---------|
| `app/api/books/upload/route.ts` | POST: multipart file → Supabase Storage → create Book(processing) → trigger text extraction → return book ID |
| `app/api/books/route.ts` | GET: list user's books with progress info. POST: create empty book record |
| `app/api/books/[id]/route.ts` | GET: book detail with chapters list. DELETE: remove book + storage file + all related data CASCADE |
| `lib/text-extraction.ts` | `extractText(buffer, fileType)` — routes to PDF/EPUB/DOCX/MD parser. `detectChapters(text)` — splits by headings. Returns `{chapters: [{title, content}]}` |
| `lib/embeddings.ts` | `generateEmbedding(text)` — calls `getProvider().generateEmbedding(text)`. `generateBatchEmbeddings(chapters)` — batch process |

### Upload Flow

```
1. Receive file → validate type (pdf/epub/docx/md)
2. Upload to Supabase Storage bucket `book-uploads/{userId}/{bookId}/{filename}`
3. Get public URL
4. Create Book record (status: PROCESSING)
5. Extract text (await)
6. Detect chapters (await)
7. For each chapter:
   a. Generate embedding vector(1536) via Gemini
   b. Create BookChapter record with embedding
8. Update Book: status=READY, totalChapters=count
9. Create UserBook record (currentChapterIndex=0)
10. Return book ID
```

### Test & Verify (Strong Rule)

| # | Test | How |
|---|------|-----|
| 1 | Upload PDF via curl | `curl -X POST -F "file=@test.pdf" http://localhost:3000/api/books/upload` → returns book ID |
| 2 | File exists in Supabase Storage | Check Supabase dashboard bucket |
| 3 | Book record created with status PROCESSING→READY | `SELECT * FROM books WHERE id='{bookId}'` |
| 4 | Chapters detected | `SELECT count(*) FROM book_chapters WHERE bookId='{bookId}'` > 0 |
| 5 | Embeddings have correct dims | `SELECT length(embedding) FROM book_chapters LIMIT 1` = 1536 |
| 6 | UserBook record created | `SELECT * FROM user_books WHERE bookId='{bookId}'` → currentChapterIndex=0 |
| 7 | Upload invalid file → rejected with 400 | `curl -F "file=@test.exe" ...` → error |
| 8 | Upload large PDF (50MB) → processed successfully | Verify end-to-end |
| 9 | `npx tsc --noEmit` passes | No errors |

---

## Phase 5: AI Teaching Engine (RAG + Chat + Progress)

**Goal:** Chat with AI tutor that has full context of book, position, and learning history. Track progress.

### Files to CREATE

| File | Purpose |
|------|---------|
| `app/api/learn/[bookId]/chat/route.ts` | POST: user message → build context → call AI → stream response → store ConversationMessage |
| `app/api/learn/[bookId]/progress/route.ts` | GET: current progress for this book. PUT: update currentChapterIndex, mark chapter complete |
| `app/api/learn/[bookId]/search/route.ts` | POST: search query → semantic search on book_chapters embedding → return relevant sections |
| `lib/rag.ts` | Context assembly, prompt building, semantic search, conversation history, weak topic retrieval |

### Context Assembly (`lib/rag.ts`)

```
buildLearningContext() returns:
{
  systemPrompt: `You are an expert tutor teaching ${bookTitle}.
    Learning mode: ${mode}.
    The user has completed up to chapter ${currentChapterIndex}.
    Weak topics: ${weakTopics}. Strong topics: ${strongTopics}.`,
  currentChapter: full text of current chapter,
  conversationHistory: last 10 messages,
  revisionDue: any revision items due today
}
```

Then sent to AI: `chat({ messages: [system, ...conversationHistory, userMessage] })`

### Test & Verify (Strong Rule)

| # | Test | How |
|---|------|-----|
| 1 | Chat with current chapter context | Send "Explain section 1.1" → response references correct chapter |
| 2 | Previous chapter context | Send "Remind me what we learned in chapter 1" → correctly recalls |
| 3 | Future chapter blocked | Send "What's in chapter 5?" → "We haven't reached that yet" |
| 4 | Learning mode changes response | Switch to Interview mode → response is interview-focused |
| 5 | Progress tracking | PUT progress → GET progress returns updated value |
| 6 | Semantic search returns relevant results | Search "variable naming" → returns chapter 2 results |
| 7 | Conversation stored | `SELECT count(*) FROM conversation_messages` increases after each message |
| 8 | Streaming works | Response arrives token-by-token |

---

## Phase 6: Assessment & Memory System

**Goal:** Quiz generation, grading, flashcards with SM-2, spaced repetition revision, notes.

### Files to CREATE

| File | Purpose |
|------|---------|
| `app/api/learn/[bookId]/quiz/generate/route.ts` | POST: chapterId, questionTypes, count → AI generates quiz → store Quiz → return questions |
| `app/api/learn/[bookId]/quiz/submit/route.ts` | POST: quizId, answers → AI grades each → score + feedback → update weak/strong topics → store QuizAttempt |
| `app/api/learn/[bookId]/flashcards/route.ts` | POST: chapterId → AI generates flashcards → store. GET: list due flashcards |
| `app/api/learn/[bookId]/flashcards/review/route.ts` | POST: flashcardId, quality(0-5) → SM-2 → calculate nextReviewAt → store FlashcardReview |
| `app/api/learn/[bookId]/notes/route.ts` | GET: list notes. POST: create note. DELETE: remove note |
| `app/api/learn/[bookId]/revision/route.ts` | GET: list due revision. POST: mark complete, schedule next interval (1→3→7→15→30) |
| `lib/spaced-repetition.ts` | SM-2 algorithm: `calculateNextReview(quality, repetitions, easeFactor)` |

### SM-2 Algorithm

```
if quality < 3:    repetitions=0, interval=1
else if reps==0:   interval=1
else if reps==1:   interval=6
else:              interval=round(prev * easeFactor)
easeFactor = max(1.3, EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02)))
nextReviewAt = now + interval days
```

### Test & Verify (Strong Rule)

| # | Test | How |
|---|------|-----|
| 1 | Generate quiz for chapter | POST generate → returns N questions with correct structure |
| 2 | Different question types work | MCQ, short answer, coding scenario → each returns correct format |
| 3 | Submit answers → graded | POST submit → returns score + per-question feedback + mistake explanation |
| 4 | Weak topics tracked | Wrong answers → checked `weakTopics` in QuizAttempt |
| 5 | Generate flashcards | POST generate → returns cards with front/back |
| 6 | SM-2 interval calculation | Review quality=5 first time → interval=1. Again quality=5 → interval=6 |
| 7 | Quality=1 (forgot) resets | interval=1, repetitions=0 |
| 8 | Create and retrieve notes | POST note → GET notes → note appears |
| 9 | Revision schedule works | Complete chapter → schedule at 1 day → GET revision returns it |
| 10 | Intervals progress | 1→3→7→15→30 days on successive completions |

---

## Phase 7: UI Pages

**Goal:** Build all user-facing pages — Library, Upload, Learn, Quiz, Flashcards, Notes, Revision.

### Files to CREATE (15 files)

**Pages (7 files):**

| File | Key Features |
|------|-------------|
| `app/(dashboard)/library/page.tsx` | Grid of BookCards, progress per book, "Continue" button, search/filter, empty state |
| `app/(dashboard)/upload/page.tsx` | Drag-drop zone, file picker, supported format badges, upload progress bar, success/error states |
| `app/(dashboard)/learn/[bookId]/page.tsx` | Split view: left=chapter content (60%), right=AI chat (40%). Progress bar, mode selector, reading time |
| `app/(dashboard)/learn/[bookId]/quiz/page.tsx` | Stepper for questions, progress indicator, timer, submit flow, results with per-question feedback |
| `app/(dashboard)/learn/[bookId]/flashcards/page.tsx` | Flip animation, swipe (know/don't know), progress counter, difficulty buttons |
| `app/(dashboard)/learn/[bookId]/notes/page.tsx` | List grouped by chapter, edit/delete, search |
| `app/(dashboard)/revision/page.tsx` | Calendar, today's due items, "Start Revision" button, progress per item |

**Components (8 files):**

| File | Purpose |
|------|---------|
| `components/learn/ChapterContent.tsx` | Renders chapter markdown with code highlighting, section nav buttons |
| `components/learn/AIChat.tsx` | Chat bubbles, streaming text, typing indicator, input, auto-scroll |
| `components/learn/LearningModeSelector.tsx` | Dropdown/chips: Beginner, Student, Interview, Advanced |
| `components/learn/QuizCard.tsx` | MCQ (radio), short answer (text), coding (code area). Shows correct/wrong after submit |
| `components/learn/Flashcard.tsx` | Flippable card with CSS 3D transform, animated flip |
| `components/learn/ProgressBar.tsx` | Segmented bar, percentage display |
| `components/learn/BookCard.tsx` | Cover placeholder, title, author, progress %, "Continue" button |
| `components/learn/FileUploader.tsx` | Drag-drop zone, file validation, upload progress |

### Files to MODIFY (3 existing)

| File | Changes |
|------|---------|
| `components/common/Sidebar.tsx` | Nav items → Dashboard, Library, Upload, Revision. Remove old ones. Brand "TF" → "AI" |
| `components/common/Navbar.tsx` | "TaskFlow AI" → "AI Tutor". Update gradient colors |
| `app/layout.tsx` | metadata.title → "AI Tutor - Smart Learning Platform" |

### Test & Verify (Strong Rule)

| # | Test | How |
|---|------|-----|
| 1 | All pages render | Navigate each route → no crash |
| 2 | Library shows books with progress | After upload, library shows the book |
| 3 | Upload validates | Unsupported format → error. Valid file → progress bar |
| 4 | Learn layout works | Chapter content left, chat right. Mobile → stacks |
| 5 | Chat sends and receives | Type message → API response shows in chat |
| 6 | Quiz flow works | Walk through → submit → score + feedback |
| 7 | Flashcard flips | Click → animates to back. Click again → front |
| 8 | Notes display | Create note via API → appears in notes page |
| 9 | Revision shows due items | Scheduled revision → appears on revision page |
| 10 | Sidebar navigation works | Each link → correct route |
| 11 | Responsive down to 375px | No layout breakage |
| 12 | Dark mode works on all new pages | Toggle → all pages respect it |
| 13 | `npx tsc --noEmit` passes | No type errors |

---

## Phase 8: Dashboard & Final Integration

**Goal:** Replace dashboard with learning stats. End-to-end validation.

### Files to MODIFY

| File | Changes |
|------|---------|
| `app/(dashboard)/dashboard/page.tsx` | Full rewrite: active book card, current chapter, overall progress, daily goal + timer, study streak, quiz accuracy %, weak/strong topics, upcoming revision, activity feed |
| `components/common/Sidebar.tsx` | Final pass — all links working, active state correct |

### Files to CREATE

| File | Purpose |
|------|---------|
| `components/learn/DashboardStats.tsx` | Stats grid: progress, streak, quiz accuracy, time, topics |

### End-to-End Test (Strong Rule)

```
1. Register a new user
2. Upload a small PDF (3-5 page sample)
3. Wait for processing (poll until READY)
4. Library → book appears with "Continue" and 0%
5. Click "Continue" → Learn page at Chapter 1
6. Chapter content displays with estimated reading time
7. Chat: "Summarize this chapter" → correct summary
8. Switch to Interview mode → AI changes style
9. Generate quiz → answer questions
10. Submit quiz → score + feedback + weak topics
11. Generate flashcards → flip and review
12. Mark Chapter 1 complete → progress = 1/totalChapters
13. Dashboard shows: progress, quiz accuracy, weak topics, streak=1
14. Next day → Revision page shows Chapter 1 as "due"
15. Complete revision → schedule moves to 3-day interval
16. Learn → starts at Chapter 2
17. Chat: "What was chapter 1 about?" → correct reference
18. Dark mode works on all pages
19. Mobile width (375px) — no breakage
```

**If any step fails → Phase 8 is BLOCKED.**

---

## Summary: All Files Changed

| Phase | Create | Modify | Delete | Strong Rule |
|-------|--------|--------|--------|-------------|
| P1: Foundation | 6 | 1 | 0 | AI provider responds |
| P2: Database | 11 | 3 | 6 | Migration succeeds, all tables exist |
| P3: Types | 0 | 2 | 0 | TypeScript passes |
| P4: Upload | 5 | 0 | 0 | Upload processes book end-to-end |
| P5: AI Engine | 4 | 0 | 0 | Chat responds with correct context |
| P6: Assessment | 7 | 0 | 0 | Quiz grades, SM-2 calculates correctly |
| P7: UI Pages | 15 | 3 | 0 | All pages render, responsive |
| P8: Dashboard | 1 | 2 | 0 | Full end-to-end flow passes |
| **Total** | **49** | **11** | **6** | |
