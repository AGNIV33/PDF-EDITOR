# IMPLEMENTATION_PLAN.md: Build Order

**Owners:** 🅰️ **Agniv** = tools engine (`src/tools/*`, workers, WASM, models) · 🆁 **Rohit** = platform (UI shell, auth, history, admin, deploy, desktop) · 🤝 **Both**

**How to use this file**
- Work top to bottom inside your own column. Tasks marked ⛔ block others; do them first.
- Tick `[x]` in the same PR that finishes the task.
- Each task should be one branch and one PR (`agniv/<task>` or `rohit/<task>`).
- Definition of done for every task: see `AGENTS.md` section 8 and `TESTING.md`.

---

## Phase 0: Setup (Week 1)

| # | Task | Owner | Done |
|---|---|---|---|
| 0.1 | Pick working name, create GitHub repo, add both as collaborators, protect `main` (PR + 1 review) | 🤝 | [ ] |
| 0.2 | Add all docs to the repo (`AGENTS.md`, `CLAUDE.md` in root; others in `DOCs/`) | 🤝 | [ ] |
| 0.3 | ⛔ Next.js + TypeScript strict + Tailwind + static export; ESLint, Prettier; scripts `dev/lint/typecheck/test/test:e2e/build` | 🆁 | [x] |
| 0.4 | ⛔ Commit `src/tools/types.ts`, `errors.ts`, empty `registry.ts` (contract from `ARCHITECTURE.md`) | 🆁 | [ ] |
| 0.5 | Vitest + Playwright setup, sample test, `tests/fixtures/` with sample PDFs (normal, scanned, encrypted, corrupt, 100+ pages) | 🆁 (setup) / 🅰️ (fixtures) | [x] |
| 0.6 | Vercel project linked to repo, preview deploys per PR | 🆁 | [ ] |
| 0.7 | Supabase project created; keys in `.env.local` and Vercel env vars | 🆁 | [ ] |
| 0.8 | Design tokens from `DESIGN.md` in Tailwind config; Inter font; Lucide icons | 🆁 | [x] |
| 0.9 | Spike: load `pdf-lib` and `pdfjs-dist` in a Web Worker; confirm it works in static export | 🅰️ | [x] |

**Exit:** empty site deployed on Vercel; both can run it locally; contract committed.

---

## Phase 1: Version 1 – Core (Weeks 2–5)

### 🆁 Rohit – Platform

| # | Task | Done |
|---|---|---|
| R1.1 | Layout: navbar, footer, theme toggle (dark mode) | [ ] |
| R1.2 | ⛔ `ToolShell`: UploadBox, FileList (reorder/remove), OptionsPanel slot, ProgressBar + Cancel, ResultCard, PrivacyBadge, error Alert | [ ] |
| R1.3 | ⛔ `tool-runner.ts`: run a tool in a Web Worker with progress, cancel, error mapping | [ ] |
| R1.4 | Dynamic route `/tools/[toolId]` with `generateStaticParams` from registry | [ ] |
| R1.5 | Home page and All tools page (search + category chips) | [ ] |
| R1.6 | Download handling: single file, multiple files as ZIP (fflate) | [ ] |
| R1.7 | Supabase schema + RLS + profile trigger (`ARCHITECTURE.md` §6) as migrations | [ ] |
| R1.8 | Login page: email/password, Google, magic link; logout; session state in navbar | [ ] |
| R1.9 | History: `saveHistory()` after runs (logged in), IndexedDB history (logged out), History page with search/delete/delete all, "save file names" toggle | [ ] |
| R1.10 | Privacy page and About page | [ ] |
| R1.11 | Content Security Policy headers in `vercel.json` | [ ] |
| R1.12 | Playwright privacy test (fails if large request bodies are sent during a tool run) | [ ] |

### 🅰️ Agniv – Tools

| # | Task | Done |
|---|---|---|
| A1.1 | PDF viewer component: zoom, scroll, thumbnails, text search (PDF.js) | [ ] |
| A1.2 | Merge PDF | [ ] |
| A1.3 | Split PDF (by ranges, every page, extract pages) | [ ] |
| A1.4 | Organize pages: reorder, delete, rotate | [ ] |
| A1.5 | Compress PDF (image downsampling presets: low/medium/high) | [ ] |
| A1.6 | JPG/PNG to PDF (page size, margins, orientation) | [ ] |
| A1.7 | PDF to JPG/PNG (resolution option) | [ ] |
| A1.8 | Watermark (text/image, opacity, position) | [ ] |
| A1.9 | Page numbers, header, footer | [ ] |
| A1.10 | Crop pages | [ ] |
| A1.11 | Editor workspace: highlight, underline, strikethrough, notes, pen, shapes, add image, undo/redo | [ ] |
| A1.12 | Sign PDF (draw, type, upload image; place and resize) | [ ] |
| A1.13 | Fill PDF forms | [ ] |
| A1.14 | Unit tests for every tool with fixtures | [ ] |

### 🤝 Both

| # | Task | Done |
|---|---|---|
| B1.1 | Integration pass: every V1 tool runs through ToolShell on desktop and mobile | [ ] |
| B1.2 | Full test run from `TESTING.md`; fix P0 bugs | [ ] |
| B1.3 | **Launch V1** on `*.vercel.app`; share with first users (college/job groups); collect feedback | [ ] |

**Exit:** all P0 features from `PRD.md` live, privacy test green, zero known P0 bugs.

---

## Phase 2: Version 2 – Stand out (Weeks 6–10)

### 🆁 Rohit – Platform

| # | Task | Done |
|---|---|---|
| R2.1 | `tool_settings` respected in UI ("This tool is paused") | [ ] |
| R2.2 | `tool_usage_daily` + `increment_usage()` RPC (anonymous counts) | [ ] |
| R2.3 | Admin `/admin`: KPI cards, charts (Recharts), users table (block/delete), tool switches, feedback list | [ ] |
| R2.4 | Feedback / bug form ("Report this" from error alerts, prefilled tool id + error code, no file data) | [ ] |
| R2.5 | Command palette (Ctrl+K) and keyboard shortcuts | [ ] |
| R2.6 | Tabs: several PDFs open side by side | [ ] |
| R2.7 | Batch mode UI (one tool on many files, per-file status, ZIP download) | [ ] |
| R2.8 | Workflows UI (chain tools, save a workflow locally) | [ ] |
| R2.9 | PWA: manifest, service worker, offline caching of app + tool assets | [ ] |
| R2.10 | Supabase keep-alive (scheduled ping) | [ ] |
| R2.11 | SEO: per-tool titles, descriptions, "How it works" + FAQ sections, sitemap | [ ] |

### 🅰️ Agniv – Tools

| # | Task | Done |
|---|---|---|
| A2.1 | OCR (English, Hindi, Bengali) → searchable PDF and plain text | [ ] |
| A2.2 | Compress to exact size ("under X KB") | [ ] |
| A2.3 | Exam photo & signature resizer with presets (SSC, UPSC, banking; verify sizes from real notices) | [ ] |
| A2.4 | Aadhaar / PAN masking (pattern detection + OCR for scans, manual adjust) | [ ] |
| A2.5 | Redact (true removal of underlying text and images) | [ ] |
| A2.6 | Remove metadata | [ ] |
| A2.7 | Lock / unlock (qpdf-wasm) and Repair PDF | [ ] |
| A2.8 | Compare two PDFs (text diff + visual diff) | [ ] |
| A2.9 | Create forms (add fillable fields) | [ ] |
| A2.10 | HTML to PDF, Text/Markdown to PDF | [ ] |
| A2.11 | PDF to Excel (basic, clean tables) | [ ] |
| A2.12 | PDF to PowerPoint (pages as images) | [ ] |
| A2.13 | Word to PDF (basic) | [ ] |
| A2.14 | Image tools: compress, resize, crop, convert (JPG/PNG/WebP/HEIC) | [ ] |
| A2.15 | Passport photo maker | [ ] |
| A2.16 | Batch-safe tools: make sure every tool handles many files and cancel | [ ] |
| A2.17 | Unit tests for every new tool | [ ] |

### 🤝 Both

| # | Task | Done |
|---|---|---|
| B2.1 | Check every new dependency licence; record in PR | [ ] |
| B2.2 | Full test run; accessibility pass (`DESIGN.md` §13) | [ ] |
| B2.3 | **Launch V2**; review usage numbers and feedback; decide V3 priorities | [ ] |

**Exit:** all P1 features live; admin dashboard working; PWA installable and works offline.

---

## Phase 3: Version 3 – AI + Desktop (Weeks 11–18)

### 🆁 Rohit – Platform / Desktop

| # | Task | Done |
|---|---|---|
| R3.1 | Tauri project wrapping the static build; Windows build working | [ ] |
| R3.2 | Platform detection; show "Desktop only" tags and hide unavailable tools on web | [ ] |
| R3.3 | Rust command bridge for desktop-only tools (file paths, run bundled binaries) | [ ] |
| R3.4 | GitHub Actions: build + sign Windows installer, publish to GitHub Releases | [ ] |
| R3.5 | Tauri auto-updater pointing at GitHub Releases | [ ] |
| R3.6 | `/download` page + "Download for Windows" button; count downloads in admin | [ ] |
| R3.7 | AI consent dialog (only if an online fallback is added) | [ ] |
| R3.8 | Reading mode, read aloud, dyslexia-friendly font setting | [ ] |

### 🅰️ Agniv – Tools / AI

| # | Task | Done |
|---|---|---|
| A3.1 | In-browser AI setup (WebLLM / Transformers.js), model download with progress and device check | [ ] |
| A3.2 | Chat with PDF (page-cited answers), chat across many PDFs | [ ] |
| A3.3 | Summary (3 lengths), explain selected text | [ ] |
| A3.4 | Quiz and flashcards from notes | [ ] |
| A3.5 | Translate PDF (keep layout; Hindi, Bengali) | [ ] |
| A3.6 | Smart form fill, smart rename, auto-split by content | [ ] |
| A3.7 | Tables/invoices to Excel, resume ATS checker, contract highlighter | [ ] |
| A3.8 | Scanner: camera to clean PDF (edge detect, deskew), QR scan/generate | [ ] |
| A3.9 | Image AI: background remover, upscaler, image to text | [ ] |
| A3.10 | Audio/video: video to GIF, compress video, speech to text, lecture to notes | [ ] |
| A3.11 | Productivity: invoice maker, resume maker, bulk certificate maker | [ ] |
| A3.12 | Desktop: LibreOffice Office ↔ PDF (accurate), PDF to Word, PDF/A (licence-checked) | [ ] |
| A3.13 | Desktop: local AI via llama.cpp / Ollama | [ ] |
| A3.14 | Desktop: DSC signing with user's USB token | [ ] |
| A3.15 | Accessibility tool: auto tags and alt text | [ ] |
| A3.16 | Edit existing text (limited) | [ ] |

### 🤝 Both

| # | Task | Done |
|---|---|---|
| B3.1 | Test desktop installer on a clean Windows machine | [ ] |
| B3.2 | Full regression run on web and desktop | [ ] |
| B3.3 | **Launch V3** (website + desktop app) | [ ] |

---

## Later ideas (not scheduled)

- Chrome extension: open web PDFs in our tool
- Hindi and Bengali UI
- Mac desktop build
- Optional one-time payment for AI and batch tools (needs licence review first)

## Change log

| Date | Change | By |
|---|---|---|
| 2026-11-25 | First plan created | Agniv |
