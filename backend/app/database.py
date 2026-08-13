"""
Database engine + session configuration.

Uses SQLite for zero-config local/dev persistence, per assignment spec.
DB file lives at backend/app/duolingo.db so it survives restarts (persistence
requirement for XP/streak/hearts/completed skills).
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/duolingo.db")

# check_same_thread=False is required because FastAPI can service a request
# on a different thread than the one that created the SQLite connection.
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a request-scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
