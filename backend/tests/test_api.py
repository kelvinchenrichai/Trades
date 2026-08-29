from fastapi.testclient import TestClient
from pathlib import Path

from app.main import app


client = TestClient(app)
FIXTURE = Path(__file__).parent / "fixtures" / "golden_nq.csv"


def test_health_and_strategy_definitions_have_no_performance():
    assert client.get("/health").json()["mode"] == "RESEARCH"
    strategies = client.get("/strategies").json()
    assert len(strategies) == 3
    assert all(item["status"] == "RESEARCH" and item["edge_health"] == "UNKNOWN" for item in strategies)
    assert all("metrics" not in item and "equity_curve" not in item for item in strategies)


def test_missing_dataset_never_falls_back_to_mock():
    response = client.post("/backtests", json={
        "strategy_id": "NQ-FTM-001", "dataset_id": "missing",
        "costs": {"commission_per_contract": 0, "slippage_ticks": 0, "tick_size": 0.25, "point_value": 20},
    })
    assert response.status_code == 404
    assert "never substitutes mock data" in response.json()["detail"]


def test_upload_run_and_provenance_end_to_end():
    upload = client.post(
        "/datasets/upload",
        data={"dataset_id": "api-golden", "market": "NQ", "timezone": "America/New_York", "contract_type": "INDIVIDUAL"},
        files={"file": ("golden_nq.csv", FIXTURE.read_bytes(), "text/csv")},
    )
    assert upload.status_code == 200
    assert upload.json()["valid"] is True
    response = client.post("/backtests", json={
        "strategy_id": "NQ-FTM-001", "dataset_id": "api-golden",
        "parameters": {"threshold_pct": 0.5},
        "costs": {"commission_per_contract": 2, "slippage_ticks": 1, "tick_size": 0.25, "point_value": 20},
    })
    assert response.status_code == 201, response.text
    result = response.json()
    assert result["data_mode"] == "RESEARCH"
    assert result["metrics"]["total_trades"] == 2
    assert result["provenance"]["dataset_hash"] == upload.json()["dataset"]["dataset_hash"]
    assert client.get(f"/backtests/{result['run_id']}/trades").status_code == 200

