from pathlib import Path

import pandas as pd

from app.data.loader import load_ohlcv_csv
from app.models import Market

FIXTURE = Path(__file__).parent / "fixtures" / "golden_nq.csv"


def test_csv_parsing_and_timezone_conversion():
    loaded = load_ohlcv_csv(FIXTURE.read_bytes(), dataset_id="golden", market=Market.NQ, timezone="America/New_York")
    assert loaded.report.valid
    assert str(loaded.frame["timestamp"].dt.tz) == "UTC"
    assert loaded.frame.iloc[0]["timestamp"].hour == 14
    assert loaded.report.dataset.dataset_hash


def test_unsorted_and_duplicate_detection():
    raw = b"timestamp,open,high,low,close,volume,symbol\n2025-01-02 10:00,1,2,0,1,1,NQ\n2025-01-02 09:00,1,2,0,1,1,NQ\n2025-01-02 09:00,1,2,0,1,1,NQ\n"
    loaded = load_ohlcv_csv(raw, dataset_id="bad", market=Market.NQ, timezone="UTC")
    codes = {issue.code for issue in loaded.report.issues}
    assert not loaded.report.valid
    assert {"UNSORTED_TIMESTAMPS", "DUPLICATE_BARS"} <= codes


def test_invalid_ohlc_and_negative_volume():
    raw = b"timestamp,open,high,low,close,volume,symbol\n2025-01-02T00:00:00Z,10,9,8,10,-1,NQ\n"
    loaded = load_ohlcv_csv(raw, dataset_id="bad", market=Market.NQ, timezone="UTC")
    assert {"INVALID_OHLC", "NEGATIVE_VOLUME"} <= {issue.code for issue in loaded.report.issues}


def test_loader_does_not_silently_sort():
    loaded = load_ohlcv_csv(FIXTURE.read_bytes(), dataset_id="golden", market=Market.NQ, timezone="America/New_York")
    reversed_frame = loaded.frame.iloc[::-1].reset_index(drop=True)
    assert not reversed_frame["timestamp"].is_monotonic_increasing

