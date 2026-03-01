import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import db
from core.storage import storage
from services import auth
from repositories import http_responses
from routers import admin, login, projects, user, mutants, form_fields, ratings, export, algorithms

DEBUG_LOGGING = os.getenv("DEBUG_LOGGING", "false").lower() == "true"

if DEBUG_LOGGING:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    log = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    storage.setup()
    yield
    await db.disconnect()

app = FastAPI(lifespan=lifespan)

if DEBUG_LOGGING:
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        body = b""
        if request.method in ("POST", "PUT", "PATCH"):
            body = await request.body()

        log.info(f"{'─' * 50}")
        log.info(f"{request.method} {request.url.path}")
        log.info(f"  Query params: {dict(request.query_params)}")
        if body:
            log.info(f"  Body: {body.decode()}")
        log.info(f"  Headers: Content-Type={request.headers.get('content-type')}")

        response = await call_next(request)
        log.info(f"  → Response: {response.status_code}")
        return response

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(login.router)
app.include_router(user.router)
app.include_router(projects.router)
app.include_router(mutants.router)
app.include_router(form_fields.router)
app.include_router(ratings.router)
app.include_router(export.router)
app.include_router(algorithms.router)
