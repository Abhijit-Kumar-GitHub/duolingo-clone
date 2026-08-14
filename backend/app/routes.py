"""
API endpoints. Auth is intentionally simplified per the assignment spec
("assume a default logged-in learner"): every request carries an
`X-User-Id` header (default 1) instead of real auth. The schema still
models multiple users properly (it has to, for the leaderboard), it's
only the *auth* that's mocked, not the data model.
"""
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/api")


def current_user(
    x_user_id: int = Header(default=1, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> models.User:
    user = crud.get_user(db, x_user_id)
    if user is None:
        raise HTTPException(404, "User not found")
    return user


# ---------- User ----------

@router.get("/user/me", response_model=schemas.UserOut)
def read_current_user(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    user_out = schemas.UserOut.model_validate(user)
    user_out.xp_today = crud.get_xp_today(db, user.id)
    return user_out


@router.post("/user/simulate-day", response_model=schemas.UserOut)
def simulate_day(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    """Dev/demo helper — rolls back `last_active_date` a day so you can
    immediately test streak-continue vs streak-break without waiting."""
    return crud.simulate_day_passing(db, user)


@router.get("/user/weekly-activity", response_model=list[schemas.DayActivityOut])
def read_weekly_activity(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    return crud.get_weekly_activity(db, user.id)


# ---------- Path ----------

@router.get("/path", response_model=schemas.PathOut)
def read_path(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    units, progress_rows = crud.build_path(db, user.id)
    out_units = []
    for u in units:
        skill_nodes = []
        for s in u.skills:
            p = progress_rows.get(s.id)
            total_lessons = len(s.lessons)
            skill_nodes.append(schemas.SkillNodeOut(
                id=s.id, title=s.title, icon_name=s.icon_name, order_index=s.order_index,
                status=p.status if p else "locked",
                crowns=p.crowns if p else 0,
                total_lessons=total_lessons,
                lessons_completed=p.lessons_completed if p else 0,
                xp_reward=s.lessons[0].xp_reward if s.lessons else 10,
            ))
        out_units.append(schemas.UnitOut(
            id=u.id, title=u.title, description=u.description, order_index=u.order_index,
            color_theme=u.color_theme, skills=skill_nodes,
        ))
    return schemas.PathOut(units=out_units)


# ---------- Lesson ----------

@router.get("/lesson/{skill_id}", response_model=schemas.LessonOut)
def read_lesson(skill_id: int, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    progress = crud.get_or_create_progress(db, user.id, skill_id)
    if progress.status == "locked":
        raise HTTPException(403, "Skill is locked")
    lesson = crud.get_next_lesson_for_skill(db, skill_id, progress.lessons_completed)
    if lesson is None:
        raise HTTPException(404, "No lessons found for this skill")
    return schemas.LessonOut(
        lesson_id=lesson.id, skill_id=skill_id, skill_title=lesson.skill.title,
        xp_reward=lesson.xp_reward,
        exercises=[schemas.ExerciseOut(**e.__dict__) for e in lesson.exercises],
    )


@router.post("/lesson/check-answer", response_model=schemas.AnswerCheckOut)
def check_answer(payload: schemas.AnswerCheckIn, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    exercise = db.get(models.Exercise, payload.exercise_id)
    if exercise is None:
        raise HTTPException(404, "Exercise not found")
    correct = crud.check_answer(exercise, payload.answer)
    if not correct:
        crud.lose_heart(db, user)
    return schemas.AnswerCheckOut(correct=correct, correct_answer=exercise.correct_answer, hearts_remaining=user.hearts)


@router.post("/lesson/complete", response_model=schemas.LessonCompleteOut)
def finish_lesson(payload: schemas.LessonCompleteIn, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    lesson = db.get(models.Lesson, payload.lesson_id)
    if lesson is None:
        raise HTTPException(404, "Lesson not found")
    result = crud.complete_lesson(
        db, user, lesson, payload.correct_count, payload.total_exercises, payload.hearts_remaining,
        practice=payload.practice,
    )
    crud.evaluate_achievements(db, user)
    return schemas.LessonCompleteOut(**result)


# ---------- Hearts ----------

@router.get("/hearts", response_model=schemas.HeartsOut)
def read_hearts(user: models.User = Depends(current_user)):
    return schemas.HeartsOut(
        hearts=user.hearts, max_hearts=user.max_hearts, gems=user.gems,
        next_heart_in_seconds=crud.seconds_until_next_heart(user),
    )


@router.post("/hearts/refill", response_model=schemas.HeartsOut)
def refill_hearts(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    user, success = crud.refill_hearts(db, user)
    if not success:
        raise HTTPException(400, "Not enough gems or hearts already full")
    return schemas.HeartsOut(hearts=user.hearts, max_hearts=user.max_hearts, gems=user.gems, next_heart_in_seconds=None)


@router.post("/hearts/dev-fill", response_model=schemas.HeartsOut)
def dev_fill_hearts(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    """Dev-only: free instant heart top-up, no gem cost — see Practice page's dev tools."""
    user = crud.dev_fill_hearts(db, user)
    return schemas.HeartsOut(hearts=user.hearts, max_hearts=user.max_hearts, gems=user.gems, next_heart_in_seconds=None)


# ---------- Leaderboard ----------

@router.get("/leaderboard", response_model=list[schemas.LeaderboardEntryOut])
def read_leaderboard(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    return crud.get_leaderboard(db, user.id)


# ---------- Profile ----------

@router.get("/profile", response_model=schemas.ProfileOut)
def read_profile(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    crud.evaluate_achievements(db, user)  # lazy-evaluate so pre-seeded stats also unlock badges
    skills_completed = db.query(models.UserSkillProgress).filter_by(user_id=user.id, status="completed").count()
    lessons_completed = db.query(models.UserLessonCompletion).filter_by(user_id=user.id).count()
    earned = {ua.achievement_id: ua.earned_at for ua in db.query(models.UserAchievement).filter_by(user_id=user.id)}
    achievements = [
        schemas.AchievementOut(
            code=a.code, title=a.title, description=a.description, icon_name=a.icon_name,
            earned=a.id in earned, earned_at=earned.get(a.id),
        )
        for a in db.query(models.Achievement).all()
    ]
    return schemas.ProfileOut(
        user=user, skills_completed=skills_completed, lessons_completed=lessons_completed, achievements=achievements,
    )
