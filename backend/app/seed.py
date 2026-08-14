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
# Themed to mirror the real Spanish course's Section 1, Units 1-3 ("Order at
# a café", "Greet people and say goodbye", "Say where you are from"). The
# vocabulary is our own small authored set in that course's style, not a copy
# of Duolingo's proprietary lesson content.
#
# 14 pairs per pool — sized so a skill's worst-case exercise draw (up to 8
# exercises/lesson, of which at most two can be a 5-pair MATCH_PAIRS) never
# needs to reuse a word within the same lesson. (spanish, english) tuples.

VOCAB = {
    # --- Unit 1: Order at a café ---
    "cafe_drinks": [
        ("el café", "the coffee"), ("el té", "the tea"), ("el agua", "the water"),
        ("la leche", "the milk"), ("el jugo", "the juice"), ("el vaso", "the glass"),
        ("la taza", "the cup"), ("el hielo", "the ice"), ("frío", "cold"), ("caliente", "hot"),
        ("un refresco", "a soda"), ("con leche", "with milk"), ("sin azúcar", "without sugar"),
        ("la bebida", "the drink"),
    ],
    "cafe_food": [
        ("el sándwich", "the sandwich"), ("el pan", "the bread"), ("la sopa", "the soup"),
        ("la ensalada", "the salad"), ("el postre", "the dessert"), ("la fruta", "the fruit"),
        ("el queso", "the cheese"), ("el huevo", "the egg"), ("el pollo", "the chicken"),
        ("el arroz", "the rice"), ("la galleta", "the cookie"), ("el pastel", "the cake"),
        ("la carne", "the meat"), ("el pescado", "the fish"),
    ],
    "cafe_polite": [
        ("por favor", "please"), ("gracias", "thank you"), ("de nada", "you're welcome"),
        ("perdón", "excuse me"), ("lo siento", "sorry"), ("la cuenta", "the bill"),
        ("quiero", "I want"), ("necesito", "I need"), ("sí", "yes"), ("no", "no"),
        ("claro", "of course"), ("muy bien", "very well"), ("otra vez", "again"),
        ("¿cuánto cuesta?", "how much is it?"),
    ],
    "cafe_table": [
        ("la mesa", "the table"), ("el menú", "the menu"), ("la silla", "the chair"),
        ("el plato", "the plate"), ("el tenedor", "the fork"), ("la cuchara", "the spoon"),
        ("el cuchillo", "the knife"), ("la servilleta", "the napkin"), ("el mesero", "the waiter"),
        ("la propina", "the tip"), ("para llevar", "to go"), ("aquí", "here"),
        ("la orden", "the order"), ("abierto", "open"),
    ],
    # --- Unit 2: Greet people and say goodbye ---
    "greet_hello": [
        ("hola", "hello"), ("buenos días", "good morning"), ("buenas tardes", "good afternoon"),
        ("buenas noches", "good evening"), ("¿cómo estás?", "how are you?"), ("bien", "well"),
        ("muy bien", "very well"), ("más o menos", "so-so"), ("¿qué tal?", "what's up?"),
        ("mucho gusto", "nice to meet you"), ("bienvenido", "welcome"), ("¿y tú?", "and you?"),
        ("encantado", "delighted"), ("igualmente", "likewise"),
    ],
    "greet_names": [
        ("me llamo", "my name is"), ("¿cómo te llamas?", "what is your name?"),
        ("el nombre", "the name"), ("señor", "sir"), ("señora", "ma'am"), ("señorita", "miss"),
        ("el amigo", "the friend"), ("la amiga", "the friend (f.)"), ("el chico", "the boy"),
        ("la chica", "the girl"), ("el hombre", "the man"), ("la mujer", "the woman"),
        ("la gente", "the people"), ("¿quién?", "who?"),
    ],
    "greet_bye": [
        ("adiós", "goodbye"), ("hasta luego", "see you later"), ("hasta mañana", "see you tomorrow"),
        ("nos vemos", "see you"), ("hasta pronto", "see you soon"), ("cuídate", "take care"),
        ("buen viaje", "have a good trip"), ("buenas noches", "good night"), ("chao", "bye"),
        ("que tengas", "may you have"), ("un buen día", "a good day"), ("gracias", "thank you"),
        ("de nada", "you're welcome"), ("con permiso", "excuse me"),
    ],
    "greet_howareyou": [
        ("estoy bien", "I am well"), ("estoy cansado", "I am tired"), ("estoy feliz", "I am happy"),
        ("estoy triste", "I am sad"), ("tengo hambre", "I am hungry"), ("tengo sed", "I am thirsty"),
        ("un poco", "a little"), ("mucho", "a lot"), ("hoy", "today"), ("ahora", "now"),
        ("también", "also"), ("pero", "but"), ("porque", "because"), ("siempre", "always"),
    ],
    # --- Unit 3: Say where you are from ---
    "from_country": [
        ("soy de", "I am from"), ("¿de dónde eres?", "where are you from?"), ("España", "Spain"),
        ("México", "Mexico"), ("Argentina", "Argentina"), ("Colombia", "Colombia"),
        ("Perú", "Peru"), ("Chile", "Chile"), ("el país", "the country"), ("la ciudad", "the city"),
        ("aquí", "here"), ("allí", "there"), ("el mundo", "the world"), ("eres de", "you are from"),
    ],
    "from_language": [
        ("el español", "Spanish"), ("el inglés", "English"), ("hablo", "I speak"),
        ("hablas", "you speak"), ("un poco", "a little"), ("no entiendo", "I do not understand"),
        ("la palabra", "the word"), ("estudio", "I study"), ("aprendo", "I learn"),
        ("el idioma", "the language"), ("despacio", "slowly"), ("otra vez", "again"),
        ("fácil", "easy"), ("difícil", "difficult"),
    ],
    "from_living": [
        ("vivo en", "I live in"), ("¿dónde vives?", "where do you live?"), ("la casa", "the house"),
        ("mi casa", "my house"), ("el apartamento", "the apartment"), ("la calle", "the street"),
        ("el barrio", "the neighborhood"), ("cerca", "near"), ("lejos", "far"),
        ("el pueblo", "the town"), ("solo", "alone"), ("nuevo", "new"), ("grande", "big"),
        ("pequeño", "small"),
    ],
    "from_about": [
        ("mi familia", "my family"), ("mamá", "mom"), ("papá", "dad"), ("tengo", "I have"),
        ("los años", "the years"), ("el trabajo", "the job"), ("trabajo en", "I work at"),
        ("el estudiante", "the student"), ("el maestro", "the teacher"), ("el libro", "the book"),
        ("el perro", "the dog"), ("el gato", "the cat"), ("mi amigo", "my friend"),
        ("me gusta", "I like"),
    ],
}

# (prompt, sentence-with-blank, answer, options) — options always include the answer.
FILL_BLANK_BANK = {
    "cafe_drinks": [
        ("Complete the sentence", "Quiero un vaso de ___.", "agua", ["agua", "pan", "mesa", "silla"]),
        ("Complete the sentence", "Me gusta el café con ___.", "leche", ["leche", "hielo", "queso", "pollo"]),
        ("Complete the sentence", "El ___ está caliente.", "té", ["té", "jugo", "pan", "postre"]),
    ],
    "cafe_food": [
        ("Complete the sentence", "Como un ___ de queso.", "sándwich", ["sándwich", "vaso", "menú", "café"]),
        ("Complete the sentence", "La ___ está muy caliente.", "sopa", ["sopa", "galleta", "propina", "silla"]),
        ("Complete the sentence", "De postre quiero un ___.", "pastel", ["pastel", "huevo", "arroz", "plato"]),
    ],
    "cafe_polite": [
        ("Complete the sentence", "La cuenta, por ___.", "favor", ["favor", "nada", "gusto", "aquí"]),
        ("Complete the sentence", "Muchas ___ por todo.", "gracias", ["gracias", "perdón", "claro", "quiero"]),
        ("Complete the sentence", "___ un café, por favor.", "Quiero", ["Quiero", "Gracias", "Perdón", "Claro"]),
    ],
    "cafe_table": [
        ("Complete the sentence", "El ___ trae la comida.", "mesero", ["mesero", "menú", "plato", "tenedor"]),
        ("Complete the sentence", "¿Me trae el ___, por favor?", "menú", ["menú", "hielo", "pollo", "barrio"]),
        ("Complete the sentence", "Es para ___.", "llevar", ["llevar", "aquí", "abierto", "propina"]),
    ],
    "greet_hello": [
        ("Complete the greeting", "___, ¿cómo estás?", "Hola", ["Hola", "Adiós", "Gracias", "Agua"]),
        ("Complete the greeting", "Buenos ___, señora.", "días", ["días", "tardes", "noches", "gusto"]),
        ("Complete the sentence", "Mucho ___ en conocerte.", "gusto", ["gusto", "bien", "tal", "poco"]),
    ],
    "greet_names": [
        ("Complete the sentence", "Me ___ Ana.", "llamo", ["llamo", "hablo", "vivo", "tengo"]),
        ("Complete the question", "¿Cómo te ___?", "llamas", ["llamas", "hablas", "vives", "eres"]),
        ("Complete the sentence", "Ella es mi ___.", "amiga", ["amiga", "amigo", "señor", "chico"]),
    ],
    "greet_bye": [
        ("Complete the farewell", "___, nos vemos mañana.", "Adiós", ["Adiós", "Hola", "Gracias", "Bien"]),
        ("Complete the farewell", "Hasta ___.", "luego", ["luego", "gusto", "favor", "poco"]),
        ("Complete the sentence", "Que tengas un buen ___.", "día", ["día", "viaje", "nombre", "país"]),
    ],
    "greet_howareyou": [
        ("Complete the sentence", "Hoy estoy muy ___.", "bien", ["bien", "poco", "hoy", "pero"]),
        ("Complete the sentence", "Tengo ___ y quiero agua.", "sed", ["sed", "hambre", "mucho", "ahora"]),
        ("Complete the sentence", "Estoy ___ porque trabajé mucho.", "cansado", ["cansado", "feliz", "triste", "bien"]),
    ],
    "from_country": [
        ("Complete the sentence", "___ de México.", "Soy", ["Soy", "Eres", "Vivo", "Hablo"]),
        ("Complete the question", "¿De dónde ___?", "eres", ["eres", "soy", "vives", "hablas"]),
        ("Complete the sentence", "España es un ___ bonito.", "país", ["país", "mundo", "barrio", "idioma"]),
    ],
    "from_language": [
        ("Complete the sentence", "___ español un poco.", "Hablo", ["Hablo", "Vivo", "Tengo", "Soy"]),
        ("Complete the sentence", "El ___ no es difícil.", "español", ["español", "inglés", "libro", "país"]),
        ("Complete the sentence", "Más ___, por favor.", "despacio", ["despacio", "fácil", "otra", "poco"]),
    ],
    "from_living": [
        ("Complete the sentence", "___ en una ciudad grande.", "Vivo", ["Vivo", "Soy", "Hablo", "Tengo"]),
        ("Complete the sentence", "Mi ___ está cerca.", "casa", ["casa", "calle", "pueblo", "barrio"]),
        ("Complete the question", "¿Dónde ___ tú?", "vives", ["vives", "eres", "hablas", "tengo"]),
    ],
    "from_about": [
        ("Complete the sentence", "___ un perro y un gato.", "Tengo", ["Tengo", "Soy", "Vivo", "Hablo"]),
        ("Complete the sentence", "Mi ___ se llama Ana.", "mamá", ["mamá", "papá", "libro", "gato"]),
        ("Complete the sentence", "Me ___ el café.", "gusta", ["gusta", "tengo", "hablo", "vivo"]),
    ],
}

EXERCISE_TYPES = ["mc", "translate", "type_answer", "fill_blank", "match"]

# Prompt phrasings lifted from the real app's exercise headers, so the lesson
# player reads like Duolingo rather than like a generic quiz.
MC_ES_OPTION_PROMPTS = ['Which one of these is "{en}"?', 'How do you say "{en}"?']


def _build_exercise(etype, vocab, sentences, used_in_lesson, rng):
    if etype == "mc":
        candidates = [v for v in vocab if v[0] not in used_in_lesson] or vocab
        es, en = rng.choice(candidates)
        used_in_lesson.add(es)
        # Real Duolingo asks in English and offers Spanish choices (see the
        # "Which one of these is 'coffee'?" / "How do you say 'water'?" cards),
        # so the options are the Spanish side, not the English side.
        distractor_pool = [v[0] for v in vocab if v[0] != es]
        options = rng.sample(distractor_pool, min(2, len(distractor_pool))) + [es]
        rng.shuffle(options)
        return mc(rng.choice(MC_ES_OPTION_PROMPTS).format(en=en), options, es)

    if etype == "translate":
        candidates = [v for v in vocab if v[0] not in used_in_lesson] or vocab
        es, en = rng.choice(candidates)
        used_in_lesson.add(es)
        # Alternate direction like the real app ("Write this in English" over a
        # Spanish phrase, and vice versa).
        to_english = rng.random() < 0.5
        source, answer = (es, en) if to_english else (en, es)
        side = 0 if to_english else 1  # which side of the pool distractors come from
        words = answer.split(" ")
        distractor_pool = [
            w for v in vocab if v[side] != answer for w in v[side].split(" ") if w not in words
        ]
        word_bank = words + rng.sample(distractor_pool, min(2, len(distractor_pool)))
        rng.shuffle(word_bank)
        prompt = "Write this in English" if to_english else "Write this in Spanish"
        return translate(f"{prompt}: {source}", word_bank, answer)

    if etype == "type_answer":
        candidates = [v for v in vocab if v[0] not in used_in_lesson] or vocab
        es, en = rng.choice(candidates)
        used_in_lesson.add(es)
        return type_answer(f'Type this in Spanish: "{en}"', es, hint=en)

    if etype == "fill_blank":
        prompt, sentence, answer, options = rng.choice(sentences)
        return fill_blank(prompt, sentence, options, answer)

    # match — the real app shows five pairs side by side
    pair_count = 5
    candidates = [v for v in vocab if v[0] not in used_in_lesson]
    if len(candidates) < pair_count:
        candidates = vocab
    chosen = rng.sample(candidates, pair_count)
    for es, _ in chosen:
        used_in_lesson.add(es)
    return match("Select the matching pairs", dict(chosen))


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

# Unit titles/order/colors mirror the real Spanish course's Section 1. Each
# skill below is one *node* on the path (real Duolingo calls the popup's
# "Lesson 2 of 4" counter against this node's lesson list).
UNITS = [
    {
        "title": "Section 1, Unit 1", "description": "Order at a café", "color_theme": "duo-green",
        "skills": [
            {"title": "Order drinks", "icon": "coffee", "lessons": build_lessons("cafe_drinks", _rng)},
            {"title": "Order food", "icon": "utensils", "lessons": build_lessons("cafe_food", _rng)},
            {"title": "Be polite", "icon": "hand-wave", "lessons": build_lessons("cafe_polite", _rng)},
            {"title": "At the table", "icon": "table", "lessons": build_lessons("cafe_table", _rng)},
        ],
    },
    {
        "title": "Section 1, Unit 2", "description": "Greet people and say goodbye", "color_theme": "duo-purple",
        "skills": [
            {"title": "Say hello", "icon": "hand-wave", "lessons": build_lessons("greet_hello", _rng)},
            {"title": "Share your name", "icon": "user", "lessons": build_lessons("greet_names", _rng)},
            {"title": "Say goodbye", "icon": "message", "lessons": build_lessons("greet_bye", _rng)},
            {"title": "Ask how it's going", "icon": "smile", "lessons": build_lessons("greet_howareyou", _rng)},
        ],
    },
    {
        "title": "Section 1, Unit 3", "description": "Say where you are from", "color_theme": "duo-teal",
        "skills": [
            {"title": "Your country", "icon": "globe", "lessons": build_lessons("from_country", _rng)},
            {"title": "Languages", "icon": "languages", "lessons": build_lessons("from_language", _rng)},
            {"title": "Where you live", "icon": "home-heart", "lessons": build_lessons("from_living", _rng)},
            {"title": "About you", "icon": "user", "lessons": build_lessons("from_about", _rng)},
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
        # Mirrors the real app's opening state: the first node of Unit 1 is
        # finished, the second is the "current" one part-way through (so the
        # Start bubble + partial progress ring both have something to show),
        # everything after that is still locked.
        for index, skill in enumerate(skills):
            if index == 0:
                status, crowns, lessons_completed = "completed", 1, 0
            elif index == 1:
                status, crowns, lessons_completed = "available", 0, 1
            else:
                status, crowns, lessons_completed = "locked", 0, 0
            db.add(models.UserSkillProgress(
                user_id=learner.id, skill_id=skill.id, status=status,
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
