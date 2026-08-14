/**
 * Thin fetch wrapper. Every call carries X-User-Id so the backend can
 * resolve "the current learner" without real auth (see backend/app/routes.py).
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CURRENT_USER_ID = 1;

/**
 * Thrown for any non-2xx response. Carries the HTTP status and, where the
 * backend supplied one, a machine-readable `code` — FastAPI's HTTPException
 * detail can be an object, and routes.py uses that for the cases callers
 * genuinely need to branch on (a locked skill and an out-of-hearts learner
 * are both 403, but the UI has to respond to them very differently).
 * Matching on `code` keeps that branch off the human-facing message string.
 */
export class ApiError extends Error {
  constructor(public status: number, public detail: unknown, message: string) {
    super(message);
    this.name = "ApiError";
  }

  get code(): string | null {
    if (this.detail && typeof this.detail === "object" && "code" in this.detail) {
      return String((this.detail as { code: unknown }).code);
    }
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": String(CURRENT_USER_ID),
      ...options.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    let detail: unknown = body;
    try {
      detail = (JSON.parse(body) as { detail?: unknown }).detail ?? body;
    } catch {
      // non-JSON error body (proxy/gateway HTML, say) — keep the raw text
    }
    throw new ApiError(res.status, detail, `API ${res.status}: ${body}`);
  }
  return res.json();
}

// ---- Types (mirrors backend/app/schemas.py) ----

export interface User {
  id: number; username: string; display_name: string; avatar_emoji: string;
  streak: number; longest_streak: number; total_xp: number;
  hearts: number; max_hearts: number; gems: number; daily_xp_goal: number;
  xp_today: number;
  last_active_date: string | null;
}

export interface SkillNode {
  id: number; title: string; icon_name: string; order_index: number;
  status: "locked" | "available" | "completed";
  crowns: number; total_lessons: number; lessons_completed: number; xp_reward: number;
}

export interface Checkpoint { opened: boolean; available: boolean; }

export interface Unit {
  id: number; title: string; description: string; order_index: number;
  color_theme: string; skills: SkillNode[]; checkpoint: Checkpoint | null;
}

export interface PathResponse { units: Unit[]; }

export interface CheckpointOpenResult {
  gems_earned: number; total_gems: number; next_skill_unlocked: string | null;
}

export interface Exercise {
  id: number; type: string; prompt: string; payload: Record<string, any>; order_index: number;
}

export interface LessonResponse {
  lesson_id: number; skill_id: number; skill_title: string; xp_reward: number; exercises: Exercise[];
}

export interface AnswerCheckResult { correct: boolean; correct_answer: string; hearts_remaining: number; }

export interface LessonCompleteResult {
  xp_earned: number; total_xp: number; streak: number; crowns: number;
  skill_status: string; next_skill_unlocked: string | null; daily_goal_met: boolean;
}

export interface HeartsResponse { hearts: number; max_hearts: number; gems: number; next_heart_in_seconds: number | null; }

export interface LeaderboardEntry {
  rank: number; username: string; display_name: string; avatar_emoji: string;
  weekly_xp: number; is_current_user: boolean;
}

export interface Achievement {
  code: string; title: string; description: string; icon_name: string; earned: boolean; earned_at: string | null;
}

export interface Profile { user: User; skills_completed: number; lessons_completed: number; achievements: Achievement[]; }

export interface DayActivity { day_label: string; date: string; active: boolean; is_today: boolean; }

// ---- API surface ----

export const api = {
  getUser: () => request<User>("/api/user/me"),
  simulateDay: () => request<User>("/api/user/simulate-day", { method: "POST" }),
  getWeeklyActivity: () => request<DayActivity[]>("/api/user/weekly-activity"),
  getPath: () => request<PathResponse>("/api/path"),
  openCheckpoint: (unitId: number) =>
    request<CheckpointOpenResult>(`/api/checkpoint/${unitId}/open`, { method: "POST" }),
  getLesson: (skillId: number) => request<LessonResponse>(`/api/lesson/${skillId}`),
  checkAnswer: (exerciseId: number, answer: string) =>
    request<AnswerCheckResult>("/api/lesson/check-answer", {
      method: "POST", body: JSON.stringify({ exercise_id: exerciseId, answer }),
    }),
  completeLesson: (lessonId: number, correctCount: number, totalExercises: number, heartsRemaining: number, practice = false) =>
    request<LessonCompleteResult>("/api/lesson/complete", {
      method: "POST",
      body: JSON.stringify({
        lesson_id: lessonId, correct_count: correctCount,
        total_exercises: totalExercises, hearts_remaining: heartsRemaining, practice,
      }),
    }),
  getHearts: () => request<HeartsResponse>("/api/hearts"),
  refillHearts: () => request<HeartsResponse>("/api/hearts/refill", { method: "POST" }),
  devFillHearts: () => request<HeartsResponse>("/api/hearts/dev-fill", { method: "POST" }),
  getLeaderboard: () => request<LeaderboardEntry[]>("/api/leaderboard"),
  getProfile: () => request<Profile>("/api/profile"),
};
