# Duolingo Clone

A functional clone of Duolingo's learning path, lesson loop, and gamification
mechanics (XP, streaks, hearts, crowns, leaderboard, achievements).

**Live demo:** <https://duolingo-clone-navy-three.vercel.app>
**Repo:** <https://github.com/Abhijit-Kumar-GitHub/duolingo-clone>

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript), Tailwind CSS, Zustand, react-confetti |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic v2 |
| Database | SQLite |
| Deployment | Frontend → Vercel · Backend → Render |

> The backend runs on Render's free tier, which sleeps after 15 minutes of
> inactivity — the **first** request after a cold start can take ~30–50s
> before the path loads. Subsequent requests are immediate.

## Feature checklist

Every "must have" from the brief, and where it lives. Nothing in this table
is mocked.

| # | Requirement | Where it's implemented |
|---|---|---|
| 1 | Visual path/tree of units and skills, lock/unlock progression | `PathMap.tsx` + `PathNode.tsx`, driven by `GET /api/path` |
| 1 | Completed vs available vs locked states | `user_skill_progress.status`, unlocked in `crud.complete_lesson` |
| 1 | Progress rings / crowns per skill | conic-gradient ring in `PathNode.tsx`; `user_skill_progress.crowns` |
| 1 | Top bar: streak, XP, hearts, mocked gems | `StatsBar.tsx` + the four panels in `popovers/` |
| 2 | 5 exercise types (MC, word-bank translate, match pairs, fill blank, type answer) | `components/features/exercises/`, one component each |
| 2 | Immediate correct/incorrect feedback bar | `FeedbackBar.tsx`, graded by `POST /api/lesson/check-answer` |
| 2 | Progress bar across the lesson | `LessonPlayer.tsx` |
| 2 | Lose a heart on a wrong answer; failure handled | `crud.lose_heart`; `OutOfHeartsModal.tsx` mid-lesson **and** on entry |
| 2 | Award XP + mark skill progress on completion | `POST /api/lesson/complete` → `crud.complete_lesson` |
| 3 | Streak that increments on daily activity (testable) | `daily_activity` + `crud._apply_streak_decay`; `POST /api/user/simulate-day` to demo it |
| 3 | XP totals + leaderboard | `GET /api/leaderboard`, real weekly sums across 7 seeded users |
| 3 | Heart regeneration over time / mocked refill | 30-min regen in `crud._apply_heart_regen`; `POST /api/hearts/refill` |
| 3 | Daily goal / XP goal indicator | `users.daily_xp_goal` vs `crud.get_xp_today` → `DailyQuestsWidget.tsx`, `/quests` |
| 3 | All progress persists per user | SQLite; every mutation is committed, nothing lives only in client state |
| 4 | Course content stored in DB and seeded | `seed.py` → `units`/`skills`/`lessons`/`exercises` |
| 4 | Learner profile page with stats + achievements | `/profile` ← `GET /api/profile` |
| 5 | Playful gamified UI with mascot-style flourishes | `components/features/art/` (see Artwork below) |
| 5 | Animated feedback in the lesson player | feedback bar slide-in, shake on a wrong match, `animate-pop-in`/`bounce-in` |
| 5 | Modals, toasts, celebratory states | `LessonCompleteModal` (confetti), `OutOfHeartsModal`, the chest's `+N gems!` toast |
| 5 | Path navigation + progress visuals | sticky per-unit banner, unit dividers, jump-ahead, node popups, `/sections` |
| 5 | Settings placeholder | `/settings` |

## Bonus items

| Bonus | Status |
|---|---|
| Achievements / badges system | **Done** — 6 achievements, lazily evaluated, shown on `/profile` |
| Real functioning leaderboard across seeded users | **Done** — real weekly XP sums, not a static list |
| Responsive design (mobile / tablet / desktop) | **Done** — `MobileNav.tsx` bottom tab bar below `md`, right rail drops on narrow widths, no horizontal overflow at 390px |
| Timed practice / "legendary" challenge mode | **Partial** — practice replay at half XP works; Legendary is a Super feature and shows a Coming Soon note |
| Audio for exercises (TTS or seeded audio) | Not done |
| Dark mode | Not done |

## Project structure

```
duolingo-clone/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI entrypoint, CORS, lifespan (create tables + seed)
│   │   ├── database.py    # SQLAlchemy engine/session
│   │   ├── models.py      # ORM schema (see Database section below)
│   │   ├── schemas.py     # Pydantic request/response contracts
│   │   ├── crud.py        # All DB queries + gamification business logic
│   │   ├── routes.py      # HTTP layer — thin, delegates to crud.py
│   │   └── seed.py        # Seeds course content, achievements, learner, rivals
│   ├── requirements.txt
│   └── Procfile            # for Railway/Render
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (main)/            # routes with sidebar + stats bar
│       │   │   ├── page.tsx        # learning path (home)
│       │   │   ├── leaderboard/
│       │   │   ├── profile/
│       │   │   ├── sections/       # section list (Section 1 real, 2–3 Coming Soon)
│       │   │   ├── practice/       # placeholder + dev tools (simulate day, fill hearts)
│       │   │   ├── quests/         # daily-quest card (real XP goal, rest mocked)
│       │   │   ├── shop/           # placeholder (mocked gem store)
│       │   │   └── settings/       # placeholder
│       │   ├── lesson/[skillId]/   # full-screen lesson player (no sidebar)
│       │   ├── icon.svg            # favicon (App Router picks this up automatically)
│       │   └── layout.tsx          # root layout, font
│       ├── components/features/
│       │   ├── Sidebar.tsx, MobileNav.tsx, StatsBar.tsx, Popover.tsx
│       │   ├── popovers/           # CoursePopover, StreakPopover, GemsPopover, HeartsPopover
│       │   ├── art/                # hand-drawn SVG asset set — see "Artwork" below
│       │   ├── PathMap.tsx, PathNode.tsx, NodePopover.tsx, GlossyBadge.tsx
│       │   ├── JumpAheadBubble.tsx, GuidebookButton.tsx, FlagIcon.tsx
│       │   ├── rail/               # right-rail widgets (League, Daily Quests, Super, Following)
│       │   ├── LessonPlayer.tsx, FeedbackBar.tsx, ComingSoon.tsx
│       │   ├── exercises/          # MultipleChoice, TranslateWordBank, MatchPairs, FillBlank, TypeAnswer
│       │   └── modals/             # OutOfHeartsModal, LessonCompleteModal
│       ├── store/                  # useUserStore, useLessonStore (Zustand)
│       └── lib/api.ts              # typed fetch client + ApiError
└── README.md
```

## Setup

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs on `http://localhost:8000`. The database (`app/duolingo.db`) is created
and seeded automatically on first startup — nothing else to run. Swagger docs
at `http://localhost:8000/docs`.

To reseed from scratch: delete `app/duolingo.db` and restart the server
(or run `python -m app.seed` directly).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if backend isn't on :8000
npm run dev
```

Runs on `http://localhost:3000`.

## Deployment

**Backend → Render** (web service, root directory `backend`):

| Setting | Value |
|---|---|
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (also in `Procfile`) |
| `PYTHON_VERSION` | `3.11.9` |
| `CORS_ORIGINS` | the Vercel URL, comma-separated |

`PYTHON_VERSION` is not optional. Render **ignores `runtime.txt`** (it's
deprecated there, though the file is kept for Heroku-style platforms that
still read it), so without the env var the service builds on Python 3.14 —
for which `pydantic-core` ships no wheel, so pip falls back to compiling it
from Rust and the build fails on a read-only cargo cache. The error surfaces
as a maturin failure with no obvious link to the Python version.

`CORS_ORIGINS` is read in `main.py` and defaults to `*`, so the first deploy
works before the frontend URL exists; set it once Vercel has assigned one.

**Frontend → Vercel** (root directory `frontend`): set
`NEXT_PUBLIC_API_URL` to the Render service URL. No other configuration.

On Render's free tier the SQLite file lives on ephemeral disk, so the
database is recreated and reseeded whenever the instance restarts. That's
deliberate for a demo — the seeded learner is always in a known good state —
but it does mean progress made on the live link isn't permanent. Locally the
file persists normally.

## Architecture overview

**Auth is intentionally mocked**, per the assignment spec ("assume a default
logged-in learner"). Every API request carries an `X-User-Id` header
(hardcoded to `1` on the frontend, see `lib/api.ts`) instead of real auth.
The data model still fully supports multiple users — the leaderboard is
seeded with 6 other real user rows — only the *authentication* is stubbed,
not the schema.

**Backend layering:** `routes.py` (HTTP) → `crud.py` (business logic + DB
queries) → `models.py` (schema). Pydantic schemas in `schemas.py` are kept
separate from ORM models so the API contract can evolve independently of
storage. This keeps routes as thin translators and puts all the interesting
gamification rules (streak decay, heart regen, crown progression, skill
unlocking, achievement evaluation) in one testable place.

**Frontend state:** Two Zustand stores. `useUserStore` holds the top-bar
gamification numbers (streak/XP/hearts/gems) and is refetched after any
mutating action. `useLessonStore` is a small state machine for the lesson
player (current exercise index, hearts, feedback state, completion result)
that resets on mount/unmount so leaving mid-lesson doesn't leak state into
the next attempt.

**Exercise polymorphism:** rather than five separate tables, `exercises` has
a `type` column and a `payload` JSON column. Each of the five exercise React
components (`components/features/exercises/`) knows how to render its own
`payload` shape and reports the user's answer back up as a plain string,
which the backend compares case-insensitively against `correct_answer`.
Adding a 6th exercise type means: one new payload shape in `seed.py`, one new
React component, one new entry in `LessonPlayer.tsx`'s type map — nothing
else changes.

**Artwork (`components/features/art/`):** every game asset — the mascot,
streak flame, gem, heart, XP bolt, crown, treasure chest, trophy, league
badges, the sidebar's illustrated nav icons, the wordmark lockup and the
favicon — is hand-drawn inline SVG in this repo. Three reasons it isn't
emoji or an icon library:

1. **Emoji render differently per OS** and can't be tinted. Windows' Segoe
   UI Emoji has no flag-emoji ligatures at all, so 🇪🇸 falls back to the bare
   text "ES" — which is why `FlagIcon.tsx` exists too.
2. **Lucide is a monochrome *line* set.** Duolingo's economy icons are solid
   multi-tone shapes with a lit face and a shaded underside. A grey outlined
   gem next to a glossy green path node reads as two different apps. Lucide
   is still used, correctly, for genuine UI controls — the lesson close
   button, chevrons, arrows, locks, the checkmark on a finished node.
3. **Inline SVG can't 404**, needs no image request, and scales to any size —
   so the deployed build looks identical to local with no asset pipeline.

`art/icons.tsx` holds the game assets (drawn at many sizes), `art/navIcons.tsx`
the destination icons (one size, one place). Nav icons keep fixed colours and
never recolour on selection — it's the *row* that highlights, in blue.

These are original drawings in Duolingo's visual *language*, not copies of
its asset files, and "lingo" is this clone's own wordmark rather than a
reproduction of the trademarked one. The goal throughout was to recreate the
*interaction design and UX patterns* — colors, layout, motion, the lesson
loop, the node popups, the stats-bar popovers — not to copy brand assets.

## Database schema

```
users                 id, username, display_name, avatar_emoji, streak, longest_streak,
                       total_xp, hearts, max_hearts, gems, daily_xp_goal,
                       last_active_date, last_heart_lost_at, created_at

units                 id, title, description, order_index, color_theme

skills                id, unit_id → units, title, icon_name, order_index, description

lessons               id, skill_id → skills, title, order_index, xp_reward

exercises             id, lesson_id → lessons, type, prompt,
                       payload (JSON, shape depends on `type`), correct_answer, order_index

user_skill_progress   user_id → users, skill_id → skills  (composite PK)
                       status (locked|available|completed), crowns (0-5), lessons_completed

user_unit_checkpoints  user_id → users, unit_id → units  (composite PK)
                        opened, opened_at        [the mid-unit treasure-chest gate]

user_lesson_completions   id, user_id → users, lesson_id → lessons,
                           xp_earned, accuracy, completed_at        [append-only history log]

daily_activity         id, user_id → users, activity_date, xp_earned
                        UNIQUE(user_id, activity_date)              [streak + daily-goal backbone]

achievements            id, code, title, description, icon_name, requirement_type, requirement_value

user_achievements       user_id → users, achievement_id → achievements (composite PK), earned_at
```

**Design rationale:**
- `exercises.payload` is JSON so one table represents five structurally
  different exercise shapes without a sparse table full of nullable
  type-specific columns.
- `user_skill_progress` is the many-to-many join between users and skills
  *with attributes* (status, crown level) — not just a plain association
  table.
- `daily_activity` is an append-only log (one row per user per calendar day).
  It drives both the streak calculation (checked lazily on read — see
  `crud._apply_streak_decay`) and weekly leaderboard XP, so there's a single
  source of truth instead of counters that can drift.
- `user_lesson_completions` is a full history, not just a boolean, so profile
  stats can be derived rather than tracked as separate counters.
- `user_unit_checkpoints` stores only whether the chest was opened, not which
  skill it unlocked. The chest's position is *derived* (`crud.checkpoint_gate_index`
  = `ceil(skill_count / 2)`), so it stays correct if a unit's skill list
  changes, and because the path is a strictly linear chain, "are the chest's
  prerequisites met?" reduces to checking the single skill immediately before
  it rather than walking the whole prefix.

## API overview

All endpoints are prefixed `/api` and expect an `X-User-Id` header (defaults
to `1` server-side if omitted). Full interactive docs at `/docs`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/user/me` | Current learner + stats (applies lazy streak decay / heart regen) |
| POST | `/api/user/simulate-day` | Dev helper: rolls `last_active_date` back a day to demo streak-break logic |
| GET | `/api/user/weekly-activity` | Sun–Sat activity strip for the streak popover calendar |
| GET | `/api/path` | Units → skills tree with per-skill lock/available/completed status, crowns + checkpoint state |
| POST | `/api/checkpoint/{unit_id}/open` | Opens a unit's treasure chest: pays 500–1000 gems and unlocks the skill it gates (prerequisites re-verified server-side) |
| GET | `/api/lesson/{skill_id}` | Next lesson's exercises for a skill (answers withheld). 403 `skill_locked` if the skill isn't reached yet, 403 `no_hearts` on an empty heart balance |
| POST | `/api/lesson/check-answer` | Grades one exercise; deducts a heart on a wrong answer |
| POST | `/api/lesson/complete` | Finalizes a lesson: awards XP, updates streak/crowns, unlocks next skill, evaluates achievements. `practice: true` halves XP and skips all progression |
| GET | `/api/hearts` | Current hearts/gems + seconds until next heart regenerates |
| POST | `/api/hearts/refill` | Mocked gem-for-hearts refill (350 gems → full hearts) |
| POST | `/api/hearts/dev-fill` | Dev helper: free instant heart top-up + 1000 gems (see the Practice page's dev tools) |
| GET | `/api/leaderboard` | Weekly XP ranking across all seeded users |
| GET | `/api/profile` | Stats + achievement progress |

Error responses use FastAPI's `HTTPException` with an object `detail`
carrying a machine-readable `code`, so the client can branch on the *reason*
rather than parsing a message string — `lib/api.ts` surfaces it as
`ApiError.code`. Both lesson-entry refusals are 403 but need very different
UI (a locked skill is a no-op; no hearts opens the refill modal).

## Seeded content

- **3 units, 12 skills, 47 lessons, 280 exercises** — mirroring the real
  Spanish course's Section 1:
  - *Section 1, Unit 1 — Order at a café*: Order drinks, Order food, Be polite, At the table
  - *Section 1, Unit 2 — Greet people and say goodbye*: Say hello, Share your name, Say goodbye, Ask how it's going
  - *Section 1, Unit 3 — Say where you are from*: Your country, Languages, Where you live, About you
- All 5 required exercise types, evenly spread (multiple choice 58,
  type-the-answer 58, fill-in-the-blank 57, match pairs 57, translate/word-bank
  50) — real Spanish vocabulary and real Duolingo prompt phrasings, not lorem
  ipsum. Generation is seeded with a fixed RNG (`random.Random(20240613)` in
  `seed.py`), so the same course is produced on every machine and every deploy.
- Each skill holds 3–5 lessons of 4–8 exercises, matching how the real path
  shows partial progress as a fraction of the ring around a node.
- A default learner ("Abhijit") pre-seeded with a 3-day streak, XP, and
  completed skills, so the app is immediately demoable without playing from
  zero.
- 6 achievements and 6 rival users with backdated activity for a populated
  leaderboard on first load.

## Stats-bar popovers (course/streak/gems/hearts)

Each of the four pills in the top-right (`components/features/StatsBar.tsx`)
opens a hover panel via a shared `Popover` primitive (`components/features/Popover.tsx`)
— matching real Duolingo's desktop hover behavior — with a short close delay
so moving the cursor from the pill into the panel doesn't flicker shut. Each
panel lives in `components/features/popovers/`:

- **CoursePopover** — lists "My Courses" (Spanish, the one seeded course) and
  an "Add a new course" flow showing other language flags. Picking an
  unseeded language shows an inline "coming soon" note rather than faking a
  switch — consistent with the assignment's explicit allowance to mock
  additional languages.
- **StreakPopover** — day count plus a real Sun–Sat activity calendar backed
  by `GET /api/user/weekly-activity` (derived from the `daily_activity`
  table), and a Streak Society teaser card (mocked — social/friend features
  are out of scope per spec).
- **GemsPopover** — balance + a link to `/shop` (Coming Soon placeholder).
- **HeartsPopover** — heart pips, a live regen countdown (`GET /api/hearts`),
  a mocked "Unlimited Hearts" upsell, and a working "Refill Hearts" button
  wired to the real `/api/hearts/refill` endpoint.

## Known simplifications / assumptions

- Single hardcoded learner (`user_id=1`); no signup/login flow, per spec.
- Match-pairs mismatches reuse the same `/api/lesson/check-answer` heart-loss
  path as the other four exercise types (via a guaranteed-wrong sentinel
  answer sent on each mismatched tap), so hearts drain consistently across
  all exercise types even though match-pairs has no single "check" moment.
- Achievements are evaluated lazily (on `/api/lesson/complete` and on
  `/api/profile`) rather than via a background job, so the pre-seeded
  learner's badges resolve correctly the first time the profile page loads
  even though no lesson has been played yet in that session.
- Hearts gate lesson *entry*, not just mid-lesson play: `GET /api/lesson/{skill_id}`
  refuses to deal exercises on a zero balance, and the client turns that
  refusal into the same out-of-hearts modal, so backing out and re-tapping a
  node can't be used to keep playing for free.
- The treasure chest is a real checkpoint, not decoration: it sits at
  `ceil(skills/2)` in each unit, and the skill after it stays locked until
  the chest is opened — which is also the only thing that unlocks it, so the
  chest can't be skipped past.
- "Practice" on a finished node replays that skill's lessons at half XP with
  no crown/unlock progress (`practice: true` on `/api/lesson/complete`).
  "Legendary" is a Super feature and is a Coming Soon note.
- "Practice" page doubles as a small dev panel (simulate a day passing, free
  heart+gem top-up) to make streak/heart edge cases quick to demo without
  waiting on real timers.
- Leagues have a full tier ladder in the UI but no weekly promotion/demotion
  job — the learner is always in Bronze.
- `users.avatar_emoji` is still stored and returned by the API, but the UI no
  longer renders it: avatars are drawn from the display name's initial on a
  colour derived from the username (`art/Avatar.tsx`), because an emoji is a
  different picture on every OS. The column is kept as the natural place for
  a real avatar field to live.
- Audio, real speech recognition, dark mode, and Super/IAP are "Coming Soon"
  placeholders per the assignment's allowed-mocks list.
