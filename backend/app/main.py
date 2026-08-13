import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import router
from app.seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed()  # no-op if the DB already has data
    yield


app = FastAPI(title="Duolingo Clone API", version="1.0.0", lifespan=lifespan)

# CORS_ORIGINS, comma-separated (e.g. "https://your-app.vercel.app"), lets the
# deployed frontend origin be locked down via an env var with no code change.
# Defaults to "*" so local dev and the initial deploy (before the frontend's
# URL is known) work out of the box.
_cors_origins_env = os.getenv("CORS_ORIGINS")
_allow_origins = [o.strip() for o in _cors_origins_env.split(",")] if _cors_origins_env else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "duolingo-clone-api"}
