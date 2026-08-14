"""
Database schema.

Design notes (worth remembering for the eval interview):

- `exercises.payload` is a JSON column so one table can represent five
  structurally different exercise shapes (multiple choice, translate,
  match pairs, fill blank, type answer) without a sparse table full of
  nullable columns per-type. `type` + `payload` is a common "polymorphic
  content" pattern for CMS-like data.
- `user_skill_progress` is the join table between users and skills that
  tracks per-user mastery (status + crown level) — a many-to-many with
  extra attributes, not just a plain association table.
- `daily_activity` is an append-only log (one row per user per calendar
  day) that both drives the streak calculation and doubles as the data
  source for a GitHub-style activity calendar / daily XP goal ring.
- `user_lesson_completions` is a full history log (not just a boolean),
  so profile stats, weekly leaderboard XP, and "lessons completed today"
  can all be derived from one table instead of separate counters that
  can drift out of sync.
"""
from datetime import date, datetime

from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey, Integer, JSON, String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    avatar_emoji = Column(String, default="🦉")

    streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_xp = Column(Integer, default=0)
    hearts = Column(Integer, default=5)
    max_hearts = Column(Integer, default=5)
    gems = Column(Integer, default=500)
    daily_xp_goal = Column(Integer, default=50)

    last_active_date = Column(Date, nullable=True)
    last_heart_lost_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    progress = relationship("UserSkillProgress", back_populates="user", cascade="all, delete-orphan")
    completions = relationship("UserLessonCompletion", back_populates="user", cascade="all, delete-orphan")
    activity = relationship("DailyActivity", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    order_index = Column(Integer, nullable=False)
    color_theme = Column(String, default="duo-green")  # tailwind token name

    skills = relationship("Skill", back_populates="unit", order_by="Skill.order_index")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    title = Column(String, nullable=False)
    icon_name = Column(String, default="book")
    order_index = Column(Integer, nullable=False)
    description = Column(String, default="")

    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill", order_by="Lesson.order_index")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    title = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False)
    xp_reward = Column(Integer, default=10)

    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", order_by="Exercise.order_index")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    type = Column(String, nullable=False)  # MULTIPLE_CHOICE | TRANSLATE | MATCH_PAIRS | FILL_BLANK | TYPE_ANSWER
    prompt = Column(String, nullable=False)
    payload = Column(JSON, nullable=False, default=dict)  # shape depends on `type`, see seed.py for examples
    correct_answer = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False)

    lesson = relationship("Lesson", back_populates="exercises")


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    status = Column(String, default="locked")  # locked | available | completed
    crowns = Column(Integer, default=0)         # 0-5, like real Duolingo's level rings
    lessons_completed = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="progress")
    skill = relationship("Skill")


class UserUnitCheckpoint(Base):
    """One row per user per unit that has a checkpoint (the treasure-chest
    node roughly halfway through a unit — see crud.checkpoint_gate_index).
    Tracks whether it's been opened yet — opening it is what unlocks the
    skill right after it and pays out a gem reward, rather than that skill
    unlocking automatically like its neighbors do."""
    __tablename__ = "user_unit_checkpoints"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    unit_id = Column(Integer, ForeignKey("units.id"), primary_key=True)
    opened = Column(Boolean, default=False)
    opened_at = Column(DateTime, nullable=True)


class UserLessonCompletion(Base):
    """Append-only history log. One row per finished lesson attempt."""
    __tablename__ = "user_lesson_completions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    xp_earned = Column(Integer, nullable=False)
    accuracy = Column(Integer, default=100)  # percent, for stats/profile
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="completions")
    lesson = relationship("Lesson")


class DailyActivity(Base):
    """One row per user per calendar day. Backbone of streak + daily goal logic."""
    __tablename__ = "daily_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_date = Column(Date, nullable=False, default=date.today)
    xp_earned = Column(Integer, default=0)

    __table_args__ = (UniqueConstraint("user_id", "activity_date", name="uq_user_day"),)

    user = relationship("User", back_populates="activity")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon_name = Column(String, default="trophy")
    requirement_type = Column(String, nullable=False)   # streak | total_xp | skills_completed | lessons_completed
    requirement_value = Column(Integer, nullable=False)


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), primary_key=True)
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")
