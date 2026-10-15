import uuid
from datetime import datetime, timezone
from pathlib import Path
from app.db.database import get_connection
from app.schemas.session import MessageRecord, SessionDetail, SessionSummary


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_session(
    subject: str,
    title: str | None = None,
    db_path: Path | None = None,
) -> SessionSummary:
    """Cria uma nova sessão de estudos no banco de dados."""
    session_id = str(uuid.uuid4())
    now = _utc_now_iso()
    session_title = title.strip() if title and title.strip() else f"Sessão de {subject}"

    with get_connection(db_path) as conn:
        conn.execute(
            """
            INSERT INTO sessions (id, title, subject, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (session_id, session_title, subject, now, now),
        )
        conn.commit()

    return SessionSummary(
        id=session_id,
        title=session_title,
        subject=subject,
        created_at=now,
        updated_at=now,
        message_count=0,
    )


def list_sessions(db_path: Path | None = None) -> list[SessionSummary]:
    """Lista todas as sessões de estudo ordenadas pela mais recente."""
    with get_connection(db_path) as conn:
        cursor = conn.execute(
            """
            SELECT s.id, s.title, s.subject, s.created_at, s.updated_at,
                   COUNT(m.id) as message_count
            FROM sessions s
            LEFT JOIN messages m ON s.id = m.session_id
            GROUP BY s.id
            ORDER BY s.updated_at DESC
            """
        )
        rows = cursor.fetchall()

    return [
        SessionSummary(
            id=row["id"],
            title=row["title"],
            subject=row["subject"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            message_count=row["message_count"],
        )
        for row in rows
    ]


def get_session(session_id: str, db_path: Path | None = None) -> SessionDetail | None:
    """Recupera os detalhes de uma sessão e todas as suas mensagens."""
    with get_connection(db_path) as conn:
        sess_cursor = conn.execute(
            "SELECT id, title, subject, created_at, updated_at FROM sessions WHERE id = ?",
            (session_id,),
        )
        sess_row = sess_cursor.fetchone()
        if not sess_row:
            return None

        msg_cursor = conn.execute(
            """
            SELECT id, session_id, sender, text, timestamp, subject, is_demo, provider, created_at
            FROM messages
            WHERE session_id = ?
            ORDER BY created_at ASC
            """,
            (session_id,),
        )
        msg_rows = msg_cursor.fetchall()

    messages = [
        MessageRecord(
            id=row["id"],
            session_id=row["session_id"],
            sender=row["sender"],
            text=row["text"],
            timestamp=row["timestamp"],
            subject=row["subject"],
            is_demo=bool(row["is_demo"]),
            provider=row["provider"],
            created_at=row["created_at"],
        )
        for row in msg_rows
    ]

    return SessionDetail(
        id=sess_row["id"],
        title=sess_row["title"],
        subject=sess_row["subject"],
        created_at=sess_row["created_at"],
        updated_at=sess_row["updated_at"],
        messages=messages,
    )


def delete_session(session_id: str, db_path: Path | None = None) -> bool:
    """Remove uma sessão e todas as mensagens vinculadas por cascata."""
    with get_connection(db_path) as conn:
        cursor = conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()
        return cursor.rowcount > 0


def add_message(
    session_id: str,
    sender: str,
    text: str,
    timestamp: str,
    subject: str,
    is_demo: bool,
    provider: str,
    db_path: Path | None = None,
) -> MessageRecord:
    """Grava uma nova mensagem (estudante ou tutor) na sessão e atualiza o timestamp da sessão."""
    msg_id = str(uuid.uuid4())
    now = _utc_now_iso()

    with get_connection(db_path) as conn:
        conn.execute(
            """
            INSERT INTO messages (id, session_id, sender, text, timestamp, subject, is_demo, provider, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                msg_id,
                session_id,
                sender,
                text,
                timestamp,
                subject,
                1 if is_demo else 0,
                provider,
                now,
            ),
        )

        # Atualiza o timestamp da sessão para ficar no topo da lista
        conn.execute(
            "UPDATE sessions SET updated_at = ? WHERE id = ?",
            (now, session_id),
        )
        conn.commit()

    return MessageRecord(
        id=msg_id,
        session_id=session_id,
        sender=sender,
        text=text,
        timestamp=timestamp,
        subject=subject,
        is_demo=is_demo,
        provider=provider,
        created_at=now,
    )


def update_session_title_if_default(
    session_id: str,
    first_question: str,
    db_path: Path | None = None,
) -> None:
    """Atualiza o título da sessão com base na primeira pergunta do usuário se ainda for o título padrão."""
    title_candidate = first_question.strip().replace("\n", " ")
    if len(title_candidate) > 45:
        title_candidate = title_candidate[:42] + "..."

    with get_connection(db_path) as conn:
        cursor = conn.execute("SELECT title, subject FROM sessions WHERE id = ?", (session_id,))
        row = cursor.fetchone()
        if row:
            default_title = f"Sessão de {row['subject']}"
            if row["title"] == default_title or row["title"] == "Nova conversa":
                conn.execute(
                    "UPDATE sessions SET title = ? WHERE id = ?",
                    (title_candidate, session_id),
                )
                conn.commit()
