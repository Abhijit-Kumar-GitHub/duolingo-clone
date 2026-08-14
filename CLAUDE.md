# Duolingo Clone — Claude Code project memory

Read this before doing anything. It's the condensed version of decisions
and gotchas from the session that built this project — not a repeat of
what's already derivable from the code. For architecture, DB schema, and
API reference, see `README.md` — it's kept in sync with the actual code
and should be treated as accurate, not aspirational.

## Context

SDE Fullstack take-home assignment (see `Assignment_Duolingo_Clone.md` if
present, or ask the user). Deadline-driven — prioritize working end-to-end
over polish. Evaluated on: functionality, UI/UX fidelity to real Duolingo,
DB design, API design, code quality/modularity, and the candidate's ability
to *explain* the code in an interview — so prefer changes that stay easy to
narrate over clever ones.

## Stack

Next.js 14 (App Router, TS) + Tailwind + Zustand · FastAPI + SQLAlchemy +
Pydantic v2 · SQLite. Auth is intentionally mocked (`X-User-Id` header,
hardcoded to `1` on the frontend) per the assignment's "assume a default
logged-in learner" allowance — don't build real auth unless asked.

## Status as of last session

Fully working end-to-end: seeded 2-unit/6-skill Spanish course, full lesson
loop (5 exercise types), hearts/streak/XP/crowns, leaderboard, achievements,
hover popovers on the stats bar (course/streak/gems/hearts, plus a new
GoalPopover for the daily XP goal ring — see below) matching real
Duolingo's desktop UI. A `MobileNav` bottom tab bar (`components/features/
MobileNav.tsx`) now covers phone widths, since `Sidebar.tsx` is `hidden`
below `md`. Backend routes were curl-tested.

**Latest pass added:** `users.xp_today` (computed in `crud.get_xp_today`,
exposed on `GET /api/user/me`) backing a daily-goal progress ring in the
stats bar; match-pairs heart-loss fix (see pitfall #4 below); mobile bottom
nav.

**Not done yet:** actual deployment (Vercel + Railway/Render), filling in
the live demo URL in `README.md`, committing/pushing this pass's changes,
confirming the GitHub repo is public, dark mode. A screenshot-based UI/UX
diff against the real Duolingo app is planned as a follow-up.

## Pitfalls hit last session — verify before trusting

1. **Duplicate code silently appeared** across several files during the
   build (duplicate route definitions, duplicate Pydantic schemas with
   mismatched field names, a whole parallel set of components under a
   different name). Root cause unclear, but the lesson stands regardless
   of tool: **don't assume a file is what you last wrote — re-view it
   before trusting it, especially after several edits in a row.** Before
   considering a work session done, grep for duplicate `class`/`def`/
   `@router.` /`export` declarations across the repo.
2. **`next build` fails in some sandboxes** because `next/font/google`
   can't reach Google Fonts (network-restricted environment). If a build
   fails specifically on the `Nunito` import in `src/app/layout.tsx`,
   that's the likely cause, not a real bug — don't "fix" it by ripping out
   the font permanently. If you must verify a build in a no-network
   sandbox, temporarily swap `layout.tsx` for a version without the
   `next/font` import, confirm everything else compiles, then restore it.
3. **Achievements are evaluated lazily**, not via a background job — on
   `/api/lesson/complete` and on `/api/profile`. If you add a new stat that
   feeds an achievement, make sure it's evaluated somewhere reachable on
   read, or a pre-seeded/backdated user will show it as un-earned until
   they take an action.
4. ~~Match-pairs exercises don't deduct a heart on a mismatched guess~~ —
   **fixed**: `MatchPairs.tsx` now calls `useLessonStore.loseHeartForMismatch`
   on every mismatched tap, which hits `/api/lesson/check-answer` with a
   guaranteed-wrong sentinel purely to reuse its heart-loss logic (no
   feedback bar shown — the exercise's own shake animation covers that).
   `README.md`'s "Known simplifications" section was updated to match.

## Conventions already established — follow, don't reinvent

- Backend layering: `routes.py` (thin HTTP) → `crud.py` (all business logic
  + queries) → `models.py`. Don't put query logic in routes.
- New exercise type = one payload shape in `seed.py` + one component in
  `frontend/src/components/features/exercises/` + one entry in
  `LessonPlayer.tsx`'s type map. Nothing else should need to change.
- Duolingo's actual brand colors are already tokenized in
  `frontend/tailwind.config.ts` (`duo-green`, `duo-red`, etc.) — use those
  tokens, never a raw hex.


## Reseeding / resetting local state

```bash
rm -f backend/app/duolingo.db && cd backend && python -m app.seed
```
