from fastapi import APIRouter
from app.schemas.subject import Subject

router = APIRouter(prefix="/api", tags=["subjects"])

DEFAULT_SUBJECTS: list[Subject] = [
    Subject(
        id="programacao",
        name="Programação",
        icon="💻",
        description="Lógica, algoritmos, Python, estruturas de dados e desenvolvimento web",
    ),
    Subject(
        id="matematica",
        name="Matemática",
        icon="📐",
        description="Cálculo diferencial e integral, álgebra linear, geometria e estatística",
    ),
    Subject(
        id="fisica",
        name="Física",
        icon="⚛️",
        description="Mecânica clássica, eletromagnetismo, termodinâmica e ótica",
    ),
    Subject(
        id="quimica",
        name="Química",
        icon="🧪",
        description="Estequiometria, ligações químicas, termoquímica e química orgânica",
    ),
    Subject(
        id="engenharia",
        name="Engenharia e Hardware",
        icon="⚡",
        description="Circuitos elétricos, arquitetura de computadores e sistemas digitais",
    ),
    Subject(
        id="geral",
        name="Geral / Metodologia",
        icon="📚",
        description="Técnicas de estudo, organização de rotina e dúvidas multidisciplinares",
    ),
]


@router.get("/subjects", response_model=list[Subject])
def list_subjects() -> list[Subject]:
    """Retorna as matérias disponíveis para o estudante selecionar."""
    return DEFAULT_SUBJECTS
