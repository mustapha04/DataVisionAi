"""
Pytest conftest for PredictIQ backend.

Provides shared fixtures for test sessions,
including a test client and mock database.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_csv():
    return b"product,revenue,units\nWidget A,100,10\nWidget B,200,20"
