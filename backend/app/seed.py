"""
Seeds a small Spanish course + a ready-to-demo learner + leaderboard rivals.

Run standalone with `python -m app.seed`, or imported and called from
main.py on startup if the DB is empty.
"""
from datetime import date, timedelta

from app.database import Base, SessionLocal, engine
from app import models


# ---- Course content -------------------------------------------------------
# Each skill: (title, icon, [lessons]) — each lesson is a list of exercise dicts.

def mc(prompt, options, answer):
    return {"type": "MULTIPLE_CHOICE", "prompt": prompt, "payload": {"options": options}, "correct_answer": answer}

def translate(prompt, word_bank, answer):
    return {"type": "TRANSLATE", "prompt": prompt, "payload": {"word_bank": word_bank}, "correct_answer": answer}

def match(prompt, pairs):
    # correct_answer stores the canonical "left:right,left:right" mapping used for grading on the client.
    answer = ",".join(f"{l}:{r}" for l, r in pairs.items())
    return {"type": "MATCH_PAIRS", "prompt": prompt, "payload": {"pairs": pairs}, "correct_answer": answer}

def fill_blank(prompt, sentence, options, answer):
    return {"type": "FILL_BLANK", "prompt": prompt, "payload": {"sentence": sentence, "options": options}, "correct_answer": answer}

def type_answer(prompt, answer, hint=""):
    return {"type": "TYPE_ANSWER", "prompt": prompt, "payload": {"hint": hint}, "correct_answer": answer}


UNITS = [
    {
        "title": "Unit 1: Basics", "description": "Greetings, food, and animals", "color_theme": "duo-green",
        "skills": [
            {
                "title": "Greetings", "icon": "hand-wave",
                "lessons": [
                    [
                        mc("What does 'Hola' mean?", ["Hello", "Goodbye", "Please", "Thanks"], "Hello"),
                        translate("Translate: 'Good morning'", ["Buenos", "días", "Buenas", "noches", "Hola"], "Buenos días"),
                        type_answer("Type the Spanish word for 'Goodbye'", "Adiós"),
                        fill_blank("Complete the greeting", "___, ¿cómo estás?", ["Hola", "Adiós", "Gracias", "Agua"], "Hola"),
                    ],
                    [
                        match("Match the words to their meanings", {"Gracias": "Thank you", "Por favor": "Please", "Lo siento": "Sorry"}),
                        mc("'Buenas noches' means?", ["Good night", "Good morning", "See you later", "Excuse me"], "Good night"),
                        translate("Translate: 'Nice to meet you'", ["Mucho", "gusto", "Buenas", "tardes", "Hasta"], "Mucho gusto"),
                        type_answer("Type the Spanish word for 'Please'", "Por favor"),
                    ],
                ],
            },
            {
                "title": "Food", "icon": "utensils",
                "lessons": [
                    [
                        mc("'La manzana' means?", ["Apple", "Bread", "Water", "Milk"], "Apple"),
                        translate("Translate: 'the water'", ["el", "agua", "la", "leche", "pan"], "el agua"),
                        type_answer("Type the Spanish word for 'bread'", "pan"),
                        fill_blank("Complete the sentence", "Quiero ___ de agua.", ["un vaso", "un pan", "una silla", "un libro"], "un vaso"),
                    ],
                    [
                        match("Match the food words", {"El café": "Coffee", "La leche": "Milk", "El pan": "Bread"}),
                        mc("'La fruta' means?", ["Fruit", "Vegetable", "Meat", "Cheese"], "Fruit"),
                        translate("Translate: 'I like coffee'", ["Me", "gusta", "el", "café", "la"], "Me gusta el café"),
                        type_answer("Type the Spanish word for 'apple'", "manzana"),
                    ],
                ],
            },
            {
                "title": "Animals", "icon": "paw",
                "lessons": [
                    [
                        mc("'El perro' means?", ["Dog", "Cat", "Bird", "Fish"], "Dog"),
                        translate("Translate: 'the cat'", ["el", "gato", "la", "gata", "pez"], "el gato"),
                        type_answer("Type the Spanish word for 'bird'", "pájaro"),
                        fill_blank("Complete the sentence", "El ___ nada en el agua.", ["pez", "perro", "pájaro", "caballo"], "pez"),
                    ],
                    [
                        match("Match the animals", {"El caballo": "Horse", "El pájaro": "Bird", "El pez": "Fish"}),
                        mc("'La gata' means?", ["The cat (f.)", "The dog (f.)", "The horse", "The fish"], "The cat (f.)"),
                        translate("Translate: 'the horse'", ["el", "caballo", "la", "vaca", "gato"], "el caballo"),
                        type_answer("Type the Spanish word for 'dog'", "perro"),
                    ],
                ],
            },
        ],
    },
    {
        "title": "Unit 2: Everyday Life", "description": "Family, colors, and travel", "color_theme": "duo-blue",
        "skills": [
            {
                "title": "Family", "icon": "home-heart",
                "lessons": [
                    [
                        mc("'La madre' means?", ["Mother", "Father", "Sister", "Brother"], "Mother"),
                        translate("Translate: 'my brother'", ["mi", "hermano", "mis", "hermana", "el"], "mi hermano"),
                        type_answer("Type the Spanish word for 'father'", "padre"),
                        fill_blank("Complete the sentence", "Ella es mi ___.", ["hermana", "hermano", "perro", "gato"], "hermana"),
                    ],
                    [
                        match("Match the family words", {"Los abuelos": "Grandparents", "El padre": "Father", "La hermana": "Sister"}),
                        mc("'Los abuelos' means?", ["Grandparents", "Parents", "Cousins", "Uncles"], "Grandparents"),
                        translate("Translate: 'my family'", ["mi", "familia", "mis", "amigos", "la"], "mi familia"),
                        type_answer("Type the Spanish word for 'mother'", "madre"),
                    ],
                ],
            },
            {
                "title": "Colors", "icon": "palette",
                "lessons": [
                    [
                        mc("'Rojo' means?", ["Red", "Blue", "Green", "Yellow"], "Red"),
                        translate("Translate: 'the blue car'", ["el", "carro", "azul", "la", "casa"], "el carro azul"),
                        type_answer("Type the Spanish word for 'green'", "verde"),
                        fill_blank("Complete the sentence", "El cielo es ___.", ["azul", "rojo", "negro", "verde"], "azul"),
                    ],
                    [
                        match("Match the colors", {"Amarillo": "Yellow", "Negro": "Black", "Verde": "Green"}),
                        mc("'Negro' means?", ["Black", "White", "Gray", "Brown"], "Black"),
                        translate("Translate: 'a yellow bird'", ["un", "pájaro", "amarillo", "una", "flor"], "un pájaro amarillo"),
                        type_answer("Type the Spanish word for 'red'", "rojo"),
                    ],
                ],
            },
            {
                "title": "Travel", "icon": "plane",
                "lessons": [
                    [
                        mc("'El aeropuerto' means?", ["Airport", "Hotel", "Train station", "Beach"], "Airport"),
                        translate("Translate: 'the hotel'", ["el", "hotel", "la", "casa", "tren"], "el hotel"),
                        type_answer("Type the Spanish word for 'suitcase'", "maleta"),
                        fill_blank("Complete the sentence", "Necesito mi ___ para viajar.", ["pasaporte", "libro", "perro", "café"], "pasaporte"),
                    ],
                    [
                        match("Match the travel words", {"El tren": "Train", "La maleta": "Suitcase", "El pasaporte": "Passport"}),
                        mc("'El tren' means?", ["Train", "Plane", "Bus", "Car"], "Train"),
                        translate("Translate: 'I need a passport'", ["Necesito", "un", "pasaporte", "una", "maleta"], "Necesito un pasaporte"),
                        type_answer("Type the Spanish word for 'airport'", "aeropuerto"),
                    ],
                ],
            },
        ],
    },
]

ACHIEVEMENTS = [
    ("first_lesson", "First Steps", "Complete your first lesson", "footprints", "lessons_completed", 1),
    ("skill_master", "Skill Master", "Complete your first skill", "star", "skills_completed", 1),
    ("three_day_streak", "On a Roll", "Reach a 3 day streak", "flame", "streak", 3),
    ("seven_day_streak", "Week Warrior", "Reach a 7 day streak", "flame", "streak", 7),
    ("century_club", "Century Club", "Earn 100 total XP", "trophy", "total_xp", 100),
    ("xp_500", "XP Legend", "Earn 500 total XP", "trophy", "total_xp", 500),
]

RIVAL_USERS = [
    ("maria_g", "Maria", "🐨", 420),
    ("leo_speaks", "Leo", "🦊", 610),
    ("noor_learns", "Noor", "🐼", 280),
    ("kenji_x", "Kenji", "🐯", 95),
    ("sofia_dev", "Sofia", "🐸", 730),
    ("amit_p", "Amit", "🦁", 340),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.User).first():
            print("DB already seeded, skipping.")
            return

        # --- content ---
        for u_idx, unit_data in enumerate(UNITS):
            unit = models.Unit(
                title=unit_data["title"], description=unit_data["description"],
                order_index=u_idx, color_theme=unit_data["color_theme"],
            )
            db.add(unit)
            db.flush()

            for s_idx, skill_data in enumerate(unit_data["skills"]):
                skill = models.Skill(
                    unit_id=unit.id, title=skill_data["title"], icon_name=skill_data["icon"], order_index=s_idx,
                )
                db.add(skill)
                db.flush()

                for l_idx, lesson_exercises in enumerate(skill_data["lessons"]):
                    lesson = models.Lesson(skill_id=skill.id, title=f"{skill_data['title']} {l_idx + 1}", order_index=l_idx, xp_reward=10)
                    db.add(lesson)
                    db.flush()
                    for e_idx, ex in enumerate(lesson_exercises):
                        db.add(models.Exercise(
                            lesson_id=lesson.id, type=ex["type"], prompt=ex["prompt"],
                            payload=ex["payload"], correct_answer=ex["correct_answer"], order_index=e_idx,
                        ))

        # --- achievements ---
        for code, title, desc, icon, req_type, req_val in ACHIEVEMENTS:
            db.add(models.Achievement(code=code, title=title, description=desc, icon_name=icon,
                                       requirement_type=req_type, requirement_value=req_val))

        db.flush()

        # --- default learner, pre-seeded with progress so the app is instantly demoable ---
        learner = models.User(
            username="abhijit", display_name="Abhijit", avatar_emoji="🦉",
            streak=3, longest_streak=5, total_xp=150, hearts=5, max_hearts=5, gems=500,
            daily_xp_goal=50, last_active_date=date.today() - timedelta(days=1),
        )
        db.add(learner)
        db.flush()

        skills = db.query(models.Skill).join(models.Unit).order_by(models.Unit.order_index, models.Skill.order_index).all()
        # Greetings + Food: completed with 1 crown. Animals: unlocked, one lesson in. Rest: locked.
        seed_progress = [
            (skills[0].id, "completed", 1, 0),  # Greetings
            (skills[1].id, "completed", 1, 0),  # Food
            (skills[2].id, "available", 0, 1),  # Animals — in progress
            (skills[3].id, "locked", 0, 0),     # Family
            (skills[4].id, "locked", 0, 0),     # Colors
            (skills[5].id, "locked", 0, 0),     # Travel
        ]
        for skill_id, status, crowns, lessons_completed in seed_progress:
            db.add(models.UserSkillProgress(
                user_id=learner.id, skill_id=skill_id, status=status,
                crowns=crowns, lessons_completed=lessons_completed,
            ))

        # backfill a few days of activity so streak + weekly leaderboard have real data
        for days_ago, xp in [(1, 60), (2, 50), (3, 40)]:
            db.add(models.DailyActivity(user_id=learner.id, activity_date=date.today() - timedelta(days=days_ago), xp_earned=xp))
        db.add(models.UserLessonCompletion(user_id=learner.id, lesson_id=1, xp_earned=10, accuracy=100))

        # --- leaderboard rivals (no lesson content needed, just users + weekly activity) ---
        for username, name, emoji, weekly_xp in RIVAL_USERS:
            rival = models.User(username=username, display_name=name, avatar_emoji=emoji, total_xp=weekly_xp * 2)
            db.add(rival)
            db.flush()
            db.add(models.DailyActivity(user_id=rival.id, activity_date=date.today() - timedelta(days=1), xp_earned=weekly_xp))

        db.commit()
        print("Seed complete: 2 units, 6 skills, 12 lessons, 48 exercises, 6 achievements, 7 users.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
