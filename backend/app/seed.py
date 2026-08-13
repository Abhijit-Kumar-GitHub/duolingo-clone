"""
Seeds a small Spanish course + a ready-to-demo learner + leaderboard rivals.

Run standalone with `python -m app.seed`, or imported and called from
main.py on startup if the DB is empty.
"""
import random
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


# ---- Per-topic vocab pools + fill-in-the-blank sentence bank ---------------
# Real (small) Spanish vocab per topic, 14 pairs each — sized so a skill's
# worst-case exercise draw (up to 8 exercises/lesson, one of which can be a
# 3-word MATCH_PAIRS) never needs to reuse a word within the same lesson.
# (spanish, english) tuples.

VOCAB = {
    "Greetings": [
        ("Hola", "Hello"), ("Adiós", "Goodbye"), ("Buenos días", "Good morning"),
        ("Buenas tardes", "Good afternoon"), ("Buenas noches", "Good night"),
        ("Por favor", "Please"), ("Gracias", "Thank you"), ("De nada", "You're welcome"),
        ("Lo siento", "Sorry"), ("Perdón", "Excuse me"), ("Mucho gusto", "Nice to meet you"),
        ("Hasta luego", "See you later"), ("¿Cómo estás?", "How are you?"), ("Bienvenido", "Welcome"),
    ],
    "Food": [
        ("La manzana", "Apple"), ("El agua", "Water"), ("El pan", "Bread"), ("El café", "Coffee"),
        ("La leche", "Milk"), ("La fruta", "Fruit"), ("La carne", "Meat"), ("El queso", "Cheese"),
        ("La ensalada", "Salad"), ("El arroz", "Rice"), ("La sopa", "Soup"), ("El pollo", "Chicken"),
        ("El pescado", "Fish"), ("La naranja", "Orange"),
    ],
    "Animals": [
        ("El perro", "Dog"), ("El gato", "Cat"), ("El pájaro", "Bird"), ("El caballo", "Horse"),
        ("El pez", "Fish"), ("La vaca", "Cow"), ("El león", "Lion"), ("El oso", "Bear"),
        ("El conejo", "Rabbit"), ("La oveja", "Sheep"), ("El elefante", "Elephant"),
        ("El ratón", "Mouse"), ("La gallina", "Hen"), ("El tigre", "Tiger"),
    ],
    "Family": [
        ("La madre", "Mother"), ("El padre", "Father"), ("El hermano", "Brother"),
        ("La hermana", "Sister"), ("Los abuelos", "Grandparents"), ("La familia", "Family"),
        ("El hijo", "Son"), ("La hija", "Daughter"), ("El tío", "Uncle"), ("La tía", "Aunt"),
        ("El primo", "Cousin (m.)"), ("La prima", "Cousin (f.)"), ("Los padres", "Parents"),
        ("El abuelo", "Grandfather"),
    ],
    "Colors": [
        ("Rojo", "Red"), ("Azul", "Blue"), ("Verde", "Green"), ("Amarillo", "Yellow"),
        ("Negro", "Black"), ("Blanco", "White"), ("Gris", "Gray"), ("Rosado", "Pink"),
        ("Morado", "Purple"), ("Marrón", "Brown"), ("Naranja", "Orange"), ("Dorado", "Golden"),
        ("Plateado", "Silver"), ("Celeste", "Sky blue"),
    ],
    "Travel": [
        ("El aeropuerto", "Airport"), ("El hotel", "Hotel"), ("La maleta", "Suitcase"),
        ("El pasaporte", "Passport"), ("El tren", "Train"), ("El boleto", "Ticket"),
        ("El mapa", "Map"), ("La playa", "Beach"), ("El avión", "Airplane"),
        ("La estación", "Station"), ("El taxi", "Taxi"), ("La reserva", "Reservation"),
        ("El viaje", "Trip"), ("La ciudad", "City"),
    ],
}

# (prompt, sentence-with-blank, answer, options) — options always include the answer.
FILL_BLANK_BANK = {
    "Greetings": [
        ("Complete the greeting", "___, ¿cómo estás?", "Hola", ["Hola", "Adiós", "Gracias", "Agua"]),
        ("Complete the sentence", "Muchas ___ por tu ayuda.", "Gracias", ["Gracias", "Por favor", "Perdón", "Hola"]),
        ("Complete the farewell", "___, nos vemos mañana.", "Hasta luego", ["Hasta luego", "Buenos días", "Gracias", "Lo siento"]),
    ],
    "Food": [
        ("Complete the sentence", "Quiero un vaso de ___.", "agua", ["agua", "pan", "leche", "carne"]),
        ("Complete the sentence", "Como ___ con mantequilla.", "pan", ["pan", "queso", "arroz", "sopa"]),
        ("Complete the sentence", "Me gusta el ___ con leche.", "café", ["café", "agua", "pescado", "pollo"]),
    ],
    "Animals": [
        ("Complete the sentence", "El ___ nada en el agua.", "pez", ["pez", "perro", "pájaro", "caballo"]),
        ("Complete the sentence", "El ___ vive en la granja.", "caballo", ["caballo", "gato", "león", "oso"]),
        ("Complete the sentence", "El ___ es el rey de la selva.", "león", ["león", "conejo", "ratón", "oveja"]),
    ],
    "Family": [
        ("Complete the sentence", "Ella es mi ___.", "hermana", ["hermana", "hermano", "perro", "gato"]),
        ("Complete the sentence", "Mi ___ tiene ochenta años.", "abuelo", ["abuelo", "primo", "hijo", "tío"]),
        ("Complete the sentence", "Toda mi ___ viene a cenar.", "familia", ["familia", "hija", "tía", "prima"]),
    ],
    "Colors": [
        ("Complete the sentence", "El cielo es ___.", "azul", ["azul", "rojo", "negro", "verde"]),
        ("Complete the sentence", "La sangre es de color ___.", "rojo", ["rojo", "amarillo", "blanco", "gris"]),
        ("Complete the sentence", "La nieve es ___.", "blanco", ["blanco", "negro", "marrón", "morado"]),
    ],
    "Travel": [
        ("Complete the sentence", "Necesito mi ___ para viajar.", "pasaporte", ["pasaporte", "libro", "perro", "café"]),
        ("Complete the sentence", "Compramos el ___ para el tren.", "boleto", ["boleto", "mapa", "taxi", "hotel"]),
        ("Complete the sentence", "Vamos a la ___ para nadar.", "playa", ["playa", "estación", "maleta", "ciudad"]),
    ],
}

EXERCISE_TYPES = ["mc", "translate", "type_answer", "fill_blank", "match"]


def _build_exercise(etype, vocab, sentences, used_in_lesson, rng):
    if etype == "mc":
        candidates = [v for v in vocab if v[0] not in used_in_lesson] or vocab
        es, en = rng.choice(candidates)
        used_in_lesson.add(es)
        distractor_pool = [v[1] for v in vocab if v[1] != en]
        options = rng.sample(distractor_pool, min(3, len(distractor_pool))) + [en]
        rng.shuffle(options)
        return mc(f"'{es}' means?", options, en)

    if etype == "translate":
        candidates = [v for v in vocab if v[0] not in used_in_lesson] or vocab
        es, en = rng.choice(candidates)
        used_in_lesson.add(es)
        words = es.split(" ")
        distractor_pool = [w for v in vocab if v[0] != es for w in v[0].split(" ") if w not in words]
        word_bank = words + rng.sample(distractor_pool, min(2, len(distractor_pool)))
        rng.shuffle(word_bank)
        return translate(f"Translate: '{en}'", word_bank, es)

    if etype == "type_answer":
        candidates = [v for v in vocab if v[0] not in used_in_lesson] or vocab
        es, en = rng.choice(candidates)
        used_in_lesson.add(es)
        return type_answer(f"Type the Spanish word for '{en}'", es, hint=en)

    if etype == "fill_blank":
        prompt, sentence, answer, options = rng.choice(sentences)
        return fill_blank(prompt, sentence, options, answer)

    # match — needs 3 distinct pairs
    candidates = [v for v in vocab if v[0] not in used_in_lesson]
    if len(candidates) < 3:
        candidates = vocab
    chosen = rng.sample(candidates, 3)
    for es, _ in chosen:
        used_in_lesson.add(es)
    return match("Match the words to their meanings", dict(chosen))


def build_lessons(topic, rng, lesson_count=None):
    """Generates lesson_count (default: random 3-5) lessons for a topic, each
    with a random 4-8 exercises of varied type, drawn from that topic's real
    vocab pool — matching real Duolingo's per-skill lesson/exercise counts
    rather than this app's earlier fixed 2-lessons-of-4 shape."""
    vocab = VOCAB[topic]
    sentences = FILL_BLANK_BANK[topic]
    lesson_count = lesson_count if lesson_count is not None else rng.randint(3, 5)

    lessons = []
    for _ in range(lesson_count):
        exercise_count = rng.randint(4, 8)
        type_sequence = []
        while len(type_sequence) < exercise_count:
            batch = EXERCISE_TYPES[:]
            rng.shuffle(batch)
            type_sequence.extend(batch)
        type_sequence = type_sequence[:exercise_count]

        used_in_lesson = set()
        lessons.append([_build_exercise(t, vocab, sentences, used_in_lesson, rng) for t in type_sequence])
    return lessons


# Fixed seed so `rm duolingo.db && python -m app.seed` reproduces identical
# content every time (stable for demoing/grading, not reshuffled per run).
_rng = random.Random(20240613)

UNITS = [
    {
        "title": "Unit 1: Basics", "description": "Greetings, food, and animals", "color_theme": "duo-green",
        "skills": [
            {"title": "Greetings", "icon": "hand-wave", "lessons": build_lessons("Greetings", _rng)},
            {"title": "Food", "icon": "utensils", "lessons": build_lessons("Food", _rng)},
            {"title": "Animals", "icon": "paw", "lessons": build_lessons("Animals", _rng)},
        ],
    },
    {
        "title": "Unit 2: Everyday Life", "description": "Family, colors, and travel", "color_theme": "duo-blue",
        "skills": [
            {"title": "Family", "icon": "home-heart", "lessons": build_lessons("Family", _rng)},
            {"title": "Colors", "icon": "palette", "lessons": build_lessons("Colors", _rng)},
            {"title": "Travel", "icon": "plane", "lessons": build_lessons("Travel", _rng)},
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
        n_units = len(UNITS)
        n_skills = sum(len(u["skills"]) for u in UNITS)
        n_lessons = sum(len(s["lessons"]) for u in UNITS for s in u["skills"])
        n_exercises = sum(len(l) for u in UNITS for s in u["skills"] for l in s["lessons"])
        print(
            f"Seed complete: {n_units} units, {n_skills} skills, {n_lessons} lessons, "
            f"{n_exercises} exercises, {len(ACHIEVEMENTS)} achievements, {1 + len(RIVAL_USERS)} users."
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed()
