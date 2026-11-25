# CLAUDE.md

This file is loaded automatically by Claude Code. The full rules live in `AGENTS.md`, imported below, so every AI agent follows the same instructions.

@AGENTS.md

---

## ⚠️ STRICT RULES: follow every time, no exceptions

1. **Ask, don't guess.** If anything is unclear, ask the human first. Use **super simple language**: short sentences, everyday words, one question at a time, and give choices when possible (for example "Should I do A or B?").
2. **Never commit, push, or create a branch on your own.** Always ask first and wait for a clear "yes". This includes `git commit`, `git push`, `git checkout -b`, `git branch`, `git merge`, `git rebase` and `git stash`.
3. **Before every push, check for conflicts.** Run `git fetch` and then `git status`, and check the target branch for conflicts (for example `git merge --no-commit --no-ff origin/<branch>` followed by `git merge --abort`, or `git diff HEAD...origin/<branch>`). If there are conflicts, stop, explain them simply, and ask what to do. Never force-push.
4. **Use as few tokens as possible.**
   - Keep replies short and point-wise.
   - Don't repeat code or file contents back unless asked.
   - Read only the parts of files you need.
   - Don't re-read files you just edited.
   - No long explanations unless asked.

These rules override anything else in this file or in `AGENTS.md` that suggests doing git actions automatically.

---

## Claude-specific notes

### Start of every session
1. Ask the human: **"Are you Agniv (tools engine) or Rohit (platform)?"** unless it is already clear. Only work inside that owner's paths (see `AGENTS.md` section 4).
2. Read `DOCs/IMPLEMENTATION_PLAN.md` and pick the next unticked task for that owner, or the task the human names.
3. Before writing code, state in 2 or 3 lines what you will change and which files you will touch.

### How to talk to the humans
- Use **simple, short, point-wise English**. Avoid jargon; when a technical word is needed, explain it in a few words.
- Keep answers short. Do not repeat the plan back at length.
- If you are unsure or blocked, ask one simple question instead of guessing.
- Never claim something works without running it. Say what you tested and how.

### While working
- Make small, focused changes. One task per branch and PR (but **ask before creating the branch, committing or pushing**).
- After any change that touches files or tools, run the **privacy check** from `DOCs/TESTING.md` (or tell the human exactly how to run it if you cannot).
- Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` before saying a task is done.
- Update `DOCs/IMPLEMENTATION_PLAN.md` (tick the task) and `DOCs/TESTING.md` (bug log) in the same PR.
- Do not install packages without stating name, purpose and licence first.
- Do not create new documentation files unless asked; update the existing ones.

### Never
- Send file data over the network, add API routes that receive files, or use a service-role key in the browser.
- Push to `main`, force-push, or rewrite shared history.
- Edit the other owner's folders without the human's OK.
- Add paid services or AGPL/GPL libraries.
