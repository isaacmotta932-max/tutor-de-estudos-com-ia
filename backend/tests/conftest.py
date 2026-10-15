import pytest
from app.db import database


@pytest.fixture(autouse=True)
def setup_test_database(tmp_path, monkeypatch):
    """Garante que todos os testes executem com um banco de dados SQLite isolado e inicializado."""
    test_db = tmp_path / "test_tutor.db"
    monkeypatch.setattr(database.settings, "DATABASE_PATH", test_db)
    database.init_db(test_db)
    yield
