# ARCHITECTURE.md: Technical Blueprint

## 1. Big picture

```
                ┌──────────────────────── User's device ────────────────────────┐
                │                                                               │
 Vercel (static │   Browser / Desktop app                                       │
 files only) ───┼──► Next.js static UI (React)                                  │
 HTML, JS, WASM │        │                                                      │
 AI models      │        ▼                                                      │
                │   Tool Runner ──► Web Worker ──► Tool logic (pdf-lib, PDF.js, │
                │        │                          tesseract.js, qpdf-wasm)    │
                │        ▼                                                      │
                │   Result files (Blob) ──► Download / Save to disk             │
                │                                                               │
                └───────────────┬───────────────────────────────────────────────┘
                                │ metadata only (logged-in users)
                                ▼
                        Supabase (Auth + Postgres + RLS)
                        profiles · history · feedback · tool_settings
```

**Key idea:** Vercel only serves static files. All file processing happens on the user's device. Supabase only stores account data and small metadata rows.

## 2. Tech stack

| Layer | Choice | Licence | Notes |
|---|---|---|---|
| UI framework | Next.js (App Router), React, TypeScript strict | MIT | `output: 'export'` (static) |
| Styling | Tailwind CSS | MIT | Tokens in `DESIGN.md` |
| PDF render / text | `pdfjs-dist` | Apache-2.0 | Viewer, thumbnails, text positions |
| PDF edit / create | `pdf-lib` | MIT | Merge, split, rotate, watermark, sign, forms |
| Low-level PDF | qpdf (WASM build) | Apache-2.0 | Encrypt, decrypt, repair, linearize |
| OCR | `tesseract.js` | Apache-2.0 | eng, hin, ben language data |
| Excel output | SheetJS (community edition) | Apache-2.0 | Verify current licence before install |
| PowerPoint output | PptxGenJS | MIT | |
| Word read | mammoth.js / docx-preview | BSD-2 / Apache-2.0 | Verify before install |
| Media | ffmpeg.wasm | MIT wrapper; check codec build licence | Version 3 |
| In-browser AI | WebLLM / Transformers.js | Apache-2.0 | Model licences checked per model |
| Auth + DB | Supabase | — | Free plan |
| Charts | Recharts | MIT | Admin |
| Desktop | Tauri | MIT / Apache-2.0 | Version 3 |
| Desktop Office conversion | LibreOffice (headless) | MPL-2.0 | Bundled in desktop only |
| Desktop AI | llama.cpp / Ollama | MIT | Version 3 |
| Tests | Vitest, Playwright | MIT / Apache-2.0 | |

**Forbidden without owner approval:** AGPL/GPL/SSPL code (e.g. PyMuPDF, Ghostscript).

## 3. Folder structure

```
/
├─ AGENTS.md  CLAUDE.md  PRD.md  ARCHITECTURE.md  DESIGN.md
├─ IMPLEMENTATION_PLAN.md  TESTING.md  README.md
├─ next.config.mjs            # output: 'export', headers notes
├─ public/
│  ├─ wasm/                   # qpdf.wasm, etc.            (Agniv)
│  ├─ tesseract/              # worker + language data     (Agniv)
│  └─ models/                 # small AI models (V3)       (Agniv)
├─ src/
│  ├─ app/                    # routes                     (Rohit)
│  │  ├─ layout.tsx
│  │  ├─ page.tsx             # home
│  │  ├─ tools/page.tsx       # all tools
│  │  ├─ tools/[toolId]/page.tsx   # generic tool page (generateStaticParams from registry)
│  │  ├─ history/page.tsx
│  │  ├─ login/page.tsx
│  │  ├─ admin/page.tsx
│  │  └─ download/page.tsx    # desktop app (V3)
│  ├─ components/             # UI kit + ToolShell         (Rohit)
│  ├─ lib/
│  │  ├─ supabase.ts          # client (anon key only)
│  │  ├─ auth.ts
│  │  ├─ history.ts           # saveHistory / listHistory / deleteHistory
│  │  ├─ local-history.ts     # IndexedDB for logged-out users
│  │  └─ tool-runner.ts       # runs a tool in a worker, handles progress + errors
│  ├─ admin/                  # dashboard widgets          (Rohit)
│  ├─ workers/                # worker entry points        (Agniv)
│  └─ tools/                  # one folder per tool        (Agniv)
│     ├─ types.ts             # SHARED contract
│     ├─ errors.ts            # ToolError
│     ├─ registry.ts          # list of ToolDefinitions
│     ├─ merge/ { index.ts, run.ts, OptionsPanel.tsx? }
│     └─ ...
├─ supabase/migrations/       # SQL                        (Rohit)
├─ tests/ { unit/, e2e/, fixtures/ }
└─ src-tauri/                 # desktop app (V3)           (Rohit)
```

## 4. The tool contract (shared, change only with both owners' approval)

```ts
// src/tools/types.ts
import type { ComponentType } from 'react';

export type ToolCategory =
  | 'organize' | 'optimize' | 'convert-to-pdf' | 'convert-from-pdf'
  | 'edit' | 'security' | 'india' | 'ai' | 'image' | 'other';

export type ToolPlatform = 'web' | 'desktop' | 'both';

export interface ToolResult { name: string; blob: Blob }

export interface ToolDefinition {
  id: string;                    // url slug, e.g. 'merge'
  name: string;                  // 'Merge PDF'
  description: string;           // one simple line
  icon: string;                  // icon name from the icon set
  category: ToolCategory;
  platform: ToolPlatform;
  accepts: string[];             // MIME types or extensions
  multiple: boolean;
  maxFiles?: number;
  enabled: boolean;              // default; admin may override via tool_settings
  defaultOptions?: Record<string, unknown>;
  run: (
    files: File[],
    options: Record<string, unknown>,
    onProgress: (percent: number) => void,
    signal?: AbortSignal         // user pressed Cancel
  ) => Promise<ToolResult[]>;
  OptionsPanel?: ComponentType<{
    value: Record<string, unknown>;
    onChange: (v: Record<string, unknown>) => void;
  }>;
}
```

```ts
// src/tools/errors.ts
export type ToolErrorCode =
  | 'ENCRYPTED' | 'CORRUPT' | 'UNSUPPORTED' | 'TOO_LARGE'
  | 'OUT_OF_MEMORY' | 'CANCELLED' | 'UNKNOWN';

export class ToolError extends Error {
  constructor(public code: ToolErrorCode, public userMessage: string) {
    super(userMessage);
  }
}
```

**Rules for `run()`:**
- Pure: files in, files out. No DOM, no network, no global state.
- Report progress 0–100 at sensible steps.
- Check `signal?.aborted` between heavy steps; throw `ToolError('CANCELLED', ...)`.
- Throw `ToolError` with a simple `userMessage` for known problems.

## 5. Tool execution flow

1. User opens `/tools/merge`. `ToolShell` reads the definition from `registry.ts`.
2. If `tool_settings.enabled = false` for that id, show "This tool is paused".
3. User drops files. `ToolShell` checks `accepts`, `multiple`, `maxFiles` and size.
4. `tool-runner.ts` starts the tool in a **Web Worker** (or main thread for very light tools), passes files, options and an abort signal.
5. Progress events update the progress bar.
6. Results come back as Blobs → preview (if possible) + Download button. Many results → download as ZIP (fflate, MIT).
7. If logged in and history is on: `saveHistory({ tool, file_name?, size_before, size_after })`. Otherwise write to local IndexedDB history.
8. Blob URLs are revoked after download or when leaving the page.

## 6. Data model (Supabase)

```sql
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'user' check (role in ('user','admin')),
  blocked boolean not null default false,
  save_file_names boolean not null default true,
  created_at timestamptz default now()
);

create table public.history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  tool text not null,
  file_name text,
  file_count int default 1,
  size_before bigint,
  size_after bigint,
  created_at timestamptz default now()
);
create index on public.history (user_id, created_at desc);

create table public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  kind text not null default 'feedback' check (kind in ('feedback','bug')),
  message text not null,
  page text,
  created_at timestamptz default now()
);

create table public.tool_settings (
  tool text primary key,
  enabled boolean not null default true
);

-- anonymous usage counts (no user id, no file info)
create table public.tool_usage_daily (
  day date not null,
  tool text not null,
  runs int not null default 0,
  primary key (day, tool)
);
```

**Profile creation:** a trigger on `auth.users` insert creates the `profiles` row.

**Row Level Security (ON for every table):**

| Table | Select | Insert | Update | Delete |
|---|---|---|---|---|
| profiles | own row; admin all | trigger only | own `save_file_names`; admin `role`, `blocked` | admin |
| history | own rows | own rows (not blocked) | none | own rows |
| feedback | admin | any logged-in user | none | admin |
| tool_settings | everyone | admin | admin | admin |
| tool_usage_daily | admin | via `increment_usage(tool)` RPC only | — | — |

- Admin check: a `security definer` SQL function `is_admin()` reading `profiles.role`.
- `increment_usage(tool text)` is a `security definer` function that only adds +1 for today. Rate-limit or validate `tool` against a known list.
- Admin stats (total users, new users per day) come from `security definer` functions that first check `is_admin()`.
- **Never** expose the service-role key to the browser.

## 7. Authentication

- Supabase Auth: email + password, Google OAuth, magic link.
- Session stored by the Supabase JS client in the browser.
- Static export means no server-side auth checks: **all protection is enforced by RLS**, the UI only hides things.
- `/admin` page checks `is_admin()` and shows nothing if false; RLS blocks data anyway.
- Blocked users: `profiles.blocked = true` → RLS refuses history inserts; UI shows a notice.

## 8. Privacy architecture

| Data | Where it lives | Leaves device? |
|---|---|---|
| File bytes, pages, extracted text | Memory / Web Worker / IndexedDB (temp) | **Never** |
| AI prompts and answers about a file | Device (local model) | Never (online fallback only with explicit consent, V3) |
| Account email | Supabase Auth | Yes |
| History rows (tool, name, sizes, time) | Supabase (logged in) or IndexedDB (logged out) | Only if logged in |
| Anonymous tool run counts | Supabase `tool_usage_daily` | Yes, no user id |

Additional measures:
- **Content Security Policy** restricting `connect-src` to self and the Supabase URL. Set in `vercel.json` headers.
- No third-party analytics scripts that read page content.
- A privacy page explaining all of the above in simple words.
- Automated test (Playwright) that fails if any request body larger than a few KB is sent during a tool run (see `TESTING.md`).

## 9. Performance

- Heavy libraries (PDF.js worker, tesseract, qpdf.wasm, AI models) are **lazy-loaded** only on the tool page that needs them.
- Web Workers for all processing; transfer `ArrayBuffer`s instead of copying.
- Render only visible pages in the viewer (virtualised list).
- Large files: warn above ~100 MB; process page by page where possible.
- Cache static WASM/model files with long cache headers and the PWA service worker.

## 10. Offline / PWA (Version 2)

- Service worker caches the app shell and tool assets after first visit.
- Tools work with no internet; login/history sync resumes when online.
- Local history queued in IndexedDB and synced after login (optional).

## 11. Desktop app (Version 3)

- **Tauri** wraps the same static build (`/out`).
- Platform detection: `window.__TAURI__` present → enable `platform: 'desktop'` tools.
- Desktop-only features call Rust commands that run bundled binaries:
  - LibreOffice headless → Office ↔ PDF
  - llama.cpp / Ollama → local AI
  - PKCS#11 for DSC USB tokens
- Files are read and written through Tauri's file system APIs with user-chosen paths.
- Build Windows installer in GitHub Actions; publish to **GitHub Releases**.
- Tauri updater checks GitHub Releases for new versions (signed updates).
- Website `/download` links to the latest release asset.

## 12. Deployment

| Item | Setup |
|---|---|
| Hosting | Vercel, Git integration, preview deploy per PR |
| Build | `next build` with `output: 'export'` → `/out` |
| Env vars | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| DB migrations | SQL files in `supabase/migrations`, applied with Supabase CLI or dashboard |
| Keep-alive | Free scheduled ping (e.g. GitHub Actions cron) so the free Supabase project does not pause; verify current pause rules |
| Domain | `*.vercel.app` until a name is chosen |

## 13. Error handling and logging

- Tool errors → `ToolError.userMessage` shown in a friendly alert with a "Report this" button (opens feedback form prefilled with tool id and error code, **no file data**).
- Unknown errors → generic message + error code; details only in the browser console in dev.
- No remote error tracking that captures page content.

## 14. Key decisions (ADR log)

| # | Decision | Reason |
|---|---|---|
| 1 | On-device processing | Core privacy promise; zero server cost |
| 2 | Next.js static export | Free hosting, no server to secure |
| 3 | Supabase for auth + DB | Free tier, RLS, easy auth |
| 4 | One folder per tool + shared contract | Two people work in parallel without conflicts |
| 5 | Tauri over Electron | Smaller installer, lower memory |
| 6 | No AGPL libraries | Keep option to sell or close source later |
| 7 | Accurate Office conversion only in desktop | Browser LibreOffice is too heavy |

Add new decisions here with a number, the decision and the reason.
