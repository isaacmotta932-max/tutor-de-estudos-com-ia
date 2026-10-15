from app.services.ai_base import BaseAIProvider


class DemoAIProvider(BaseAIProvider):
    """Provedor para modo de demonstração.

    Utilizado quando nenhuma chave de API externa foi configurada.
    Não simula respostas falsas de IA: apenas confirma o fluxo de dados
    entre frontend e backend e orienta o usuário sobre como configurar
    a integração definitiva.
    """

    @property
    def provider_name(self) -> str:
        return "demo"

    @property
    def is_demo(self) -> bool:
        return True

    async def generate_tutor_response(self, question: str, subject: str) -> str:
        return (
            "🛠️ **Modo de Demonstração Ativo**\n\n"
            "Esta mensagem confirma que a comunicação entre o frontend e a API FastAPI "
            "está funcionando perfeitamente!\n\n"
            f"- **Matéria selecionada:** {subject}\n"
            f"- **Pergunta recebida:** *\"{question}\"*\n\n"
            "> **Observação pedagógica:** Como nenhuma chave de IA (`GEMINI_API_KEY`) foi configurada no "
            "arquivo `.env` do backend, o sistema opera neste modo demonstrativo sem gerar "
            "conteúdo sintetizado por modelo.\n\n"
            "### Para ativar respostas reais do Tutor com IA:\n"
            "1. Acesse o [Google AI Studio](https://aistudio.google.com/apikey) e gere sua chave gratuita.\n"
            "2. Abra o arquivo `backend/.env` (ou copie de `.env.example`).\n"
            "3. Defina `GEMINI_API_KEY=sua_chave_aqui` e reinicie o backend.\n"
            "4. A partir de então, o Tutor responderá com explicações didáticas completas!"
        )
