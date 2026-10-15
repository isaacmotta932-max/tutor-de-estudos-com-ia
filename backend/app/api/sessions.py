from fastapi import APIRouter, HTTPException, status
from app.db import repository
from app.schemas.session import CreateSessionRequest, SessionDetail, SessionSummary

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


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
