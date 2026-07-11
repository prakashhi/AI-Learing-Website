# Book Processing & AI Learning Architecture — Implementation Plan

> Status: PLAN (not yet implemented). Read top-to-bottom, then give the go-ahead per phase or all at once.

---

## 1. Context & Goals

A user uploads a book (PDF/EPUB/DOCX/MD). We want:

1. **Book is "ready" in ~5 seconds** — no waiting for AI.
2. **AI work happens lazily** — only when a user opens a specific chapter.
3. **Zero/minimal cost** — use free-tier models, cache aggressively.
4. **High-quality explanations** — structured learning material (concepts, definitions, examples, flashcards, MCQs, summary).
5. **Resilient** — if one AI provider is rate-limited or down, fall back to another.
6. **Optimized** — per-provider rate limiting, validation before storage, single worker process.

### Non-goals (explicitly decided)
- **No embeddings** — dropped to reduce AI calls and simplify the `Section` model.
- **No eager processing** — AI does NOT run at upload time.
- **No Redis / extra services** — cache lives in PostgreSQL.
- **No horizontal worker scaling** (single worker) — so an in-memory rate limiter is sufficient.

---

## 2. Confirmed Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| PDF extraction | **MuPDF.js** (`mupdf`) | Uses `stext.walk()` for font-size-based chapter detection |
| Queue | **PG-Boss + PostgreSQL** | Already wired; supports retry, supervision, dead-letter |
| Database | **PostgreSQL + Sequelize ORM** | Existing models |
| Cache | **PostgreSQL** | `ai_cache` table keyed by content hash (optional cross-book dedupe) |
| AI Router | **Central module** | retries + rate limiting + caching + provider selection |
| Primary model | **Groq Llama 3.x** (`llama-3.3-70b-versatile`) | ~14,400 req/day free, fastest inference |
| Coding fallback | **DeepSeek V3.x** (`deepseek-chat`) | Best coding explanations, 5M free tokens |
| Large-context fallback | **Gemini Flash / Flash-Lite** | 1M context when chapter exceeds 128K tokens |
| Validation | **Zod** (already installed v4) | JSON-schema validation before storing AI output |
| Worker | **Single process** | In-memory per-provider rate limiter |

---

## 3. Architecture Flow

```
┌─ UPLOAD TIME (Phase 2: BOOK_EXTRACT) ───────────────────────────────┐
│                                                                      │
│  User uploads → BookUploadService queues BOOK_EXTRACT                │
│    → Worker:                                                        │
│        1. Download file from Supabase storage                       │
│        2. extractText() → detect chapters by font size              │
│        3. cleanText() per chapter                                   │
│        4. BookChapter.bulkCreate({ rawText, cleanText,              │
│             status: "pending" })  ← one row per chapter             │
│        5. Book.update({ status: "READY", totalChapters })           │
│        6. UserBook.create({ userId, bookId, currentChapterIndex })  │
│        7. ProcessingJob → COMPLETED                                 │
│    → Book is READY in ~5s. 0 AI calls.                              │
└──────────────────────────────────────────────────────────────────────┘

┌─ ON DEMAND (user opens Chapter N) ──────────────────────────────────┐
│                                                                      │
│  GET /api/books/:bookId/chapters/:index                             │
│    ├─ status "completed"  → return chapter content + learningmaterial│
│    ├─ status "pending"    → queue BOOK_PROCESS_CHAPTER,              │
│    │                        set status "processing", return "generating"│
│    ├─ status "processing" → return "generating"                     │
│    └─ status "failed"     → return error (user can retry)            │
│                                                                      │
│  Frontend polls every ~2s until "completed".                        │
│                                                                      │
│  BOOK_PROCESS_CHAPTER worker:                                       │
│    1. Load BookChapter, set status "processing"                     │
│    2. splitChapter(content)            ── via AI Router             │
│    3. for each section:                                             │
│         generateExplanation(section.text) ── via AI Router          │
│         Section.create({ chapterId, index, sectionText,              │
│             explanation, concepts, examples, definitions })         │
│    4. verifyContent(chapter, combined)  ── via AI Router            │
│    5. generateLearningContent(verified) ── via AI Router            │
│    6. BookChapter.update({ fullExplanation, summary,                │
│         learningMaterial, status: "completed" })                    │
└──────────────────────────────────────────────────────────────────────┘

┌─ AI ROUTER (Phase 3, called by every AI service) ───────────────────┐
│                                                                      │
│  aiRouter.generate(prompt, schema, opts):                           │
│    1. Compute key = hash(modelId + modelVersion + promptHash)       │
│    2. PostgreSQL cache hit? → return cached (0 AI calls)            │
│    3. Select provider:                                             │
│         - Groq (primary, p-limit 25)                                │
│         - on 429 / error → DeepSeek (fallback, p-limit 20)          │
│         - if prompt tokens > 128K → Gemini Flash (1M ctx)          │
│    4. Call provider with retry + exponential backoff (router-level) │
│    5. Validate response with Zod schema                            │
│    6. Store in ai_cache (unless validation failed → retry/next prov)│
│    7. Return parsed result                                          │
│                                                                      │
│  Circuit breaker: per-provider failure counter → cool-down          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Phase-wise Plan

### Phase 0 — Foundation (ALREADY DONE)
**Files:** `src/lib/text-extraction.ts`, queue/DB/models in place.

- PDF extraction rewritten to use `stext.walk()`:
  - Single-pass extraction (font sizes + lines in one walk) — ~2× faster
  - Font-size clustering (relative gap `max(1.5, size×0.15)`) → H1/H2/H3 detection
  - Bold as secondary heading signal
  - Paragraph detection via text-block boundaries
  - Hyphenation fix (`inform-\nation` → `information`)
- PG-Boss + PostgreSQL + Sequelize models exist.
- Gemini provider exists (used as large-context fallback only going forward).

---

### Phase 1 — BookChapter status field
**Files:** `src/models/BookChapter.ts`

Add a `status` column so the on-demand flow can track per-chapter state:

```typescript
// in class:
public status!: "pending" | "processing" | "completed" | "failed";

// in init():
status: {
  type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
  defaultValue: "pending",
  allowNull: false,
},
```

No migration needed if `sync({ alter: true })` is used; otherwise add a Sequelize migration.

---

### Phase 2 — Two-queue worker architecture
**Files:** `src/queue/queues.ts`, `src/workers/bookProcessingWorker.ts`, `src/workers/start.ts`, `src/features/books/services/BookUploadService.ts`

**Why:** The old single `BOOK_PROCESSING` job did everything (extract + AI) in one shot. If it crashed mid-way, the whole book retried. Splitting into two queues isolates the fast, deterministic extraction from the slow, AI-heavy chapter processing.

**`queues.ts`:**
```typescript
export const QUEUES = {
  BOOK_EXTRACT: "book-extract",
  BOOK_PROCESS_CHAPTER: "book-process-chapter",
} as const;

export type BookExtractData = { bookId: string };
export type BookProcessChapterData = { bookId: string; chapterIndex: number };
```

**`bookProcessingWorker.ts` — two handlers:**

`handleBookExtract(job)`:
- Update ProcessingJob → PROCESSING
- Download file
- `extractText()` → `cleanText()` per chapter
- `BookChapter.bulkCreate(... status: "pending")`
- `Book.update({ status: "READY", totalChapters })`
- `UserBook.create(...)`
- ProcessingJob → COMPLETED, `job.done()`

`handleChapterProcess(job)`:
- Load BookChapter by `{ bookId, index: chapterIndex }`
- Set status → "processing"
- Run the AI pipeline (Phase 7) via AI Router
- On success: status → "completed"
- On failure: status → "failed" (router retries separately via pg-boss)

Register both:
```typescript
boss.createQueue(QUEUES.BOOK_EXTRACT);
boss.createQueue(QUEUES.BOOK_PROCESS_CHAPTER);
boss.work(QUEUES.BOOK_EXTRACT, { batchSize: 5 }, extractHandler);
boss.work(QUEUES.BOOK_PROCESS_CHAPTER, { batchSize: 5 }, chapterHandler);
```

**`BookUploadService.ts`:** queue `BOOK_EXTRACT` (was `BOOK_PROCESSING`); `expireInSeconds: 120`.

**`start.ts` `requeueStaleJobs()`:** re-queue both `BOOK_EXTRACT` (via ProcessingJob) and `BOOK_PROCESS_CHAPTER` (via BookChapter where status = "processing").

---

### Phase 3 — AI Router (core)
**New file:** `src/lib/ai/router.ts`
**New file:** `src/models/AICache.ts` (PostgreSQL cache table)

**Why:** Centralizes retries, rate limiting, caching, and provider selection so no AI service reimplements them. This is the single most important production component.

Responsibilities:
1. **Cache lookup** — `key = sha256(modelId + modelVersion + promptHash)`. Hit → return immediately.
2. **Provider selection** —
   - Default: Groq
   - On `429` / network error → DeepSeek
   - If estimated prompt tokens > 128K → Gemini Flash
3. **Rate limiting** — in-memory `p-limit` per provider (Groq 25, DeepSeek 20, Gemini 4). Single worker → safe.
4. **Retry + backoff** — router-level: 3 attempts, exponential backoff (1s/2s/4s). Replaces the worker's old `withRetry`.
5. **Circuit breaker** — per-provider failure count; if > N consecutive failures, cool down that provider for T seconds.
6. **Cache store** — on success, write to `ai_cache` table.

```typescript
// Sketch
export async function routeAI(
  prompt: string,
  schema: ZodSchema,
  opts?: { modelVersion?: string; task?: "explain" | "split" | "verify" | "learn" },
): Promise<unknown> {
  const key = hash(ACTIVE_MODEL + (opts?.modelVersion ?? "v1") + sha256(prompt));
  const cached = await AICache.findByPk(key);
  if (cached) return cached.response;

  for (const provider of selectProviders(prompt)) {
    try {
      const raw = await withLimit(provider, () => provider.chat(prompt));
      const parsed = schema.parse(raw); // throws → next provider
      await AICache.create({ hash: key, modelId: provider.name, modelVersion: opts?.modelVersion ?? "v1", response: parsed });
      return parsed;
    } catch (e) {
      recordFailure(provider);
    }
  }
  throw new Error("All AI providers failed");
}
```

`AICache` model:
```typescript
{
  hash: STRING PK,
  modelId: STRING,
  modelVersion: STRING,
  response: JSONB,
  createdAt: DATE,
}
```

---

### Phase 4 — Providers (Groq + DeepSeek)
**New files:** `src/lib/ai/providers/GroqProvider.ts`, `src/lib/ai/providers/DeepSeekProvider.ts`
**Edit:** `src/lib/ai/registry.ts`

Both implement the existing `AIProvider` interface (`chat`, `chatStream`, `generateEmbedding`, `name`).

- `GroqProvider` → model `llama-3.3-70b-versatile`, reads `GROQ_API_KEY`.
- `DeepSeekProvider` → model `deepseek-chat`, reads `DEEPSEEK_API_KEY`.
- `GeminiProvider` → already exists; keep as fallback.
- Registry: register all three constructors so the router can instantiate by name.

---

### Phase 5 — Output validation (Zod)
**Edit:** `src/features/ai/services/*.ts`

Add Zod schemas and validate AI output before using/storing:

| Service | Schema (fields) |
|---------|-----------------|
| `SectionSplitter` | `array({ title: string, text: string })` |
| `ExplanationGenerator` | `{ explanation, concepts[], definitions{}, examples[], formulas[], keywords[], commonMistakes[], memoryTips[] }` |
| `VerificationService` | `{ isComplete: bool, missingItems[], finalExplanation: string }` |
| `ContentGenerator` | 17-field learning schema (beginnerExplanation, detailedExplanation, keyConcepts[], flashcards[], mcqs[], shortAnswerQuestions[], etc.) |

Each service replaces `getProvider().chat()` with `routeAI(prompt, schema)` and removes its own ad-hoc JSON parsing/fallback (the router handles fallback + validation).

Also in this phase:
- Raise `maxOutputTokens` to **8192+** (current 4096 truncates learning material).
- Lower `temperature` to **0.2–0.3** for consistent explanations.

---

### Phase 6 — API endpoint (on-demand trigger)
**New file:** `src/app/api/books/[id]/chapters/[index]/route.ts`

```typescript
GET → load BookChapter by { bookId, index }
  if completed → return { status: "completed", title, content, fullExplanation, summary, learningMaterial }
  if pending   → queue BOOK_PROCESS_CHAPTER, set status "processing", return { status: "generating" }
  if processing→ return { status: "generating" }
  if failed    → return { status: "failed", error }
```

Frontend polls this endpoint every ~2s while "generating".

---

### Phase 7 — Worker refactor for BOOK_PROCESS_CHAPTER
**Edit:** `src/workers/bookProcessingWorker.ts` (`handleChapterProcess`)

- Call AI services (which now use the router) — no direct `getProvider()`.
- **Remove** the old `withRetry`/`withTimeout` helpers (router owns retry).
- **Drop embeddings** — do NOT call `generateSectionEmbedding`; do NOT populate `Section.embedding`.
- Save `Section` rows without `embedding` (keep `sectionText`, `explanation`, `concepts`, `examples`, `definitions`).
- On any thrown error → set `BookChapter.status = "failed"` and rethrow so pg-boss retries the job (up to 3× with backoff).

---

### Phase 8 — Config & environment
**Edit:** `.env`, `src/lib/ai/config.ts` (or constants)

```
GROQ_API_KEY=...
DEEPSEEK_API_KEY=...
GEMINI_API_KEY=...   (already present)
AI_PRIMARY_MODEL=groq
GROQ_RATE_LIMIT=25
DEEPSEEK_RATE_LIMIT=20
GEMINI_RATE_LIMIT=4
AI_OUTPUT_TOKENS=8192
AI_TEMPERATURE=0.25
CONTEXT_FALLBACK_THRESHOLD_TOKENS=128000
```

---

## 5. Edge Cases & Decisions Log

| Decision | Rationale |
|----------|-----------|
| Lazy/on-demand AI | Book ready in 5s; AI cost ∝ actual usage |
| Drop embeddings | Fewer AI calls; no semantic search needed yet |
| Single worker | Simplest; in-memory rate limiter suffices |
| Cache key includes modelVersion | Avoids serving stale outputs after model upgrade |
| PostgreSQL cache (not Redis) | Fewer services; `ai_cache` table is enough |
| `ai_cache` optional for cross-book dedupe | Per-book cache = BookChapter/Section rows themselves |
| Provider chain Groq→DeepSeek→Gemini | Best free throughput → best coding → largest context |
| `maxOutputTokens` 8192+ | 4096 truncated full learning material |
| Temperature 0.2–0.3 | Consistent explanations for a learning app |

---

## 6. Production-Readiness Scorecard

| Dimension | Status |
|-----------|--------|
| Cost control | ✅ Cache + free models + rate limiting |
| Reliability | ✅ Multi-provider fallback + Zod validation + retries |
| Speed | ✅ Lazy trigger + Groq fast inference |
| Scalability | ✅ Queue-based; horizontal later via shared limiter |
| Quality | ✅ Zod validation + verifyContent step |
| Observability | ⚠️ Add basic counters later (cache hit %, AI calls/provider) |

---

## 7. Implementation Order (recommended)

1. Phase 1 (BookChapter.status) — unblocks everything
2. Phase 2 (two-queue worker) — extraction works end-to-end, book becomes READY
3. Phase 6 (API endpoint) — manual test: book ready, chapter returns "generating"
4. Phase 3 (AI Router) — core intelligence
5. Phase 4 (Groq + DeepSeek providers) — routing works
6. Phase 5 (Zod validation + service refactor) — quality + safety
7. Phase 7 (worker refactor, drop embeddings) — wire it together
8. Phase 8 (config/env) — finalize

> Tell me which phase(s) to implement, or say "implement all" to proceed end-to-end.
