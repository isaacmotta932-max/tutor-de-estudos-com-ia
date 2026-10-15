import sqlite3
from pathlib import Path
from app.core.config import settings

SQL_CREATE_TABLES = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    subject TEXT NOT NULL,
    is_demo INTEGER NOT NULL DEFAULT 0,
    provider TEXT NOT NULL DEFAULT 'demo',
    created_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages (session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions (updated_at DESC);
"""


def get_db_path() -> Path:
    """Retorna o caminho do arquivo de banco de dados SQLite."""
    return settings.DATABASE_PATH


def get_connection(db_path: Path | None = None) -> sqlite3.Connection:
    """Cria e retorna uma conexão com o banco de dados SQLite configurado."""
    path = db_path or get_db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(db_path: Path | None = None) -> None:
    """Inicializa as tabelas e índices do banco de dados SQLite."""
    with get_connection(db_path) as conn:
        conn.executescript(SQL_CREATE_TABLES)
        conn.commit()
