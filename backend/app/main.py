from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.api.exercises import router as exercises_router
from app.api.health import router as health_router
from app.api.sessions import router as sessions_router
from app.api.subjects import router as subjects_router
from app.core.config import settings
from app.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializa as tabelas do banco SQLite ao subir o servidor
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API do tutor educacional com suporte a IA e modo de demonstração.",
    version=settings.VERSION,
    lifespan=lifespan,
)

# Configuração do CORS para permitir que o frontend (Vite) se comunique com a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos roteadores da API
app.include_router(health_router)
app.include_router(subjects_router)
app.include_router(chat_router)
app.include_router(sessions_router)
app.include_router(exercises_router)

