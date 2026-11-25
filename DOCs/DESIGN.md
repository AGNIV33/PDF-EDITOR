# DESIGN.md: Visual & UI System

## 1. Design principles

1. **Simple first.** One clear action per screen: drop a file, press one button, download.
2. **Trust is visible.** The privacy badge and "processed on your device" message appear on every tool page.
3. **Fast to scan.** Tools grouped by category with clear icons and one-line descriptions.
4. **Works on a phone.** Every screen is designed mobile-first.
5. **Friendly words.** No jargon in the UI. "Make smaller" beats "Optimize".
6. **Accessible.** Keyboard friendly, good contrast, readable sizes.

## 2. Brand

- **Name:** TBD (placeholder: "PDF Tools").
- **Personality:** calm, trustworthy, quick. Not playful, not corporate-cold.
- **Logo:** simple shape (folded page + shield/lock hint) in the primary colour. To be designed.

## 3. Colour tokens

Defined as CSS variables and mapped in `tailwind.config`. Never hard-code hex values in components.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-primary` | `#2563EB` | `#3B82F6` | Main buttons, links, active states |
| `--color-primary-hover` | `#1D4ED8` | `#60A5FA` | Hover on primary |
| `--color-primary-soft` | `#EFF6FF` | `#1E293B` | Selected cards, soft backgrounds |
| `--color-success` | `#16A34A` | `#22C55E` | Done states, privacy badge |
| `--color-warning` | `#D97706` | `#F59E0B` | Warnings (large file, slow device) |
| `--color-danger` | `#DC2626` | `#EF4444` | Errors, destructive actions |
| `--color-bg` | `#FFFFFF` | `#0B1220` | Page background |
| `--color-surface` | `#F8FAFC` | `#111827` | Cards, panels |
| `--color-border` | `#E2E8F0` | `#1F2937` | Borders, dividers |
| `--color-text` | `#0F172A` | `#F1F5F9` | Main text |
| `--color-text-muted` | `#64748B` | `#94A3B8` | Secondary text |

**Category accent colours** (icon backgrounds only, at 10–15% opacity):

| Category | Colour |
|---|---|
| Organize | `#2563EB` blue |
| Optimize | `#16A34A` green |
| Convert to PDF | `#EA580C` orange |
| Convert from PDF | `#9333EA` purple |
| Edit | `#0891B2` cyan |
| Security | `#DC2626` red |
| India tools | `#F59E0B` saffron |
| AI | `#DB2777` pink |
| Image / other | `#475569` slate |

All text/background pairs must meet **WCAG AA contrast (4.5:1 for body text)**. Check with a contrast checker before merging new colours.

## 4. Typography

- **Font:** Inter (open licence) via `next/font`, fallback `system-ui, sans-serif`.
- **Hindi / Bengali UI (later):** Noto Sans Devanagari, Noto Sans Bengali.

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| Display | 40 / 48 px (28 / 36 on mobile) | 700 | Home hero |
| H1 | 32 / 40 | 700 | Page titles |
| H2 | 24 / 32 | 600 | Section titles |
| H3 | 18 / 26 | 600 | Card titles |
| Body | 16 / 24 | 400 | Default text |
| Small | 14 / 20 | 400 | Helper text, labels |
| Tiny | 12 / 16 | 500 | Badges, captions |

Minimum body text on mobile: 16 px.

## 5. Spacing, radius, shadow

- **Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64. Use Tailwind spacing that matches.
- **Radius:** 8 px (inputs, buttons), 12 px (cards), 16 px (upload box, modals), full (pills, badges).
- **Shadow:** subtle only. `sm` for cards on hover, `lg` for modals and dropdowns. No heavy shadows.
- **Max content width:** 1200 px; tool workspace up to 1400 px.

## 6. Layout and breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640 px | 1 column, bottom-sticky action button |
| Tablet | 640–1024 px | 2–3 tool cards per row |
| Desktop | > 1024 px | 4 tool cards per row; tool page with side options panel |

**Global layout:** top navbar (logo, Tools, History, theme toggle, Login/Avatar), content, footer (Privacy, About, Feedback, Download app, GitHub).

## 7. Icons

- **Set:** Lucide (ISC licence). One style everywhere, 20 px in UI, 24 px in tool cards.
- Every tool has one icon defined in its `ToolDefinition.icon`.

## 8. Components

| Component | Description | States |
|---|---|---|
| **Button** | Primary, secondary, ghost, danger; sizes sm/md/lg | default, hover, focus, disabled, loading |
| **ToolCard** | Icon, name, one-line description; whole card clickable | default, hover, focus, "New" tag, "Desktop only" tag, paused |
| **UploadBox** | Large dashed area, "Drop files here or choose files", accepted types, size hint | idle, drag-over, invalid file, has files |
| **FileList** | Thumbnails or rows with name, size, pages; drag to reorder; remove button | |
| **OptionsPanel** | Right side on desktop, below files on mobile | |
| **ProgressBar** | Percent + step text ("Reading page 3 of 20") + Cancel | running, done, error |
| **ResultCard** | Output name, size before → after (with % saved), Download, "Start over", "Use another tool on this file" | |
| **PrivacyBadge** | Green pill with lock icon: "Your file never leaves this device" | Tooltip explains how to verify |
| **Toast** | Short confirmations ("Downloaded") | success, error, info |
| **Alert** | Inline messages for errors and warnings, simple words, optional "Report this" link | |
| **Modal** | Confirmations (delete history), sign pad, forms | |
| **CommandPalette** | Ctrl+K search over tools | |
| **Tabs** | Several open PDFs | |
| **EmptyState** | Illustration-free icon + one sentence + action | |
| **Skeleton** | Loading placeholders | |
| **DataTable / Chart** | Admin only | |

Every interactive element needs a visible **focus ring** (2 px primary outline, 2 px offset).

## 9. Key screens

### 9.1 Home
- Hero: title ("Every PDF tool you need. Your files never leave your device."), sub-line, primary button "Choose a tool", PrivacyBadge.
- Search box for tools.
- Popular tools row (Merge, Split, Compress, JPG to PDF, Sign, Exam photo resizer).
- All tools grid grouped by category.
- "Why us" strip: Private, Free, Works offline, Made for India.
- Download desktop app banner (V3).

### 9.2 All tools
- Category filter chips + search. Grid of ToolCards.

### 9.3 Tool page (ToolShell)
1. Title + one-line description + PrivacyBadge
2. UploadBox (before files) → FileList + OptionsPanel (after files)
3. Big primary action button ("Merge PDF")
4. ProgressBar while running
5. ResultCard when done
6. Short "How it works" (3 steps) and FAQ below for SEO

Mobile: action button sticks to the bottom of the screen.

### 9.4 PDF editor workspace (annotate, sign, edit)
- Top toolbar: select, text, highlight, draw, shapes, image, sign, undo/redo, zoom.
- Left: page thumbnails (collapsible). Centre: page canvas. Right: properties panel (colour, size).
- Mobile: toolbar at bottom, thumbnails in a drawer.

### 9.5 Login
- Email + password, "Continue with Google", "Email me a magic link".
- Note: "You can use all basic tools without an account."

### 9.6 History
- List: tool icon, file name (or "Hidden"), sizes, date. Search, filter by tool, delete one, delete all.
- Toggle: "Save file names in history".
- Empty state: "No history yet. Your files are never stored, only what tool you used."

### 9.7 Admin dashboard
- KPI cards: total users, new users today, tool runs today, desktop downloads.
- Charts: new users per day, runs per tool, runs over time.
- Tables: users (block/delete), tool switches, feedback list.

### 9.8 Download (V3)
- "Download for Windows" button, version, size, what extra the desktop app can do.

### 9.9 Privacy page
- Plain-language explanation of what stays on the device, what is stored, and how to verify with the Network tab.

## 10. Copy (UI text) guidelines

- Short sentences, everyday words, active voice.
- Buttons say what happens: "Merge PDF", "Download", "Make smaller".
- Errors say what happened and what to do:
  - ✅ "This PDF is password protected. Please unlock it first."
  - ❌ "Error: EncryptedPDFError at parse()"
- Use numbers people understand: "2.4 MB → 680 KB (72% smaller)".
- No blame: "We couldn't read this file" not "You uploaded a bad file".

## 11. Motion

- 150–200 ms ease-out for hovers, dropdowns, toasts.
- Progress animations only; no decorative motion.
- Respect `prefers-reduced-motion` (turn off non-essential animation).

## 12. Dark mode

- Follows system setting by default; toggle in navbar; choice saved locally.
- Every component must be checked in both themes before merging.

## 13. Accessibility checklist

- All functions usable with keyboard only (Tab, Enter, Space, Esc, arrows for page lists).
- Icon-only buttons have `aria-label`.
- UploadBox works with keyboard and screen readers (hidden file input with label).
- Progress announced with `aria-live="polite"`.
- Colour is never the only signal (add icons/text for success/error).
- Touch targets at least 44 × 44 px.

## 14. Design files

- Screens may be drafted in Figma or Google Stitch; link them here when created.
- If the design file and this document disagree, update this document first, then the code.
