# TESTING.md: Safety Net & Bug Log

Every change must pass the checks in this file before it is merged. Bugs found and not fixed right away go in the **Bug Log** at the bottom.

---

## 1. Test types

| Type | Tool | What it covers | When |
|---|---|---|---|
| Lint + types | ESLint, `tsc --noEmit` | Code mistakes, type errors | Every commit |
| Unit tests | Vitest | Each tool's `run()` with fixture files | Every PR touching `src/tools` |
| Component tests | Vitest + Testing Library | ToolShell, UploadBox, forms | Every PR touching UI |
| End-to-end | Playwright | Real browser flows, privacy test | Every PR (CI) |
| Manual checks | Checklist below | Look and feel, mobile, edge cases | Every PR |
| Security review | Checklist below | RLS, secrets, CSP | Every PR touching auth/DB, and before each release |
| Release test | Full checklist | Everything | Before V1, V2, V3 launch |

Commands:
```bash
npm run lint && npm run typecheck && npm run test && npm run test:e2e && npm run build
```

## 2. 🔒 Privacy check (MANDATORY for every tool and every release)

This is the most important test. The product promise is "your file never leaves your device".

### 2.1 Manual check
1. Open the tool page in Chrome. Press **F12** → **Network** tab → tick "Preserve log".
2. Clear the list.
3. Add a test file and run the tool. Download the result.
4. Look at every request made during the run:
   - ✅ Allowed: loading our own JS/WASM/model files (GET), Supabase history insert (small JSON, metadata only) if logged in, anonymous usage count.
   - ❌ Not allowed: any request whose body contains file data, page images or extracted text; any request to an unknown domain.
5. Second test: load the page, **turn off Wi-Fi**, run the tool. It must still work (except login/history sync).

### 2.2 Automated check (Playwright)
- Test listens to `page.on('request')` during a tool run.
- Fails if any request:
  - has a body larger than **10 KB**, or
  - goes to a domain not in the allow-list (our domain, Supabase URL).
- Runs for every tool in `registry.ts` with a fixture file.

### 2.3 History check
- History rows contain only: tool, file name (if allowed), file count, sizes, time.
- With "save file names" turned off, `file_name` is null.

## 3. Fixture files (`tests/fixtures/`)

| File | Purpose |
|---|---|
| `simple-3p.pdf` | Normal text PDF, 3 pages |
| `large-150p.pdf` | Many pages, performance |
| `big-80mb.pdf` | Large file handling |
| `scanned.pdf` | Image-only pages (OCR) |
| `scanned-hindi.pdf`, `scanned-bengali.pdf` | OCR languages |
| `encrypted.pdf` (password `test123`) | Lock/unlock, error messages |
| `owner-locked.pdf` | Printable but edit-restricted |
| `corrupt.pdf` | Broken file handling |
| `form.pdf` | Fillable fields |
| `mixed-sizes.pdf` | A4 + Letter + landscape pages |
| `rotated.pdf` | Pages with existing rotation |
| `table.pdf` | PDF to Excel |
| `unicode.pdf` | Hindi/Bengali text, special characters |
| `photo.jpg`, `photo.png`, `photo.heic`, `signature.png` | Image tools, exam resizer |
| `sample.docx`, `sample.xlsx`, `sample.pptx`, `sample.html` | Conversions |
| `fake-aadhaar.pdf` | Masking (use **fake** numbers only, never real data) |

Never commit real personal documents.

## 4. Per-tool test checklist

Copy this into the PR for each new or changed tool:

```
Tool: ____________
[ ] Works with simple-3p.pdf (or the right fixture type)
[ ] Works with large-150p.pdf in reasonable time (note seconds: __)
[ ] Big file (80 MB) works or shows friendly "too large" message
[ ] Encrypted file → friendly message, no crash
[ ] Corrupt file → friendly message, no crash
[ ] Wrong file type → rejected by UploadBox with a clear message
[ ] Multiple files (if supported) keep correct order
[ ] Cancel works mid-run
[ ] Output opens correctly in Chrome PDF viewer AND Adobe Reader (or another viewer)
[ ] Output size shown before → after
[ ] Privacy check passed (manual + automated)
[ ] Works offline after first load
[ ] UI did not freeze during the run
[ ] Unit test added
```

### Tool-specific checks

| Tool | Extra checks |
|---|---|
| Merge | Order kept; bookmarks/links don't break the file; mixed page sizes |
| Split | Ranges like `1-3, 5, 8-` parse correctly; invalid ranges show a clear message |
| Organize | Rotation adds to existing rotation correctly |
| Compress | Output is smaller (or tool says "already small"); text stays selectable |
| Compress to exact KB | Final size ≤ target; message if target impossible |
| Exam resizer | Exact pixel size and ≤ KB limit; presets match the official notice |
| JPG ↔ PDF | Orientation and EXIF rotation correct; HEIC supported or clear message |
| Watermark / page numbers | Correct on rotated and mixed-size pages |
| Sign | Signature position stays correct after zoom; transparent background |
| Forms | Filled values visible in other viewers; flatten option works |
| OCR | Text is searchable and selectable; Hindi/Bengali accuracy acceptable |
| Redact | **Redacted text cannot be copied, searched or extracted** (test with `pdftotext` or by copy-paste) |
| Aadhaar/PAN mask | Catches numbers with spaces and dashes; user can adjust before saving |
| Lock / unlock | Wrong password message; unlocked file opens without password |
| Remove metadata | Author, title, creator, dates cleared (check document properties) |
| Compare | Changed words highlighted; identical files say "no differences" |
| PDF to Excel | Cells line up for clean tables; warns for scanned input |
| AI tools | Answers cite pages; works offline; device-too-weak message; no network calls with content |
| Desktop conversions | Fonts and layout reasonable; works without internet |

## 5. UI / UX checklist (every PR touching UI)

```
[ ] Looks right at 375 px (phone), 768 px (tablet), 1440 px (desktop)
[ ] Light and dark mode both checked
[ ] Keyboard only: can reach and use every control; focus ring visible
[ ] Screen reader labels on icon buttons
[ ] Text contrast meets WCAG AA
[ ] Loading, empty and error states exist
[ ] Copy is simple and friendly (see DESIGN.md §10)
[ ] No console errors or warnings
```

Browsers: latest Chrome, Edge, Firefox on desktop; Chrome on Android. Safari: best effort, note issues in the Bug Log.

## 6. Auth, history and admin checklist

```
[ ] Sign up, log in, log out with email/password
[ ] Google login works on deployed URL (redirect URLs set in Supabase)
[ ] Magic link works
[ ] All P0 tools usable while logged out
[ ] Logged-out history saved locally (IndexedDB) and can be cleared
[ ] Logged-in history saved after a run; search, delete one, delete all work
[ ] User A cannot read User B's history (test with two accounts via the Supabase client in the console)
[ ] Non-admin cannot open admin data (page empty AND direct queries rejected by RLS)
[ ] Blocked user cannot insert history
[ ] Admin can toggle a tool off → tool page shows "paused"
[ ] Feedback form submits without any file data
```

## 7. Security checklist (before each release)

```
[ ] No secrets in the repo (search for "service_role", "secret", "key=")
[ ] Only NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY used in frontend
[ ] RLS enabled on every table (Supabase dashboard → Auth → Policies, and Security Advisor clean)
[ ] CSP header present; connect-src limited to self + Supabase
[ ] No new dependency with AGPL/GPL/unknown licence (run a licence checker, e.g. `npx license-checker --summary`)
[ ] `npm audit` reviewed; high/critical issues fixed or logged
[ ] Desktop installer signed; updater uses signed updates (V3)
```

## 8. Performance targets

| Case | Target |
|---|---|
| Home page load (4G mobile) | Interactive under 3 s |
| Merge two 10-page PDFs | Under 2 s on mid-range laptop |
| Compress 20-page 5 MB PDF | Under 5 s |
| OCR one page | Under 10 s |
| UI freeze during any tool | None (worker-based) |

Measure with Chrome DevTools Performance tab and Lighthouse. Record results in the release notes.

## 9. Release test (before V1, V2, V3)

1. All automated tests green on `main`.
2. Every tool: per-tool checklist (section 4).
3. Privacy check on every tool (section 2).
4. UI checklist on 3 screen sizes, both themes.
5. Auth/history/admin checklist.
6. Security checklist.
7. Lighthouse on home and one tool page (Performance, Accessibility, Best Practices, SEO all ≥ 90 target).
8. Offline test (PWA, from V2).
9. Desktop: install on a clean Windows PC, run every desktop tool, test auto-update (V3).
10. Zero open **P0** bugs.

## 10. Bug severity

| Level | Meaning | Rule |
|---|---|---|
| **P0 – Critical** | File data leaves device, data loss, security hole, app unusable | Fix before anything else; blocks release |
| **P1 – High** | A tool gives wrong output or crashes on common files | Fix before release |
| **P2 – Medium** | Works but awkward, slow, or wrong on rare files | Fix soon |
| **P3 – Low** | Cosmetic, typo | Fix when convenient |

## 11. Bug Log

Add new bugs at the top. Keep fixed bugs for history. IDs: `BUG-001`, `BUG-002`, ...

| ID | Date | Severity | Area / Tool | Description & steps to reproduce | Found by | Owner | Status | Fix PR |
|---|---|---|---|---|---|---|---|---|
| BUG-000 | 2026-11-25 | P3 | Docs | Example row. Replace with real bugs. | Agniv | Agniv | Closed | – |

Status values: `Open`, `In progress`, `Fixed`, `Won't fix`, `Closed`.

## 12. Audit log (releases and reviews)

| Date | Version | What was checked | Result | By |
|---|---|---|---|---|
| | | | | |
