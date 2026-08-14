"""Pydantic (v2) schemas — the API's public contract, kept separate from the
ORM models so DB shape can evolve without breaking the response shape."""
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


# ---------- User ----------

class DayActivityOut(BaseModel):
    day_label: str    # "S", "M", "T"...
    date: date
    active: bool
    is_today: bool


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    display_name: str
    avatar_emoji: str
    streak: int
    longest_streak: int
    total_xp: int
    hearts: int
    max_hearts: int
    gems: int
    daily_xp_goal: int
    xp_today: int = 0  # not a User column — set explicitly in routes.read_current_user
    last_active_date: Optional[date] = None


# ---------- Path / skill tree ----------

class SkillNodeOut(BaseModel):
    id: int
    title: str
    icon_name: str
    order_index: int
    status: str          # locked | available | completed
    crowns: int
    total_lessons: int
    lessons_completed: int
    xp_reward: int       # XP for one lesson of this skill — drives the node popup's "+N XP"


class UnitOut(BaseModel):
    id: int
    title: str
    description: str
    order_index: int
    color_theme: str
    skills: list[SkillNodeOut]


class PathOut(BaseModel):
    units: list[UnitOut]


# ---------- Lesson player ----------

class ExerciseOut(BaseModel):
    id: int
    type: str
    prompt: str
    payload: dict[str, Any]
    order_index: int
    # NOTE: correct_answer is intentionally omitted — never ship answers to the client.


class LessonOut(BaseModel):
    lesson_id: int
    skill_id: int
    skill_title: str
    xp_reward: int
    exercises: list[ExerciseOut]


class AnswerCheckIn(BaseModel):
    exercise_id: int
    answer: str


class AnswerCheckOut(BaseModel):
    correct: bool
    correct_answer: str
    hearts_remaining: int


class LessonCompleteIn(BaseModel):
    lesson_id: int
    correct_count: int
    total_exercises: int
    hearts_remaining: int
    practice: bool = False  # replay of a finished node: half XP, no crown/unlock progress


class LessonCompleteOut(BaseModel):
    xp_earned: int
    total_xp: int
    streak: int
    crowns: int
    skill_status: str
    next_skill_unlocked: Optional[str] = None
    daily_goal_met: bool


# ---------- Hearts ----------

class HeartsOut(BaseModel):
    hearts: int
    max_hearts: int
    gems: int
    next_heart_in_seconds: Optional[int] = None


# ---------- Leaderboard / profile ----------

class LeaderboardEntryOut(BaseModel):
    rank: int
    username: str
    display_name: str
    avatar_emoji: str
    weekly_xp: int
    is_current_user: bool


class AchievementOut(BaseModel):
    code: str
    title: str
    description: str
    icon_name: str
    earned: bool
    earned_at: Optional[datetime] = None


class ProfileOut(BaseModel):
    user: UserOut
    skills_completed: int
    lessons_completed: int
    achievements: list[AchievementOut]
