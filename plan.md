# AI Learning Platform — Implementation Plan

## Tech Stack
- **Framework:** Next.js 16.2.6 (App Router)
- **ORM:** Sequelize + sequelize-cli
- **Database:** Supabase PostgreSQL + pgvector
- **File Storage:** Supabase Storage
- **Auth:** NextAuth.js (existing, keep)
- **Queue:** PG-Boss (PostgreSQL-native background job processing)
- **AI Model:** Gemini 2.5 Flash (Primary) (Optional Upgrade: Gemini 2.5 Pro)
- **PDF Processing:** MuPDF.js (via Node.js library `@mupdf/mupdf` or a microservice)
- **Language:** TypeScript

---

## Architecture Overview

```
src/
├── app/api/           # Thin route handlers (HTTP only → delegate to services)
├── features/*/services/  # Domain business logic (orchestrates repos + AI + queue)
├── repositories/      # Data access layer (wraps Sequelize models)
├── models/            # Sequelize model definitions
├── queue/             # PG-Boss queue setup
├── workers/           # PG-Boss workers (background AI pipeline)
├── lib/               # Shared infrastructure (db, supabase, ai providers, helpers)
├── validations/       # Zod schemas (shared across routes + services)
├── types/             # TypeScript type definitions
└── middleware.ts      # Next.js middleware (auth redirect)
```

### Data Flow

```
API Route (thin)
  → Validates with Zod (validations/)
  → Calls Feature Service (features/*/services/)
    → Service calls Repository (repositories/) for DB
    → Service calls AIService (features/ai/services/) for AI
    → Service calls Queue (queue/) for background jobs
  → Returns JSON response
```

---

## Memory Architecture (Layered & Section-Level)

```
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 1: DATABASE (Permanent, structured)                       │
│  • user_books: current chapter, progress %, learning mode        │
│  • learning_sessions: time spent per session                     │
│  • quiz_attempts: scores, weak/strong topics per quiz            │
│  • conversation_messages: EVERY chat message ever stored         │
│  • flashcard_reviews: spaced repetition intervals                │
│  • processing_jobs: background job tracking                      │
│                                                                    │
│  LAYER 2: EMBEDDINGS (Semantic search via pgvector on Sections)   │
│  • Each logical section explanation stored as vector(1536)       │
│  • User question → semantic search on COMPLETED sections only     │
│  • Sends ONLY relevant section texts to minimize context & cost   │
│                                                                    │
│  LAYER 3: PROMPT CONTEXT (Assembled per request)                  │
│  Every AI request assembles:                                      │
│    1. Relevant retrieved sections (Semantic Search match)        │
│    2. Current chapter summaries (concise)                         │
│    3. Last 5-10 conversation messages                             │
│    4. Quiz performance summary (weak/strong topics)               │
│    5. Learning mode preference (Beginner, Student, Interview)     │
│  → All injected into the AI provider prompt                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## AI Provider Architecture (Pluggable)

```
src/features/ai/
├── services/                 # High-level AI orchestration
│   ├── AIService.ts          # Unified facade
│   ├── SectionSplitter.ts    # Split chapter → logical semantic sections
│   ├── ExplanationGenerator.ts # Per-section explanation
│   ├── VerificationService.ts  # Compare original vs generated, fill gaps
│   ├── ContentGenerator.ts    # Summary, flashcards, 17-point material
│   ├── QuizGradingService.ts  # Grade answers, extract weak topics
│   └── ChatService.ts        # Context assembly, RAG, streaming
├── providers/
│   ├── BaseProvider.ts       # Abstract class: chat(), chatStream(), generateEmbedding()
│   ├── GeminiProvider.ts     # Google Gemini (default)
│   ├── OpenAIProvider.ts     # GPT-4o / o3 (future)
│   └── ClaudeProvider.ts     # Anthropic Claude (future)
├── registry.ts
└── types.ts
```

Provider selected via `AI_PROVIDER` env var.

---

## Phase 0: Project Restructure (src/ Directory + Config)

**Goal:** Move root-level code into `src/`, update tsconfig, establish base patterns.

### Files to MOVE

| Current Path | New Path |
|---|---|
| `app/` | `src/app/` |
| `components/` | `src/components/` |
| `lib/` | `src/lib/` |
| `models/` | `src/models/` |
| `types/` | `src/types/` |
| `migrations/` | `src/migrations/` |
| `utils/validators.ts` | `src/validations/` (split into domain files) |
| `utils/helpers.ts` | `src/lib/helpers.ts` |
| `config/` | `src/config/` |
| `middleware.ts` | `src/middleware.ts` |

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/repositories/BaseRepository.ts` | Generic: findById, findAll, create, update, destroy |
| `src/queue/pgboss.ts` | PG-Boss singleton init + graceful shutdown |
| `src/queue/queues.ts` | Job name constants + publish helpers (PG-Boss) |

### Files to DELETE

| File | Reason |
|------|--------|
| `src/queue/connections.ts` | Replaced by PG-Boss (no Redis needed) |

### Files to MODIFY

| File | Changes |
|------|---------|
| `tsconfig.json` | `"@/*": ["./src/*"]` |
| `.sequelizerc` | All paths → `src/models`, `src/migrations`, `src/config` |

### Dependencies to install
```bash
npm install pg-boss
```

### Test & Verify (Strong Rule)

| # | Test | How |
|---|------|-----|
| 1 | `npm run dev` starts on port 3000 | Visit `http://localhost:3000` |
| 2 | `npx tsc --noEmit` passes | All imports resolve under `src/` |
| 3 | `npm run db:migrate` succeeds | Updated sequelizerc paths work |

---

## Phase 1: Foundation & Infrastructure

**Goal:** Install deps, set up Supabase client, PG-Boss queue, text cleaning, service base, AI provider layer.

### Dependencies to install
```bash
npm install @supabase/supabase-js @google/generative-ai mammoth @mupdf/mupdf epub-parser react-markdown rehype-highlight
```

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client singleton (storage + anon key) |
| `src/lib/text-cleaning.ts` | `cleanText(rawText)` — strip headers/footers/page numbers, fix broken words, normalize spacing |
| `src/lib/helpers.ts` | Utility functions (from existing utils/helpers.ts) |
| `src/lib/ai/types.ts` | Unified AIProvider types |
| `src/lib/ai/providers/BaseProvider.ts` | Abstract class |
| `src/lib/ai/providers/GeminiProvider.ts` | Implements BaseProvider |
| `src/lib/ai/registry.ts` | `getProvider(model?)` |
| `src/lib/ai/index.ts` | Re-exports |
| `src/repositories/BaseRepository.ts` | Generic CRUD base class |
| `src/services/BaseService.ts` | Abstract service: getCurrentUser(), validate(), error handling |
| `src/services/AIService.ts` | Facade: splitIntoSections(), generateExplanation(), verifyContent(), generateLearningContent() |
| `src/services/QueueService.ts` | publishBookProcessingJob(), getJobStatus() (wraps PG-Boss) |

### Files to MODIFY

| File | Changes |
|------|---------|
| `.env` | Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, `AI_PROVIDER=gemini`. Add `DATABASE_URL` (same as Sequelize connection) for PG-Boss if not already present |

### Test & Verify (Strong Rule)

| # | Test | How |
|---|------|-----|
| 1 | `npm install` succeeds | Run command, no errors |
| 2 | `npm run dev` starts | Visit `http://localhost:3000` |
| 3 | Supabase client connects | Init client, list storage buckets |
| 4 | AI provider instantiates | `getProvider().chat(...)` → returns response |
| 5 | PG-Boss starts | `boss.start()` resolves, `boss.isConnected` is true |
| 6 | PG-Boss queue works | `boss.send('book-processing', data)` → worker receives it |
| 7 | cleanText works | Input with page numbers → cleaned output |

**If any test fails → Phase 1 is BLOCKED.**

---

## Phase 2: Database Schema — Models & Migrations

**Goal:** Create 13 models, support section-level embeddings, quiz structures, and revision counts.

### Files to CREATE (13 models)

| File | Key Fields |
|------|------------|
| `src/models/User.ts` | id, email(unique), name, image, password, emailVerified |
| `src/models/Book.ts` | id, userId, title, author, fileType, fileUrl, status(enum: PROCESSING/READY/ERROR), totalChapters |
| `src/models/BookChapter.ts` | id, bookId, index, title, rawText, cleanText, fullExplanation, summary, learningMaterial(JSONB) |
| `src/models/Section.ts` | id, chapterId, index, sectionText, explanation, concepts(JSONB), examples(JSONB), definitions(JSONB), embedding(vector(1536)) |
| `src/models/UserBook.ts` | id, userId, bookId, currentChapterIndex, learningMode(enum:BEGINNER/STUDENT/INTERVIEW/ADVANCED), learningGoal, dailyStudyMinutes, completed, quizScores(JSONB), revisionCount, weakTopics(JSONB) |
| `src/models/LearningSession.ts` | id, userId, bookId, chapterId, duration(seconds), type(enum:LESSON/QUIZ/REVISION/CHAT) |
| `src/models/Quiz.ts` | id, bookId, chapterId, type(enum:MCQ/SHORT_ANSWER/CODING/SCENARIO), questions(JSONB) |
| `src/models/QuizAttempt.ts` | id, userId, quizId, score, totalQuestions, answers(JSONB), feedback(JSONB), weakTopics(JSONB), strongTopics(JSONB) |
| `src/models/Flashcard.ts` | id, userId, bookId, chapterId, front, back, difficulty, learningState(enum:NEW/LEARNING/REVIEW) |
| `src/models/FlashcardReview.ts` | id, flashcardId, easeFactor, interval, repetitions, nextReviewAt |
| `src/models/ConversationMessage.ts` | id, userId, bookId, chapterId, role(enum:USER/AI), content, metadata(JSONB) |
| `src/models/UserNote.ts` | id, userId, bookId, chapterId, content, type(enum:NOTE/HIGHLIGHT/BOOKMARK), pageRef(string) |
| `src/models/ProcessingJob.ts` | id, bookId, type(enum:PDF_PROCESSING), status(enum:QUEUED/PROCESSING/COMPLETED/FAILED), progress(int), error(text), pgBossJobId(string), startedAt, completedAt |

All models use: UUID PK, timestamps, proper FK with CASCADE, and indexes.

### Files to DELETE

- `models/AIQuestion.ts`

### Files to MODIFY

| File | Changes |
|------|---------|
| `src/lib/db/init.ts` | Import 13 models. Add all associations. Remove AIQuestion |
| `src/lib/db/sequelize.ts` | Ensure no `sync({ alter: true })` — migrations only |

### Migration: `src/migrations/20260607121600-create-learning-platform.js`

```
up:
1. CREATE EXTENSION IF NOT EXISTS vector
2. DROP TABLE IF EXISTS revision_schedules, ai_questions CASCADE
3. CREATE TABLE books (...)
4. CREATE TABLE book_chapters (...)
5. CREATE TABLE book_sections (id UUID, chapterId UUID, index INT, sectionText TEXT, explanation TEXT, concepts JSONB, examples JSONB, definitions JSONB, embedding vector(1536))
6. CREATE TABLE user_books (...) + quizScores, revisionCount, weakTopics
7. CREATE TABLE learning_sessions (...)
8. CREATE TABLE quizzes (...)
9. CREATE TABLE quiz_attempts (...)
10. CREATE TABLE flashcards (...) + learningState
11. CREATE TABLE flashcard_reviews (...)
12. CREATE TABLE conversation_messages (...)
13. CREATE TABLE user_notes (...)
14. CREATE TABLE processing_jobs (...)
All with proper FK, indexes, enums
```

### Model Associations (in `init.ts`)

```
User ──hasMany──> Book, UserBook, LearningSession, QuizAttempt, Flashcard, ConversationMessage, UserNote
Book ──belongsTo──> User
Book ──hasMany──> BookChapter, Quiz, UserBook, ProcessingJob
BookChapter ──belongsTo──> Book
BookChapter ──hasMany──> Section, LearningSession, Quiz, Flashcard, UserNote
Section ──belongsTo──> BookChapter
UserBook ──belongsTo──> User, Book
Quiz ──belongsTo──> Book, BookChapter
QuizAttempt ──belongsTo──> User, Quiz
Flashcard ──belongsTo──> User, Book, BookChapter
FlashcardReview ──belongsTo──> Flashcard
ConversationMessage ──belongsTo──> User, Book, BookChapter
UserNote ──belongsTo──> User, Book, BookChapter
LearningSession ──belongsTo──> User, Book, BookChapter
ProcessingJob ──belongsTo──> Book
```

### Test & Verify (Strong Rule)

| # | Test | How |
|---|------|-----|
| 1 | `npm run db:migrate` exits with code 0 | Run command, check exit code |
| 2 | All 13 tables exist | `psql` or Supabase table editor |
| 3 | book_sections has vector column | `SELECT embedding FROM book_sections LIMIT 1` |
| 4 | revision_schedules and ai_questions gone | `\dt revision_schedules` → error |
| 5 | pgvector extension exists | `SELECT * FROM pg_extension WHERE extname='vector'` |
| 6 | Models load without error | `npm run dev` → no import errors |
| 7 | `npx tsc --noEmit` passes | No TypeScript errors |

---

## Phase 3: Types & Validators

**Goal:** Create domain-specific types and validators. Keep revision / weak-topics types.

### Files to CREATE

| File | Contents |
|------|----------|
| `src/types/book.ts` | Book, BookStatus, BookChapter |
| `src/types/chapter.ts` | Section, SectionExplanation, VerificationResult, LearningContent |
| `src/types/quiz.ts` | Quiz, QuizAttempt, QuestionType, RevisionSchedule |
| `src/types/flashcard.ts` | Flashcard, FlashcardReview, SpacedRepetition |
| `src/types/note.ts` | UserNote, NoteType |
| `src/types/search.ts` | SearchQuery, SearchResult, SectionSearchResult |
| `src/types/queue.ts` | ProcessingJob, JobStatus, BookProcessingJobData |
| `src/types/index.ts` | Re-exports all domain types + shared types |

| File | Schemas |
|------|---------|
| `src/validations/auth.ts` | LoginSchema, RegisterSchema |
| `src/validations/book.ts` | UploadBookSchema |
| `src/validations/quiz.ts` | GenerateQuizSchema, QuizSubmitSchema |
| `src/validations/note.ts` | CreateNoteSchema |
| `src/validations/flashcard.ts` | ReviewFlashcardSchema |
| `src/validations/search.ts` | BookSearchSchema, NoteSearchSchema |

### Test & Verify

| # | Test | How |
|---|------|-----|
| 1 | `npx tsc --noEmit` passes | No type errors |
| 2 | Revision and Section types referenced correctly | `rg "Section\|Revision" src/types/` shows valid structures |
| 3 | New validators parse correctly | Validate sample data with Zod → success/failure expected |

---

## Phase 4: Upload & AI Processing Pipeline

**Goal:** Upload files → Store PDF → Create record → Background job (PG-Boss) → Stage 1 (Extract & Clean) → Stage 2 (Logical splitting & Section AI gen & Verification) → Stage 3 (Generate learning content).

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/features/books/services/BookUploadService.ts` | Orchestrates: validate → storage → extract → clean → chapters → enqueue job |
| `src/features/ai/services/SectionSplitter.ts` | AI call: split chapter content into logical sections (Introduction, Concepts, Summary) |
| `src/features/ai/services/ExplanationGenerator.ts` | AI call: generate explanation + definitions + examples + formulas + memory tips per section |
| `src/features/ai/services/VerificationService.ts` | AI call: compare original chapter vs generated, check 8 missing items, regenerate |
| `src/features/ai/services/ContentGenerator.ts` | AI call: generate the comprehensive 17-point learning materials list |
| `src/workers/bookProcessingWorker.ts` | PG-Boss work handler: `boss.work('book-processing', handler)` — processes each chapter through the pipeline |

### Files to MODIFY

| File | Changes |
|------|---------|
| `src/lib/text-extraction.ts` | Update to use **MuPDF.js** to extract page text, preserving reading order, paragraphs, headings, and tables. |
| `src/lib/embeddings.ts` | Update to create embeddings for **individual Sections** (not full chapters). |

### Upload Flow

```
POST /api/books/upload
  1. Receive file → validate type (pdf/epub/docx/md)
  2. Upload to Supabase Storage bucket `book-uploads/{userId}/{bookId}/{filename}`
  3. Create Book record (status: PROCESSING)
  4. Extract text via @mupdf/mupdf (or mammoth / epub-parser for others)
     - Maintain reading order, headings, paragraphs, tables
  5. Clean text (remove headers/footers/page numbers, normalize spacing, resolve broken words)
  6. Detect chapters (TOC detection, heading detection)
  7. Create ProcessingJob record (status: QUEUED) with pgBossJobId initially null
  8. Publish PG-Boss job: `boss.send('book-processing', { bookId, chapters[] }, { retryLimit: 2, retryDelay: 60 })` → update ProcessingJob.pgBossJobId
  9. Return { bookId, status: "PROCESSING" }
```

### Background Worker Flow

```
boss.work('book-processing', async (job) => {
  const { bookId, chapters } = job.data;
  Update ProcessingJob: status=PROCESSING (find by pgBossJobId=job.id)

  For each chapter:
    1. SectionSplitter.split(content) → split into logical sections (NOT 500 words chunking; keep complete topics together)
    2. For each logical section:
       - ExplanationGenerator.generate(sectionText)
         → { explanation, concepts, definitions, examples, formulas, keywords, commonMistakes, memoryTips }
    3. Combine all section explanations → rawExplanation
    4. VerificationService.verify(originalChapter, rawExplanation)
       - Compare original against rawExplanation. Check for missing:
         [concepts, definitions, examples, theorems, formulas, diagram descriptions, warnings, conclusions]
       - If missing → AI regenerates ONLY missing parts → Appends them to form Final Verified Chapter Explanation
    5. ContentGenerator.generate(finalChapterExplanation)
       - Generates the 17-point learning contents:
         [beginner explanation, detailed explanation, key concepts, definitions, examples, real-world apps, chapter summary, flashcards, revision notes, memory tricks, MCQs, short-answer questions, long-answer questions, coding tasks, practical assignments, interview questions, difficulty level]
    6. For each section:
       - Generate embedding vector for { sectionText + explanation }
       - Save to `book_sections` table
    7. Save BookChapter with rawText, cleanText, finalExplanation, summary, and learningMaterial (containing flashcards, MCQs, and 17-point content)
    Update ProcessingJob.progress

  After all chapters:
    Update Book: status=READY, totalChapters=N
    Create UserBook (currentChapterIndex=0, status=READY)
    Update ProcessingJob: status=COMPLETED
    await job.done();
});
```

### Test & Verify (Strong Rule)

| # | Test | How |
|---|------|-----|
| 1 | Upload PDF via curl | `curl -X POST -F "file=@test.pdf" http://localhost:3000/api/books/upload` → returns book ID |
| 2 | MuPDF.js preserves tables | Check console logs during extraction or inspect db |
| 3 | Job enqueued and processed | Worker starts, splits into sections, runs verification, saves |
| 4 | Book transitions PROCESSING→READY | Poll `GET /api/books/{id}` until READY |
| 5 | Sections have embeddings | `SELECT embedding FROM book_sections LIMIT 1` returns vectors |
| 6 | Verification appends missing | Verify verification loops work by inserting an artificial gap |
| 7 | `npx tsc --noEmit` passes | No errors |

---

## Phase 5: AI Teaching Engine (RAG & Section Search)

**Goal:** Chat with AI tutor using section-level vector search context (RAG) and active chapter references.

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/features/ai/services/ChatService.ts` | Context assembly: system prompt + relevant section texts + current chapter summary + conversation history + weak topics → call Gemini → stream |
| `src/services/SearchService.ts` | Semantic search on **`book_sections`** via pgvector (vector match) |
| `src/services/ProgressService.ts` | Get/update current chapter, mark complete, track sessions |
| `src/features/notes/services/NoteSearchService.ts` | Search notes by text content |

### Repositories to CREATE

| File | Data Access For |
|------|----------------|
| `src/repositories/ChapterRepository.ts` | book_chapters |
| `src/repositories/SectionRepository.ts` | book_sections |
| `src/repositories/UserBookRepository.ts` | user_books |
| `src/repositories/ConversationRepository.ts` | conversation_messages |

### API Routes to CREATE

| Route | Method | Handler calls |
|-------|--------|---------------|
| `src/app/api/learn/[bookId]/chat/route.ts` | POST | ChatService.chat() → streams response |
| `src/app/api/learn/[bookId]/progress/route.ts` | GET, PUT | ProgressService |
| `src/app/api/learn/[bookId]/search/route.ts` | POST | SearchService.search() |

### RAG Flow & Source Citation

```
User: "What is Polymorphism?"
  1. Retrieve vector embedding for user query
  2. Query book_sections for top cosine matches
  3. Send ONLY relevant sections to Gemini
  4. System prompt enforces:
     - Provide answers derived only from the relevant text
     - Cite source explicitly: [Chapter X, Section Y, Example Z]
```

---

## Phase 6: Assessment & Memory System (With Revision Mode)

**Goal:** Dynamic interactive practice, quiz grading, SM-2 flashcard reviews, and revision mode.

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/features/quizzes/services/QuizService.ts` | Generate quiz, submit, grade via AI |
| `src/features/ai/services/QuizGradingService.ts` | AI call: grade short answers/assignments → scores, feedback, weak topics |
| `src/features/notes/services/NoteService.ts` | Note CRUD |
| `src/services/FlashcardService.ts` | Generate flashcards, list due, SM-2 reviews |
| `src/lib/spaced-repetition.ts` | SM-2 algorithm: `calculateNextReview(quality, repetitions, easeFactor)` |
| `src/services/RevisionService.ts` | Analyze weak topics, generate revision quizzes, and daily reviews |

### Repositories to CREATE

| File | Data Access For |
|------|----------------|
| `src/repositories/QuizRepository.ts` | quizzes |
| `src/repositories/QuizAttemptRepository.ts` | quiz_attempts |
| `src/repositories/FlashcardRepository.ts` | flashcards |
| `src/repositories/FlashcardReviewRepository.ts` | flashcard_reviews |
| `src/repositories/NoteRepository.ts` | user_notes |

### API Routes to CREATE

| Route | Method | Handler calls |
|-------|--------|---------------|
| `src/app/api/learn/[bookId]/quiz/generate/route.ts` | POST | QuizService.generate() |
| `src/app/api/learn/[bookId]/quiz/submit/route.ts` | POST | QuizService.submit() |
| `src/app/api/learn/[bookId]/revision/generate/route.ts` | POST | RevisionService.generate() |
| `src/app/api/learn/[bookId]/flashcards/route.ts` | GET, POST | FlashcardService |
| `src/app/api/learn/[bookId]/flashcards/review/route.ts` | POST | FlashcardService.review() |

---

## Phase 7: UI Pages

**Goal:** Build responsive frontends including side-by-side study modes, interactive practice wizards, and a full revision dashboard.

### Pages to CREATE (7 files)

| File | Key Features |
|------|-------------|
| `src/app/(dashboard)/library/page.tsx` | Grid of BookCards, progress trackers, "Continue" triggers |
| `src/app/(dashboard)/upload/page.tsx` | Drag-drop, validation badges, file upload progress with clean/detect state triggers |
| `src/app/(dashboard)/learn/[bookId]/page.tsx` | Split screen: Left = Chapter content markdown + sections list, Right = AI Tutor chat |
| `src/app/(dashboard)/learn/[bookId]/practice/page.tsx` | Interactive practice wizard (Detailed Explanation → MCQs with feedback/hints → Short Answer → Assignment reviews) |
| `src/app/(dashboard)/learn/[bookId]/flashcards/page.tsx` | Spaced repetition cards with 3D flip animation, ease scoring buttons, and stats |
| `src/app/(dashboard)/learn/[bookId]/notes/page.tsx` | Create, read, delete notes grouped by chapter, with search |
| `src/app/(dashboard)/learn/[bookId]/revision/page.tsx` | Revision mode dashboard showing overall weak topics, daily goals, flashcard review lists, and revision quiz triggers |

### Components to CREATE (8 files)

| File | Purpose |
|------|---------|
| `src/components/learn/ChapterContent.tsx` | Chapter navigation, detailed section rendering, math formulas, code highlight |
| `src/components/learn/AIChat.tsx` | Streaming responses, cite reference badges, follow-up query suggestions |
| `src/components/learn/LearningModeSelector.tsx` | Beginner, Student, Interview, Advanced selection |
| `src/components/learn/QuizCard.tsx` | MCQs with hints, short answers, assignments input. Shows step-by-step evaluations |
| `src/components/learn/Flashcard.tsx` | 3D Flippable cards with scoring interactions |
| `src/components/learn/ProgressBar.tsx` | Progress bar and quiz stats |
| `src/components/learn/BookCard.tsx` | Standard book rendering with custom cover placeholders |
| `src/components/learn/FileUploader.tsx` | Custom file drop & validation container |

### Files to MODIFY

- `src/components/common/Sidebar.tsx` (Sidebar links)
- `src/components/common/Navbar.tsx` (Header content)
- `src/app/layout.tsx` (Platform title & global layouts)

---

## Phase 8: Dashboard & Final Integration

**Goal:** Unified overview stats, streak trackers, weak topics feed, activity logging, and end-to-end testing.

### Files to CREATE/MODIFY

- `src/app/(dashboard)/dashboard/page.tsx` (Dashboard landing: active book, daily goals, weak topics alerts, practice streak)
- `src/components/learn/DashboardStats.tsx` (Grid of analytics)

### End-to-End Test (Strong Rule)

```
1. Register a new user
2. Upload a small PDF
3. Background worker extracts (MuPDF.js), splits logically, verifies content, generates learning contents, saves section embeddings
4. Library shows Book with "Continue"
5. Open Book → Split view: left = text, right = chat
6. Chat: "Explain polymorphism" → Uses Section pgvector → Answers with [Chapter 1, Section 1] references
7. Click "Practice" → Detailed explanation, MCQs with hints/grading, Short-answers, Assignment grading
8. Generate Flashcards → Flashcard flips and review schedules with SM-2
9. Mark Chapter 1 complete → updates weak/strong topics & revision mode daily queue
10. Dashboard shows weak topics and daily review alerts
```

---

## Summary: All Files Changed

| Phase | Create | Modify | Delete | Strong Rule |
|-------|--------|--------|--------|-------------|
| P0: Restructure | 4 | 2 | 1 | `npm run dev` starts, TS passes |
| P1: Foundation | 12 | 1 | 0 | AI provider responds, PG-Boss connects |
| P2: Database | 13 | 2 | 1 | Migration succeeds, all tables exist |
| P3: Types | 12 | 0 | 3 | TypeScript passes, revision and sections validated |
| P4: Upload | 6 | 2 | 0 | Upload → background job → READY |
| P5: AI Engine | 8 | 0 | 0 | Chat responds using section vector matches |
| P6: Assessment | 12 | 0 | 0 | Quiz grades, revision analyzes, SM-2 works |
| P7: UI Pages | 15 | 3 | 0 | All pages render, responsive, interactive flows |
| P8: Dashboard | 1 | 2 | 0 | Full end-to-end flow passes |
| **Total** | **83** | **12** | **5** | |
