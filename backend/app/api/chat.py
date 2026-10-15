from fastapi import APIRouter, HTTPException, status
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.tutor_service import TutorService

router = APIRouter(prefix="/api", tags=["chat"])

# Instância reutilizável do serviço de tutor
tutor_service = TutorService()


@router.post("/chat", response_model=ChatMessageResponse, status_code=status.HTTP_200_OK)
async def ask_tutor(request: ChatMessageRequest) -> ChatMessageResponse:
    """Recebe a dúvida do estudante, a matéria e retorna a explicação didática do tutor."""
    cleaned_message = request.message.strip()
    if not cleaned_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pergunta não pode estar em branco.",
        )

    return await tutor_service.answer(
        question=cleaned_message,
        subject=request.subject.strip() or "Geral",
    )
