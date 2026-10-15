from fastapi import APIRouter, HTTPException, Query, Response, status
from app.db import repository
from app.schemas.session import CreateSessionRequest, SessionDetail, SessionSummary

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def format_session_as_markdown(session: SessionDetail) -> str:
    """Formata o histórico da sessão de estudos em Markdown estruturado."""
    lines = [
        f"# 🎓 Caderno de Estudos: {session.title}",
        f"- **Disciplina:** {session.subject}",
        f"- **Criado em:** {session.created_at}",
        f"- **Total de Mensagens:** {len(session.messages)}",
        "",
        "---",
        "",
        "## 💬 Histórico da Sessão",
        "",
    ]
    for msg in session.messages:
        role = "👤 Estudante" if msg.sender == "user" else "🤖 Tutor IA"
        lines.append(f"### {role} ({msg.timestamp})")
        lines.append("")
        lines.append(msg.text.strip())
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("*Caderno exportado pelo Tutor de Estudos com IA - Projeto Agente Colt*")
    return "\n".join(lines)


def format_session_as_txt(session: SessionDetail) -> str:
    """Formata o histórico da sessão em texto puro legível."""
    lines = [
        "=" * 60,
        f" CADERNO DE ESTUDOS: {session.title.upper()}",
        f" DISCIPLINA: {session.subject.upper()}",
        f" CRIADO EM: {session.created_at}",
        f" TOTAL DE MENSAGENS: {len(session.messages)}",
        "=" * 60,
        "",
    ]
    for msg in session.messages:
        role = "ESTUDANTE" if msg.sender == "user" else "TUTOR"
        lines.append(f"[{role} - {msg.timestamp}]")
        lines.append(msg.text.strip())
        lines.append("-" * 40)
        lines.append("")

    lines.append("Caderno exportado pelo Tutor de Estudos com IA - Projeto Agente Colt")
    return "\n".join(lines)


@router.get("", response_model=list[SessionSummary])
async def list_study_sessions() -> list[SessionSummary]:
    """Retorna todas as sessões de estudo salvas, ordenadas pela mais recente."""
    return repository.list_sessions()


@router.post("", response_model=SessionSummary, status_code=status.HTTP_201_CREATED)
async def create_study_session(request: CreateSessionRequest) -> SessionSummary:
    """Cria explicitamente uma nova sessão de estudos para uma disciplina."""
    return repository.create_session(
        subject=request.subject.strip() or "Programação",
        title=request.title,
    )


@router.get("/{session_id}", response_model=SessionDetail)
async def get_study_session(session_id: str) -> SessionDetail:
    """Retorna o histórico completo de mensagens de uma sessão de estudos."""
    session = repository.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão de estudos não encontrada.",
        )
    return session


@router.get("/{session_id}/export")
async def export_study_session(
    session_id: str,
    format: str = Query(default="md", pattern="^(md|txt)$"),
) -> Response:
    """Exporta todo o caderno de estudos da sessão em formato Markdown ou TXT."""
    session = repository.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão não encontrada para exportação.",
        )

    import re
    import unicodedata

    normalized = unicodedata.normalize("NFKD", session.title).encode("ascii", "ignore").decode("ascii")
    safe_title = re.sub(r"[^\w\s-]", "", normalized.lower()).strip()
    safe_title = re.sub(r"[-\s]+", "_", safe_title)[:30] or "sessao"
    filename = f"estudos_{safe_title}.{format}"

    if format == "txt":
        content = format_session_as_txt(session)
        media_type = "text/plain; charset=utf-8"
    else:
        content = format_session_as_markdown(session)
        media_type = "text/markdown; charset=utf-8"

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.delete("/{session_id}", status_code=status.HTTP_200_OK)
async def delete_study_session(session_id: str) -> dict[str, str]:
    """Exclui uma sessão de estudos e todo o seu histórico de mensagens."""
    deleted = repository.delete_session(session_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão não encontrada para exclusão.",
        )
    return {"message": "Sessão excluída com sucesso.", "id": session_id}
