"""
All DB reads/writes + the gamification rules live here, kept out of routes.py
so the HTTP layer stays a thin translation layer (separation of concerns).
"""
import random
from datetime import date, datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models

HEART_REGEN_MINUTES = 30  # one heart regenerates every 30 min, like real Duolingo


# ---------- User ----------

def get_user(db: Session, user_id: int) -> models.User:
    user = db.get(models.User, user_id)
    _apply_streak_decay(db, user)
    _apply_heart_regen(db, user)
    return user


def _apply_streak_decay(db: Session, user: models.User) -> None:
    """Lazily break the streak if more than one calendar day was skipped.
    Checked on read (rather than a cron job) so it's correct regardless of
    when the server was last running."""
    if not user.last_active_date:
        return
    gap = (date.today() - user.last_active_date).days
    if gap > 1 and user.streak != 0:
        user.streak = 0
        db.commit()


def _apply_heart_regen(db: Session, user: models.User) -> None:
    if user.hearts >= user.max_hearts or user.last_heart_lost_at is None:
        return
    elapsed = datetime.utcnow() - user.last_heart_lost_at
    regenerated = int(elapsed.total_seconds() // (HEART_REGEN_MINUTES * 60))
    if regenerated > 0:
        user.hearts = min(user.max_hearts, user.hearts + regenerated)
        user.last_heart_lost_at = datetime.utcnow() if user.hearts < user.max_hearts else None
        db.commit()


def get_xp_today(db: Session, user_id: int) -> int:
    """XP earned so far today, for the daily-goal progress ring."""
    activity = db.query(models.DailyActivity).filter_by(user_id=user_id, activity_date=date.today()).first()
    return activity.xp_earned if activity else 0


def seconds_until_next_heart(user: models.User) -> int | None:
    if user.hearts >= user.max_hearts or user.last_heart_lost_at is None:
        return None
    elapsed = (datetime.utcnow() - user.last_heart_lost_at).total_seconds()
    remaining = HEART_REGEN_MINUTES * 60 - (elapsed % (HEART_REGEN_MINUTES * 60))
    return int(remaining)


def lose_heart(db: Session, user: models.User) -> models.User:
    if user.hearts > 0:
        user.hearts -= 1
        if user.last_heart_lost_at is None:
            user.last_heart_lost_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
    return user


def refill_hearts(db: Session, user: models.User, cost_gems: int = 350) -> tuple[models.User, bool]:
    """Mocked gem-for-hearts refill. Returns (user, success)."""
    if user.gems < cost_gems or user.hearts >= user.max_hearts:
        return user, False
    user.gems -= cost_gems
    user.hearts = user.max_hearts
    user.last_heart_lost_at = None
    db.commit()
    db.refresh(user)
    return user, True


def dev_fill_hearts(db: Session, user: models.User, bonus_gems: int = 1000) -> models.User:
    """Dev-only helper: instantly tops up hearts for free and tops up gems
    too, so testing gem-spending features (real refill, shop) doesn't run
    the mocked balance dry — distinct from refill_hearts, the real
    gem-purchase mechanic that actually costs gems."""
    user.hearts = user.max_hearts
    user.last_heart_lost_at = None
    user.gems += bonus_gems
    db.commit()
    db.refresh(user)
    return user


def simulate_day_passing(db: Session, user: models.User) -> models.User:
    """Dev-only helper: rolls the user's last_active_date back a day so
    streak-break / streak-continue logic can be demoed without waiting. Also
    tops up hearts, since a full day is far longer than the 30-min regen
    period — a real day passing would always leave hearts full regardless of
    how many were lost the day before."""
    if user.last_active_date:
        user.last_active_date -= timedelta(days=1)
    else:
        user.last_active_date = date.today() - timedelta(days=1)
    user.hearts = user.max_hearts
    user.last_heart_lost_at = None
    db.commit()
    db.refresh(user)
    return user


# ---------- Path ----------

def build_path(db: Session, user_id: int) -> list[models.Unit]:
    units = db.query(models.Unit).order_by(models.Unit.order_index).all()
    progress_rows = {
        p.skill_id: p
        for p in db.query(models.UserSkillProgress).filter_by(user_id=user_id).all()
    }
    return units, progress_rows


def get_or_create_progress(db: Session, user_id: int, skill_id: int) -> models.UserSkillProgress:
    row = db.get(models.UserSkillProgress, (user_id, skill_id))
    if row is None:
        row = models.UserSkillProgress(user_id=user_id, skill_id=skill_id, status="locked")
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


# ---------- Lesson ----------

def get_next_lesson_for_skill(db: Session, skill_id: int, lessons_completed: int = 0) -> models.Lesson | None:
    """Returns the lesson at position `lessons_completed` within the skill's
    lesson list, wrapping around once a full lap (= one crown) is done, so
    replaying a maxed-out skill still serves varied content."""
    lessons = (
        db.query(models.Lesson)
        .filter(models.Lesson.skill_id == skill_id)
        .order_by(models.Lesson.order_index)
        .all()
    )
    if not lessons:
        return None
    return lessons[lessons_completed % len(lessons)]


def check_answer(exercise: models.Exercise, submitted: str) -> bool:
    return submitted.strip().lower() == exercise.correct_answer.strip().lower()


def complete_lesson(
    db: Session,
    user: models.User,
    lesson: models.Lesson,
    correct_count: int,
    total_exercises: int,
    hearts_remaining: int,
    practice: bool = False,
) -> dict:
    """Finalizes a lesson attempt.

    `practice` is a replay of an already-finished node (real Duolingo's
    "PRACTICE +5 XP" button): it still earns XP, logs a completion and feeds
    the streak, but at half rate and *without* touching crown/unlock
    progression — you can't grind a finished node to advance the path.
    """
    accuracy = int(round(100 * correct_count / max(total_exercises, 1)))
    if practice:
        xp_earned = max(1, lesson.xp_reward // 2)
    else:
        xp_earned = lesson.xp_reward + (5 if accuracy == 100 else 0)  # small perfect-lesson bonus

    # 1) log the completion (history)
    db.add(models.UserLessonCompletion(
        user_id=user.id, lesson_id=lesson.id, xp_earned=xp_earned, accuracy=accuracy,
    ))

    # 2) bump user totals
    user.total_xp += xp_earned
    user.hearts = hearts_remaining

    # 3) streak + daily activity log (upsert today's row)
    today = date.today()
    activity = db.query(models.DailyActivity).filter_by(user_id=user.id, activity_date=today).first()
    if activity is None:
        activity = models.DailyActivity(user_id=user.id, activity_date=today, xp_earned=0)
        db.add(activity)
    activity.xp_earned += xp_earned

    if user.last_active_date != today:
        if user.last_active_date == today - timedelta(days=1):
            user.streak += 1
        else:
            user.streak = 1
        user.longest_streak = max(user.longest_streak, user.streak)
        user.last_active_date = today

    # 4) skill progress + crowns (skipped entirely for practice replays)
    progress = get_or_create_progress(db, user.id, lesson.skill_id)
    if not practice:
        progress.lessons_completed += 1
        total_lessons_in_skill = db.query(models.Lesson).filter_by(skill_id=lesson.skill_id).count()
        # Only the lesson that actually finishes the skill's full lesson list
        # earns a crown / flips status to "completed" — earlier lessons in a
        # multi-lesson skill must leave status as "available" so the path still
        # shows an accurate mix of done/current/upcoming nodes for it.
        if progress.lessons_completed >= total_lessons_in_skill:
            progress.status = "completed"
            if progress.crowns < 5:
                progress.crowns += 1
                progress.lessons_completed = 0  # reset the ring for the next crown level

    # 5) unlock the next skill in order — only once *this* skill is fully
    # done (all its lessons), never on an earlier lesson within it. Doing
    # this unconditionally on every completion was the bug behind two
    # skills showing as "current" (with two overlapping Start bubbles) at
    # once: the very first lesson of a multi-lesson skill was unlocking the
    # next skill immediately, before the current one was actually finished.
    next_unlocked_title = None
    if not practice and progress.status == "completed":
        skill = db.get(models.Skill, lesson.skill_id)
        next_skill = (
            db.query(models.Skill)
            .filter(models.Skill.unit_id == skill.unit_id, models.Skill.order_index == skill.order_index + 1)
            .first()
        )
        if next_skill is None:
            next_unit = db.query(models.Unit).filter(models.Unit.order_index == db.get(models.Unit, skill.unit_id).order_index + 1).first()
            if next_unit:
                next_skill = db.query(models.Skill).filter_by(unit_id=next_unit.id).order_by(models.Skill.order_index).first()
        if next_skill:
            next_progress = get_or_create_progress(db, user.id, next_skill.id)
            if next_progress.status == "locked":
                next_progress.status = "available"
                next_unlocked_title = next_skill.title

    db.commit()
    db.refresh(user)
    db.refresh(progress)

    return {
        "xp_earned": xp_earned,
        "total_xp": user.total_xp,
        "streak": user.streak,
        "crowns": progress.crowns,
        "skill_status": progress.status,
        "next_skill_unlocked": next_unlocked_title,
        "daily_goal_met": activity.xp_earned >= user.daily_xp_goal,
    }


# ---------- Leaderboard ----------

def get_leaderboard(db: Session, current_user_id: int, limit: int = 20) -> list[dict]:
    week_start = date.today() - timedelta(days=date.today().weekday())
    weekly = (
        db.query(
            models.DailyActivity.user_id,
            func.sum(models.DailyActivity.xp_earned).label("weekly_xp"),
        )
        .filter(models.DailyActivity.activity_date >= week_start)
        .group_by(models.DailyActivity.user_id)
        .subquery()
    )
    rows = (
        db.query(models.User, func.coalesce(weekly.c.weekly_xp, 0))
        .outerjoin(weekly, weekly.c.user_id == models.User.id)
        .order_by(func.coalesce(weekly.c.weekly_xp, 0).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "rank": i + 1,
            "username": u.username,
            "display_name": u.display_name,
            "avatar_emoji": u.avatar_emoji,
            "weekly_xp": int(xp),
            "is_current_user": u.id == current_user_id,
        }
        for i, (u, xp) in enumerate(rows)
    ]


# ---------- Streak calendar ----------

def get_weekly_activity(db: Session, user_id: int) -> list[dict]:
    """Sun-Sat calendar strip for the streak popover, matching Duolingo's UI."""
    today = date.today()
    week_start = today - timedelta(days=(today.weekday() + 1) % 7)  # back up to Sunday
    active_dates = {
        row.activity_date
        for row in db.query(models.DailyActivity.activity_date)
        .filter(models.DailyActivity.user_id == user_id, models.DailyActivity.activity_date >= week_start)
        .all()
    }
    labels = ["S", "M", "T", "W", "T", "F", "S"]
    return [
        {
            "day_label": labels[i],
            "date": week_start + timedelta(days=i),
            "active": (week_start + timedelta(days=i)) in active_dates,
            "is_today": (week_start + timedelta(days=i)) == today,
        }
        for i in range(7)
    ]


# ---------- Achievements ----------

def evaluate_achievements(db: Session, user: models.User) -> list[models.Achievement]:
    """Checks unmet achievements against current stats and awards any newly earned ones."""
    earned_ids = {ua.achievement_id for ua in db.query(models.UserAchievement).filter_by(user_id=user.id)}
    skills_completed = (
        db.query(models.UserSkillProgress)
        .filter_by(user_id=user.id, status="completed")
        .count()
    )
    lessons_completed = db.query(models.UserLessonCompletion).filter_by(user_id=user.id).count()

    stats = {
        "streak": user.streak,
        "total_xp": user.total_xp,
        "skills_completed": skills_completed,
        "lessons_completed": lessons_completed,
    }
    newly_earned = []
    for ach in db.query(models.Achievement).all():
        if ach.id in earned_ids:
            continue
        if stats.get(ach.requirement_type, 0) >= ach.requirement_value:
            db.add(models.UserAchievement(user_id=user.id, achievement_id=ach.id))
            newly_earned.append(ach)
    if newly_earned:
        db.commit()
    return newly_earned
