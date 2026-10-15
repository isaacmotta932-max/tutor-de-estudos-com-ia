from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from app.db import repository
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.tutor_service import TutorService

router = APIRouter(prefix="/api", tags=["chat"])

# Instância reutilizável do serviço de tutor
tutor_service = TutorService()


@router.post("/chat", response_model=ChatMessageResponse, status_code=status.HTTP_200_OK)
async def ask_tutor(request: ChatMessageRequest) -> ChatMessageResponse:
    """Recebe a dúvida do estudante, a matéria e persiste tanto a pergunta quanto a resposta na sessão SQLite."""
    cleaned_message = request.message.strip()
    if not cleaned_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pergunta não pode estar em branco.",
        )

    subject = request.subject.strip() or "Geral"

    # Garante a existência de uma sessão ativa ou cria uma nova automaticamente
    session_id = request.session_id
    if session_id:
        existing = repository.get_session(session_id)
        if not existing:
            new_session = repository.create_session(subject=subject)
            session_id = new_session.id
    else:
        new_session = repository.create_session(subject=subject)
        session_id = new_session.id

    now_time = datetime.now().strftime("%H:%M")

    # Persiste a pergunta do usuário no banco SQLite
    repository.add_message(
        session_id=session_id,
        sender="user",
        text=cleaned_message,
        timestamp=now_time,
        subject=subject,
        is_demo=False,
        provider="user",
    )

    # Atualiza o título da sessão se ainda estiver com o título padrão
    repository.update_session_title_if_default(
        session_id=session_id,
        first_question=cleaned_message,
    )

    # Gera a resposta do Tutor IA
    response = await tutor_service.answer(
        question=cleaned_message,
        subject=subject,
        session_id=session_id,
    )

    # Persiste a resposta do tutor no banco SQLite
    tutor_time = datetime.now().strftime("%H:%M")
    repository.add_message(
        session_id=session_id,
        sender="tutor",
        text=response.reply,
        timestamp=tutor_time,
        subject=response.subject,
        is_demo=response.is_demo,
        provider=response.provider,
    )

    return response
