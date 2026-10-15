import os
from pathlib import Path
from dotenv import load_dotenv

# Carrega .env da pasta backend se existir
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)


class Settings:
    PROJECT_NAME: str = "Tutor de Estudos com IA"
    VERSION: str = "0.1.0"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
