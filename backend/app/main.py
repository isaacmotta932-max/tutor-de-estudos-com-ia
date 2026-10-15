from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.api.health import router as health_router
from app.api.subjects import router as subjects_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API do tutor educacional com suporte a IA e modo de demonstração.",
    version=settings.VERSION,
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
