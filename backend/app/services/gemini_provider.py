import logging
import httpx
from app.services.ai_base import BaseAIProvider

logger = logging.getLogger(__name__)


class GeminiAIProvider(BaseAIProvider):
    """Integração com a Google Gemini API via HTTPS usando httpx.

    Não requer SDK pesado nem execução de modelos locais no computador.
    """

    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model = model
        self.api_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        )

    @property
    def provider_name(self) -> str:
        return f"gemini ({self.model})"

    @property
    def is_demo(self) -> bool:
        return False

    def _build_system_instruction(self, subject: str) -> str:
        return (
            "Você é um tutor educacional dedicado, paciente e didático para estudantes de graduação e ensino médio.\n"
            f"A matéria atual é: {subject}.\n"
            "Siga rigorosamente estas diretrizes ao responder:\n"
            "1. Explique conceitos de forma clara, estruturada e amigável em português do Brasil.\n"
            "2. Quando a pergunta envolver problemas ou cálculos, resolva passo a passo.\n"
            "3. Apresente pelo menos um exemplo prático ou analogia do mundo real.\n"
            "4. Ao final da resposta, proponha um pequeno exercício prático ou pergunta rápida para fixação.\n"
            "5. Mantenha um tom encorajador e acolhedor."
        )

    async def generate_tutor_response(self, question: str, subject: str) -> str:
        system_instruction = self._build_system_instruction(subject)

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"Matéria: {subject}\nPergunta do estudante: {question}"}],
                }
            ],
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 2048,
            },
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    self.api_url,
                    params={"key": self.api_key},
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                # Extrai o texto da resposta do Gemini
                candidates = data.get("candidates", [])
                if not candidates:
                    return "Desculpe, o provedor de IA não retornou nenhuma resposta para esta pergunta."

                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    return "Desculpe, o modelo retornou uma resposta vazia."

                return parts[0].get("text", "").strip()

            except httpx.HTTPStatusError as exc:
                logger.error("Erro HTTP na API Gemini: %s - %s", exc.response.status_code, exc.response.text)
                if exc.response.status_code == 400:
                    return "Erro na requisição para a IA. Verifique se o formato da pergunta ou a chave de API são válidos."
                if exc.response.status_code in (401, 403):
                    return "A chave da API Gemini informada é inválida ou não possui permissão de acesso."
                if exc.response.status_code == 429:
                    return "Limite temporário de requisições gratuitas atingido no Gemini. Aguarde alguns instantes e tente novamente."
                return f"Falha temporária ao comunicar com a IA (status {exc.response.status_code}). Tente novamente."

            except httpx.RequestError as exc:
                logger.error("Erro de conexão com a API Gemini: %s", exc)
                return "Não foi possível conectar aos servidores de inteligência artificial. Verifique sua conexão com a internet."
