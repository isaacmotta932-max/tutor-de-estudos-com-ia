import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import database

client = TestClient(app)


def test_create_and_list_sessions():
    # Cria sessão inicial
    payload = {"subject": "Física", "title": "Estudo de Cinemática"}
    response = client.post("/api/sessions", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["subject"] == "Física"
    assert created["title"] == "Estudo de Cinemática"
    assert created["message_count"] == 0
    assert "id" in created

    # Lista sessões
    list_res = client.get("/api/sessions")
    assert list_res.status_code == 200
    sessions = list_res.json()
    assert len(sessions) == 1
    assert sessions[0]["id"] == created["id"]


def test_chat_auto_creates_session_and_persists_messages():
    chat_payload = {
        "message": "Qual é a fórmula da velocidade média?",
        "subject": "Física",
    }
    chat_res = client.post("/api/chat", json=chat_payload)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "session_id" in chat_data
    session_id = chat_data["session_id"]

    # Consulta a sessão recém-criada
    session_res = client.get(f"/api/sessions/{session_id}")
    assert session_res.status_code == 200
    session_data = session_res.json()
    assert session_data["subject"] == "Física"
    # O título deve ter sido atualizado com base na pergunta
    assert "velocidade média" in session_data["title"]

    # Deve conter 2 mensagens: pergunta do aluno e resposta do tutor
    messages = session_data["messages"]
    assert len(messages) == 2
    assert messages[0]["sender"] == "user"
    assert "velocidade média" in messages[0]["text"]
    assert messages[1]["sender"] == "tutor"
    assert messages[1]["is_demo"] is True


def test_chat_with_existing_session_appends_messages():
    # 1. Cria a sessão
    create_res = client.post("/api/sessions", json={"subject": "Matemática", "title": "Cálculo 1"})
    session_id = create_res.json()["id"]

    # 2. Primeira pergunta
    client.post(
        "/api/chat",
        json={"session_id": session_id, "message": "O que é derivada?", "subject": "Matemática"},
    )

    # 3. Segunda pergunta
    client.post(
        "/api/chat",
        json={"session_id": session_id, "message": "E o que é integral?", "subject": "Matemática"},
    )

    # Consulta a sessão
    session_res = client.get(f"/api/sessions/{session_id}")
    assert session_res.status_code == 200
    data = session_res.json()
    # 2 perguntas + 2 respostas = 4 mensagens
    assert len(data["messages"]) == 4
    assert data["messages"][0]["text"] == "O que é derivada?"
    assert data["messages"][2]["text"] == "E o que é integral?"


def test_delete_session():
    # Cria sessão
    res = client.post("/api/sessions", json={"subject": "Química", "title": "Estequiometria"})
    session_id = res.json()["id"]

    # Adiciona uma mensagem
    client.post("/api/chat", json={"session_id": session_id, "message": "O que é um mol?", "subject": "Química"})

    # Exclui a sessão
    del_res = client.delete(f"/api/sessions/{session_id}")
    assert del_res.status_code == 200

    # Tenta buscar a sessão excluída
    get_res = client.get(f"/api/sessions/{session_id}")
    assert get_res.status_code == 404


def test_export_session_markdown_and_txt():
    # 1. Cria sessão e adiciona mensagens
    res = client.post("/api/sessions", json={"subject": "Programação", "title": "Recursão e Árvores"})
    session_id = res.json()["id"]

    client.post(
        "/api/chat",
        json={"session_id": session_id, "message": "Como funciona recursão?", "subject": "Programação"},
    )

    # 2. Exporta em Markdown
    md_res = client.get(f"/api/sessions/{session_id}/export?format=md")
    assert md_res.status_code == 200
    assert "text/markdown" in md_res.headers["content-type"]
    assert "Caderno de Estudos: Recursão e Árvores" in md_res.text
    assert "Como funciona recursão?" in md_res.text
    assert "attachment; filename=" in md_res.headers["content-disposition"]

    # 3. Exporta em TXT
    txt_res = client.get(f"/api/sessions/{session_id}/export?format=txt")
    assert txt_res.status_code == 200
    assert "text/plain" in txt_res.headers["content-type"]
    assert "CADERNO DE ESTUDOS: RECURSÃO E ÁRVORES" in txt_res.text
    assert "Como funciona recursão?" in txt_res.text


def test_export_nonexistent_session_returns_404():
    res = client.get("/api/sessions/sess-inexistente-123/export")
    assert res.status_code == 404

