# AGENTS.md: Instructions for AI Coding Agents

This file tells any AI coding agent (Claude, Codex, Cursor, Copilot, etc.) how to work in this repo. Read it fully before changing anything. Claude also reads `CLAUDE.md`, which points back here.

## 1. Read these first

| File | Why |
|---|---|
| `DOCs/PRD.md` | What we build and why. Feature priorities (P0/P1/P2). |
| `DOCs/ARCHITECTURE.md` | How the code is structured. The tool contract. Database. |
| `DOCs/DESIGN.md` | Colours, fonts, components, page layouts. |
| `DOCs/IMPLEMENTATION_PLAN.md` | Build order and who owns each task. |
| `DOCs/TESTING.md` | How to test, the privacy check, and the bug log. |

If these files disagree, the order of authority is: **this file > DOCs/ARCHITECTURE.md > DOCs/PRD.md > others**. Point out the conflict to the human.

## 2. The one rule that matters most

> **User files must never leave the user's device.**

- No `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, form POST, or server action that carries file bytes, file text, page images or extracted content.
- No Next.js API routes or server actions that receive files.
- Tool code (`src/tools/*`) must make **zero network calls**. AI models and WASM binaries are loaded as static assets from our own site, not user data going out.
- Only metadata (tool id, file name if allowed, sizes, timestamps) may go to Supabase, and only for logged-in users.

If a task seems to require breaking this, **stop and ask the human**.

## 3. Other hard rules

1. **Rs. 0 budget.** Do not add paid APIs, paid tiers or paid libraries.
2. **Licence check before adding any dependency.** Allowed: MIT, Apache-2.0, BSD, ISC, MPL-2.0. **Forbidden without explicit owner approval:** AGPL, GPL, SSPL, "non-commercial" licences. Known examples to avoid: PyMuPDF, Ghostscript. State the licence in the PR description for every new dependency.
3. **No secrets in the repo.** Use `.env.local` (git-ignored). Browser code may only use the Supabase publishable (anon) key. Never use a service-role key in frontend code or commit it anywhere.
4. **Tools work without login.** Never gate a P0 tool behind sign-in.
5. **Static export.** Keep Next.js `output: 'export'` working. Do not add features that need a Node server at runtime.
6. **Heavy work goes in Web Workers.** The main thread must stay responsive.
7. **Don't touch the other owner's area** without asking (see section 4).
8. **Never push to `main`.** Work on a branch, open a PR.
   - **Never commit, push or create a branch without asking the human first** and getting a clear "yes".
   - **Before every push:** run `git fetch` and check for conflicts with the target branch. If there are conflicts, stop and ask. Never force-push.
9. **Ask, don't guess.** When something is unclear, ask the human in super simple language: one short question at a time, with choices if possible.
10. **Use as few tokens as possible.** Keep replies short and point-wise, read only the parts of files you need, and don't repeat content back.
11. **Don't invent facts.** If unsure about a library's API, licence or limit, check its docs or say you are unsure.

## 4. Ownership

| Area | Owner | Paths |
|---|---|---|
| Tools engine (all file processing) | **Agniv** | `src/tools/**` (except `types.ts`), `src/workers/**`, `public/wasm/**`, `public/models/**` |
| Platform (UI shell, auth, history, admin, deploy, desktop) | **Rohit** | `src/app/**`, `src/components/**`, `src/lib/**`, `src/admin/**`, `supabase/**`, `src-tauri/**` |
| Shared (change only when both agree) | Both | `src/tools/types.ts`, `src/tools/registry.ts` (Agniv adds entries, Rohit reads), `DOCs/DESIGN.md` tokens, root config files, all `*.md` docs |

Ask the human which owner they are at the start of a session if it is not clear.

## 5. Tech stack (fixed)

- Next.js (App Router) + React + TypeScript (strict mode), static export
- Tailwind CSS
- `pdfjs-dist` (view, render), `pdf-lib` (edit, create)
- `tesseract.js` (OCR), `qpdf` compiled to WASM (lock, unlock, repair, compress helpers)
- Supabase (Auth + Postgres with RLS)
- Recharts (admin charts)
- Vercel (hosting), GitHub (code, Releases)
- Tauri (desktop app, Version 3)

Adding a new major library or changing one of these needs owner approval.

## 6. Coding conventions

- **TypeScript strict.** No `any` unless commented with a reason.
- **File names:** `kebab-case.ts`; React components `PascalCase.tsx`.
- **One tool = one folder:** `src/tools/<tool-id>/` with `index.ts` (the `ToolDefinition`), `run.ts` (logic), optional `OptionsPanel.tsx`, optional `worker.ts`.
- **Pure tool logic:** `run()` takes `File[]` and options, returns `{ name, blob }[]`. No UI, no network, no global state.
- **Errors:** throw `ToolError` with a `userMessage` in simple English (see `DOCs/ARCHITECTURE.md`). Never show raw stack traces to users.
- **Comments:** explain *why*, not *what*. Comment anything non-obvious (PDF internals, WASM setup).
- **Keep it simple.** Prefer readable code over clever code. The owners rely heavily on AI-assisted coding, so clarity matters.
- **Formatting:** Prettier + ESLint defaults from the repo config. Run lint before committing.
- **No dead code or commented-out blocks** in PRs.

## 7. Workflow for every task

1. Find the task in `DOCs/IMPLEMENTATION_PLAN.md`. Confirm it belongs to the current owner.
2. **Ask the human**, then create a branch: `<owner>/<short-task>` (e.g. `agniv/merge-tool`, `rohit/login`).
3. Make the smallest change that completes the task.
4. Run: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
5. Do the manual checks in `DOCs/TESTING.md` (always including the **privacy check**).
6. Tick the task in `DOCs/IMPLEMENTATION_PLAN.md` in the same PR.
7. Log any bug found but not fixed in `DOCs/TESTING.md` → Bug Log.
8. **Ask the human**, then commit with a short clear message (`add merge tool`, `fix history delete`).
9. **Before pushing:** `git fetch`, check for conflicts with the target branch, report them, and ask before pushing. Then open a PR. The description lists: what changed, how it was tested, new dependencies + licences, screenshots for UI.

## 8. Definition of done

- Feature works on latest Chrome and Edge, desktop and a phone-sized screen
- Privacy check passed (no file data in the Network tab)
- No console errors or warnings introduced
- Errors shown in simple words
- Lint, typecheck, tests and build all pass
- Docs updated if behaviour or structure changed
- Reviewed by the other owner

## 9. When to stop and ask the human

- Anything that might send file data off the device
- Adding a dependency with an unclear or restrictive licence
- Changing `types.ts`, the database schema or RLS policies
- Anything that costs money or needs a new account
- Deleting files or large refactors
- Requirements in the docs are unclear or conflict

## 10. Commands

```bash
npm install          # install dependencies
npm run dev          # local dev server
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # unit tests (Vitest)
npm run test:e2e     # end-to-end tests (Playwright)
npm run build        # static export to /out
```

(Rohit sets these scripts up in the first setup task. Update this list if they change.)
