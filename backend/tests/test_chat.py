import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.demo_provider import DemoAIProvider

client = TestClient(app)


def test_list_subjects():
    response = client.get("/api/subjects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5

    first = data[0]
    assert "id" in first
    assert "name" in first
    assert "icon" in first
    assert "description" in first


def test_chat_demo_mode_returns_success():
    payload = {
        "message": "Como funciona o algoritmo de busca binária?",
        "subject": "Programação",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["subject"] == "Programação"
    assert data["is_demo"] is True
    assert data["provider"] == "demo"
    assert "Modo de Demonstração Ativo" in data["reply"]
    assert "busca binária" in data["reply"]


def test_chat_empty_message_returns_bad_request():
    payload = {
        "message": "   ",
        "subject": "Matemática",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400
    assert "A pergunta não pode estar em branco." in response.json()["detail"]


def test_chat_missing_message_returns_validation_error():
    payload = {
        "subject": "Matemática",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_demo_provider_unit():
    provider = DemoAIProvider()
    assert provider.is_demo is True
    assert provider.provider_name == "demo"

    reply = await provider.generate_tutor_response("O que é inércia?", "Física")
    assert "Física" in reply
    assert "O que é inércia?" in reply
    assert "Modo de Demonstração Ativo" in reply
