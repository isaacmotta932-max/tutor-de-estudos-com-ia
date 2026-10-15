from abc import ABC, abstractmethod


class BaseAIProvider(ABC):
    """Interface base para provedores de inteligência artificial.

    Permite desacoplar a lógica de negócio do provedor específico (Gemini, Groq, etc.),
    tornando o sistema extensível e fácil de testar.
    """

    @abstractmethod
    async def generate_tutor_response(self, question: str, subject: str) -> str:
        """Gera uma explicação didática para a dúvida do estudante na matéria informada."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Nome identificador do provedor."""
        pass

    @property
    @abstractmethod
    def is_demo(self) -> bool:
        """Indica se é um provedor de demonstração (sem IA externa)."""
        pass
