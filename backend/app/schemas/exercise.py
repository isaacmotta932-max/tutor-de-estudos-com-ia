from typing import Literal
from pydantic import BaseModel, Field

DifficultyLevel = Literal["Iniciante", "Intermediário", "Avançado"]


class ExerciseGenerateRequest(BaseModel):
    subject: str = Field(
        default="Programação",
        min_length=1,
        max_length=100,
        description="Disciplina para geração do exercício",
        examples=["Programação"],
    )
    difficulty: DifficultyLevel = Field(
        default="Intermediário",
        description="Nível de dificuldade do exercício",
    )
    topic: str | None = Field(
        default=None,
        max_length=120,
        description="Tópico específico opcional dentro da matéria",
        examples=["Estruturas de Dados"],
    )


class ExerciseResponse(BaseModel):
    id: str
    subject: str
    difficulty: str
    topic: str
    question: str
    options: list[str] = Field(..., min_length=2, max_length=6)
    correct_option_index: int = Field(..., ge=0)
    explanation: str
    is_demo: bool = True
    provider: str = "demo"


class ExerciseEvaluateRequest(BaseModel):
    exercise_id: str
    subject: str
    selected_index: int = Field(..., ge=0)
    correct_index: int = Field(..., ge=0)
    explanation: str


class ExerciseEvaluateResponse(BaseModel):
    is_correct: bool
    feedback: str
    explanation: str
    score_points: int
