from pydantic import BaseModel, Field


class MessageRecord(BaseModel):
    id: str
    session_id: str
    sender: str
    text: str
    timestamp: str
    subject: str
    is_demo: bool = False
    provider: str = "demo"
    created_at: str


class SessionSummary(BaseModel):
    id: str
    title: str
    subject: str
    created_at: str
    updated_at: str
    message_count: int = 0


class SessionDetail(BaseModel):
    id: str
    title: str
    subject: str
    created_at: str
    updated_at: str
    messages: list[MessageRecord] = []


class CreateSessionRequest(BaseModel):
    subject: str = Field(
        default="Programação",
        min_length=1,
        max_length=100,
        description="Disciplina inicial da sessão",
    )
    title: str | None = Field(
        default=None,
        max_length=120,
        description="Título opcional para a sessão de estudo",
    )
