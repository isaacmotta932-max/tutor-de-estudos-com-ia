from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Dúvida ou pergunta do estudante",
        examples=["O que é recursão e como posso usá-la em Python?"],
    )
    subject: str = Field(
        default="Geral",
        description="Matéria ou disciplina selecionada",
        examples=["Programação"],
    )
    session_id: str | None = Field(
        default=None,
        description="Identificador único da sessão de estudo existente (opcional)",
    )


class ChatMessageResponse(BaseModel):
    reply: str = Field(..., description="Resposta explicativa e didática do tutor")
    subject: str = Field(..., description="Matéria selecionada para a resposta")
    is_demo: bool = Field(
        default=False,
        description="Indica se a resposta foi gerada em modo demonstração (sem chave de IA configurada)",
    )
    provider: str = Field(
        default="demo",
        description="Identificação do provedor da resposta (ex.: 'gemini' ou 'demo')",
    )
    session_id: str = Field(
        ...,
        description="Identificador único da sessão onde a mensagem foi gravada",
    )

