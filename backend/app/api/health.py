from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    """Endpoint de verificação: confirma que a API está no ar.

    Não consulta o Gemini nem banco de dados. Se este endereço falhar,
    o problema está no servidor, não na inteligência artificial.
    """
    return {"status": "ok", "service": "tutor-estudos"}
