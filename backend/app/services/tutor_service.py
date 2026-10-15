from app.core.config import settings
from app.schemas.chat import ChatMessageResponse
from app.services.ai_base import BaseAIProvider
from app.services.demo_provider import DemoAIProvider
from app.services.gemini_provider import GeminiAIProvider


class TutorService:
    """Serviço central do Tutor de Estudos.

    Responsável por selecionar o provedor adequado (Gemini se a chave estiver presente,
    ou Demo caso contrário) e formatar a resposta para o estudante.
    """

    def __init__(self, provider: BaseAIProvider | None = None):
        if provider is not None:
            self._provider = provider
        elif settings.GEMINI_API_KEY:
            self._provider = GeminiAIProvider(api_key=settings.GEMINI_API_KEY)
        else:
            self._provider = DemoAIProvider()

    @property
    def provider(self) -> BaseAIProvider:
        return self._provider

    async def answer(self, question: str, subject: str, session_id: str = "") -> ChatMessageResponse:
        reply_text = await self._provider.generate_tutor_response(
            question=question,
            subject=subject,
        )

        return ChatMessageResponse(
            reply=reply_text,
            subject=subject,
            is_demo=self._provider.is_demo,
            provider=self._provider.provider_name,
            session_id=session_id,
        )

