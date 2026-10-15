from fastapi import APIRouter, status
from app.schemas.exercise import (
    ExerciseEvaluateRequest,
    ExerciseEvaluateResponse,
    ExerciseGenerateRequest,
    ExerciseResponse,
)
from app.services.exercise_service import exercise_service

router = APIRouter(prefix="/api/exercises", tags=["exercises"])


@router.post("/generate", response_model=ExerciseResponse, status_code=status.HTTP_200_OK)
async def generate_exercise(request: ExerciseGenerateRequest) -> ExerciseResponse:
    """Gera um exercício de fixação com alternativas e resolução passo a passo para a disciplina indicada."""
    return await exercise_service.generate_exercise(request)


@router.post("/evaluate", response_model=ExerciseEvaluateResponse, status_code=status.HTTP_200_OK)
async def evaluate_exercise(request: ExerciseEvaluateRequest) -> ExerciseEvaluateResponse:
    """Avalia a alternativa selecionada pelo estudante, atribuindo pontuação e feedback didático."""
    return exercise_service.evaluate_answer(request)
