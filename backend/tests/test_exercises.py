from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_generate_exercise_programming_intermediate():
    payload = {
        "subject": "Programação",
        "difficulty": "Intermediário",
    }
    response = client.post("/api/exercises/generate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "id" in data
    assert data["subject"] == "Programação"
    assert data["difficulty"] == "Intermediário"
    assert "question" in data
    assert isinstance(data["options"], list)
    assert len(data["options"]) >= 2
    assert 0 <= data["correct_option_index"] < len(data["options"])
    assert "explanation" in data


def test_generate_exercise_math_and_physics():
    for subject in ["Matemática", "Física", "Engenharia e Hardware"]:
        response = client.post(
            "/api/exercises/generate",
            json={"subject": subject, "difficulty": "Iniciante"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["subject"] == subject
        assert len(data["options"]) >= 2


def test_evaluate_exercise_correct_answer():
    eval_payload = {
        "exercise_id": "test-ex-1",
        "subject": "Programação",
        "selected_index": 2,
        "correct_index": 2,
        "explanation": "Explicação passo a passo da resolução.",
    }
    response = client.post("/api/exercises/evaluate", json=eval_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_correct"] is True
    assert data["score_points"] == 10
    assert "Parabéns" in data["feedback"] or "Excelente" in data["feedback"]
    assert data["explanation"] == "Explicação passo a passo da resolução."


def test_evaluate_exercise_incorrect_answer():
    eval_payload = {
        "exercise_id": "test-ex-2",
        "subject": "Física",
        "selected_index": 0,
        "correct_index": 1,
        "explanation": "A resposta correta era a alternativa 1.",
    }
    response = client.post("/api/exercises/evaluate", json=eval_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_correct"] is False
    assert data["score_points"] == 0
    assert "incorreta" in data["feedback"]
