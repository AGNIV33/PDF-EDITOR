# PRD: Product Requirements Document

**Product:** PDF Tools (working name, final name TBD)
**Owners:** Agniv Sarkar (tools engine), Rohit (platform)
**Status:** Draft v1, November 2026
**Budget:** Rs. 0 (free tools and free tiers only)

---

## 1. Summary

A free, all-in-one PDF and document toolkit, delivered as a website first and a Windows desktop app later. It covers what tools like iLovePDF offer (merge, split, compress, convert, edit, sign, secure) but with one core promise:

> **Your file never leaves your device.**

All file processing runs inside the user's browser (WebAssembly + JavaScript) or inside the desktop app. Only small, non-file metadata (account, history rows) is stored online.

## 2. Problem

- Popular PDF sites upload users' files to their servers. Many users handle private papers (Aadhaar, PAN, bank statements, contracts, exam forms) and do not want that.
- Free plans on competitor sites limit usage, batch processing and workflows.
- Indian students and job seekers repeatedly struggle with form rules such as "photo under 50 KB", "signature 140x60 px", "PDF under 200 KB". No major tool focuses on this.

## 3. Goals

| # | Goal | How we measure it |
|---|---|---|
| G1 | Private by design | 0 file uploads, verified in the browser Network tab for every tool |
| G2 | Cover the common PDF tasks | All Version 1 tools shipped and working |
| G3 | Win a narrow audience first | Indian students and job seekers return and use exam tools |
| G4 | Free to run | Monthly cost stays Rs. 0 |
| G5 | Portfolio-quality project | Clean code, docs, live demo link |

## 4. Non-goals (for now)

- Cloud storage of user files
- Real-time collaboration on a PDF
- Paid plans or payments (revisit after Version 3)
- iOS / Android native apps (a PWA comes first)
- Perfect "edit any existing text like Adobe" editing

## 5. Target users

| Persona | Need | Key tools |
|---|---|---|
| **Student / job seeker (primary)** | Make files fit exam and job form limits | Compress to exact KB, photo and signature resizer, JPG to PDF, merge |
| **Privacy-sensitive professional** (lawyer, CA, HR) | Process confidential files safely | Redact, Aadhaar/PAN masking, lock, sign, metadata remover |
| **Everyday user** | Quick one-off PDF jobs | Merge, split, compress, convert, rotate |
| **Power user** | Do the same job on many files | Batch mode, workflows, command palette |

## 6. Competitor snapshot: iLovePDF

Offers organize, optimize, convert to/from PDF, edit, security and AI tools (summarizer, translate, PDF to Markdown), workflows (limited for free users), desktop and mobile apps, and a paid Premium plan. Files are processed on their servers.

**Our edge:**
1. 100% on-device processing
2. India-focused exam and form tools
3. Free batch mode and workflows
4. AI chat with PDF that cites page numbers (offline when possible)
5. PDF, image and scanner tools in one place

## 7. Feature requirements

Priority: **P0** = Version 1 (must ship), **P1** = Version 2, **P2** = Version 3.
Where: **W** = website (browser), **D** = desktop app only.

### 7.1 Core PDF tools

| Feature | Priority | Where | Notes |
|---|---|---|---|
| View PDF (zoom, scroll, thumbnails, search) | P0 | W | PDF.js |
| Merge PDF | P0 | W | |
| Split PDF | P0 | W | By range or every page |
| Organize pages (reorder, delete, rotate, extract) | P0 | W | Drag and drop |
| Compress PDF | P0 | W | Presets: low, medium, high |
| Crop pages | P0 | W | |
| Add watermark (text or image) | P0 | W | |
| Add page numbers, header, footer | P0 | W | |
| Annotate: highlight, underline, strikethrough, notes | P0 | W | |
| Draw: pen, shapes, arrows | P0 | W | |
| Add images | P0 | W | |
| Sign (draw, type, upload) | P0 | W | Normal e-signature only |
| Fill forms | P0 | W | |
| Undo / redo | P0 | W | |
| Create forms (add fillable fields) | P1 | W | |
| OCR (scanned to searchable text, Hindi and Bengali too) | P1 | W | Tesseract.js |
| Lock / unlock with password | P1 | W | qpdf-wasm |
| Redact (permanent black-out) | P1 | W | Must truly remove underlying text |
| Remove hidden metadata | P1 | W | Author, GPS, edit history |
| Compare two PDFs | P1 | W | |
| Repair PDF | P1 | W | qpdf |
| Edit existing text | P2 | W/D | Limited: cover old text, write new |
| DSC signing (user's own USB token) | P2 | D | |

### 7.2 Conversion tools

| Feature | Priority | Where | Quality note |
|---|---|---|---|
| JPG / PNG to PDF | P0 | W | Good |
| PDF to JPG / PNG | P0 | W | Good |
| HTML to PDF | P1 | W | Decent |
| Text / Markdown to PDF | P1 | W | Good |
| PDF to Excel | P1 | W | Clean tables only; scanned files need OCR first |
| PDF to PowerPoint | P1 | W | Slides are images, not editable text |
| Word to PDF (basic) | P1 | W | Layout may shift on complex files |
| Word / Excel / PowerPoint to PDF (accurate) | P2 | D | LibreOffice bundled |
| PDF to Word (editable) | P2 | D | Licence check required before choosing a library |
| PDF to PDF/A | P2 | D | Licence check required |
| EPUB to PDF | P2 | W | |

### 7.3 India-focused tools

| Feature | Priority | Where |
|---|---|---|
| Compress to an exact size ("under 200 KB") | P1 | W |
| Exam photo and signature resizer (exact KB and pixels, presets for SSC, UPSC, banking forms) | P1 | W |
| Aadhaar / PAN auto-masking | P1 | W |
| Passport photo maker | P1 | W |
| Hindi and Bengali OCR | P1 | W |

### 7.4 AI tools (offline first)

| Feature | Priority | Where |
|---|---|---|
| Chat with PDF (answers cite page numbers) | P2 | W/D |
| Chat across many PDFs | P2 | W/D |
| Summary (one line, bullets, detailed) | P2 | W/D |
| Explain selected text simply | P2 | W/D |
| Quiz and flashcards from notes | P2 | W/D |
| Translate PDF keeping layout (incl. Hindi, Bengali) | P2 | W/D |
| Smart form fill from saved details | P2 | W/D |
| Smart rename from content | P2 | W/D |
| Auto-split a bundle by content | P2 | W/D |
| Tables / invoices to Excel | P2 | W/D |
| Resume ATS checker | P2 | W/D |
| Contract risk highlighter | P2 | W/D |
| Auto-clean scanned pages (deskew, sharpen) | P2 | W |
| Accessibility: auto tags and alt text | P2 | W/D |

AI runs on the device (WebLLM / Transformers.js in browser, Ollama or llama.cpp in desktop). An optional online fallback using a free API tier may be added only with clear user consent, because it sends text off the device.

### 7.5 Extra (non-PDF) tools

| Group | Features | Priority |
|---|---|---|
| Images | Compress, resize, crop, convert (JPG/PNG/WebP/HEIC), background remover, upscaler, image to text | P1 (basic), P2 (AI) |
| Documents | Word/Excel/PPT viewer, Markdown to PDF, text compare | P1/P2 |
| Scanner | Camera to clean PDF scan, QR scan and generate | P2 |
| Audio / video | Video to GIF, compress video, speech to text, lecture to notes | P2 |
| Productivity | Invoice maker, resume maker, bulk certificate maker from Excel | P2 |

### 7.6 Power-user features

| Feature | Priority |
|---|---|
| Batch mode (one tool on many files) | P1 |
| Workflows (chain tools, e.g. compress, watermark, lock) | P1 |
| Command palette (Ctrl+K) | P1 |
| Tabs (several PDFs side by side) | P1 |
| Version history inside a session | P2 |
| Dark mode | P0 |
| Reading mode, read aloud, dyslexia-friendly font | P2 |

### 7.7 Platform features

| Feature | Priority | Notes |
|---|---|---|
| Use tools without an account | P0 | Always |
| Login: email + password, Google, magic link | P0 | Supabase Auth |
| History (metadata only) with search and delete | P0 | Local-only history for logged-out users |
| Privacy badge on every tool page | P0 | "Your file never leaves this device" |
| Admin dashboard | P1 | Users, usage, tool on/off, feedback, download count |
| Feedback / bug report form | P1 | |
| Installable web app (PWA), works offline | P1 | |
| Desktop app (Windows) via Tauri | P2 | Installer on GitHub Releases, auto-update |
| "Download for Windows" button | P2 | |

## 8. User stories (Version 1)

- As a student, I can merge my marksheets into one PDF without signing up.
- As a job seeker, I can compress a PDF and see the size before and after.
- As any user, I can see that my file was not uploaded.
- As a logged-in user, I can see which tools I used and when, and delete that history.
- As a user, I can sign a PDF by drawing my signature.
- As a user on a phone, I can do all of the above.

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| Privacy | No file bytes sent over the network, ever (website). Verified per tool. |
| Performance | Common tools finish in under 5 seconds for a 20-page, 5 MB PDF on a mid-range laptop. UI never freezes (Web Workers). |
| File limits | Handle at least 100 MB PDFs on desktop browsers; show a friendly warning above that. |
| Compatibility | Latest Chrome, Edge, Firefox; Android Chrome. Safari best effort. |
| Accessibility | WCAG 2.1 AA basics: keyboard navigation, contrast, labels. |
| Language | English UI first; Hindi and Bengali UI later (P2). |
| Cost | Rs. 0 per month. |
| Licences | No AGPL code in shipped builds unless both owners agree. |

## 10. Success metrics (first 3 months after launch)

- Weekly active users and returning users (7-day return rate)
- Top 5 tools by usage
- Error rate per tool (failed runs / total runs)
- Desktop downloads (after Version 3)
- Feedback count and top complaints

Analytics must stay privacy-friendly: count tool runs, never file contents or file names unless the user is logged in and history is on.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Big competitors own Google search | Target long-tail searches (exam form sizes, "offline PDF", "no upload") |
| Users don't value privacy | Lead with speed and India tools, privacy as a bonus |
| Offline AI is slow on weak PCs | Make AI optional; small models; optional online fallback with consent |
| Office conversion poor in browser | Ship accurate versions in the desktop app |
| Scope too large for 2 people | Strict versioning; launch V1 small and early |
| Supabase free project pauses when idle | Keep-alive ping; check limits before launch |
| Licence problems | Licence check before adding any library |

## 12. Release plan

| Version | Scope |
|---|---|
| **V1** | Core page tools, compress, JPG/PDF conversion, annotate, sign, forms, login, history, deploy |
| **V2** | OCR, India tools, security tools, basic conversions, image tools, admin, batch, workflows, PWA |
| **V3** | AI tools, scanner, audio/video, desktop app with accurate Office conversion and DSC |

Detailed build order: see `IMPLEMENTATION_PLAN.md`.

## 13. Open questions

1. Final product name and domain (free `*.vercel.app` until decided).
2. Will the project ever be paid or closed source? (Affects licence choices.)
3. Which free online AI fallback, if any, and how to ask consent.
4. Exact exam presets list (collect from real form notices).
