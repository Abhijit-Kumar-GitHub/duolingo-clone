# Duolingo Clone

A functional clone of Duolingo's learning path, lesson loop, and gamification
mechanics (XP, streaks, hearts, crowns, leaderboard, achievements).

**Live demo:** <https://duolingo-clone-navy-three.vercel.app>
**Repo:** <https://github.com/Abhijit-Kumar-GitHub/duolingo-clone>

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript), Tailwind CSS, Zustand, Framer Motion, react-confetti |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic v2 |
| Database | SQLite |
| Deployment | Frontend → Vercel · Backend → Railway/Render |

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
│       │   │   ├── practice/       # placeholder + dev tools (simulate day, refill hearts)
│       │   │   ├── quests/         # placeholder
│       │   │   ├── shop/           # placeholder (mocked gem store)
│       │   │   └── settings/       # placeholder
│       │   ├── lesson/[skillId]/   # full-screen lesson player (no sidebar)
│       │   └── layout.tsx          # root layout, font
│       ├── components/features/
│       │   ├── Sidebar.tsx, StatsBar.tsx, Popover.tsx
│       │   ├── popovers/           # CoursePopover, StreakPopover, GemsPopover, HeartsPopover
│       │   ├── PathMap.tsx, SkillNode.tsx
│       │   ├── LessonPlayer.tsx, FeedbackBar.tsx, ComingSoon.tsx
│       │   ├── exercises/          # MultipleChoice, TranslateWordBank, MatchPairs, FillBlank, TypeAnswer
│       │   └── modals/             # OutOfHeartsModal, LessonCompleteModal
│       ├── store/                  # useUserStore, useLessonStore (Zustand)
│       └── lib/api.ts              # typed fetch client
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

**Branding note:** the sidebar wordmark is a placeholder ("lingo") in the
same bold rounded-green treatment as the original, rather than a reproduction
of Duolingo's actual logo asset — real Duolingo's skill icons are bespoke
illustrated art, which is proprietary and not something this clone
reproduces; skill nodes instead use plain colored circles with Lucide line
icons per topic (`components/features/SkillNode.tsx`). The goal throughout
was to faithfully recreate the *interaction design and UX patterns* (colors,
layout, motion, the lesson loop, the stats-bar hover popovers), not to copy
trademarked brand or illustration assets.

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

## API overview

All endpoints are prefixed `/api` and expect an `X-User-Id` header (defaults
to `1` server-side if omitted). Full interactive docs at `/docs`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/user/me` | Current learner + stats (applies lazy streak decay / heart regen) |
| POST | `/api/user/simulate-day` | Dev helper: rolls `last_active_date` back a day to demo streak-break logic |
| GET | `/api/user/weekly-activity` | Sun–Sat activity strip for the streak popover calendar |
| GET | `/api/path` | Units → skills tree with per-skill lock/available/completed status + crowns |
| GET | `/api/lesson/{skill_id}` | Next lesson's exercises for a skill (answers withheld) |
| POST | `/api/lesson/check-answer` | Grades one exercise; deducts a heart on a wrong answer |
| POST | `/api/lesson/complete` | Finalizes a lesson: awards XP, updates streak/crowns, unlocks next skill, evaluates achievements |
| GET | `/api/hearts` | Current hearts/gems + seconds until next heart regenerates |
| POST | `/api/hearts/refill` | Mocked gem-for-hearts refill (350 gems → full hearts) |
| GET | `/api/leaderboard` | Weekly XP ranking across all seeded users |
| GET | `/api/profile` | Stats + achievement progress |

## Seeded content

- 2 units, 6 skills ("Greetings", "Food", "Animals", "Family", "Colors",
  "Travel"), 12 lessons, 48 exercises spanning all 5 required exercise types
  (multiple choice, translate/word-bank, match pairs, fill-in-the-blank,
  type-the-answer) — real (small) Spanish vocabulary, not lorem ipsum.
- A default learner ("Abhijit") pre-seeded with a 3-day streak, 150 XP, and
  2 completed skills, so the app is immediately demoable without playing
  from zero.
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
- "Practice" page doubles as a small dev panel (simulate a day passing,
  manual heart refill) to make streak/heart edge cases quick to demo without
  waiting on real timers.
- Audio, real speech recognition, and Super/IAP are "Coming Soon" placeholders
  per the assignment's allowed-mocks list.
