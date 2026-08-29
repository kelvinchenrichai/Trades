from __future__ import annotations

import hashlib
from dataclasses import dataclass
from io import BytesIO
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import pandas as pd

from app.models import (
    ContractType,
    DataQualityIssue,
    DataQualityReport,
    DatasetMetadata,
    Market,
)

REQUIRED_COLUMNS = {"timestamp", "open", "high", "low", "close", "volume", "symbol"}


@dataclass(frozen=True)
class LoadedDataset:
    frame: pd.DataFrame
    report: DataQualityReport


def _rows(mask: pd.Series) -> list[int]:
    return [int(i) + 2 for i in mask[mask].index[:25]]


def validate_ohlcv(frame: pd.DataFrame) -> list[DataQualityIssue]:
    issues: list[DataQualityIssue] = []
    missing = REQUIRED_COLUMNS - set(frame.columns)
    if missing:
        return [DataQualityIssue(code="MISSING_COLUMNS", severity="ERROR", message=f"Missing required columns: {sorted(missing)}")]

    if frame[list(REQUIRED_COLUMNS - {"timestamp", "symbol"})].isna().any(axis=1).any():
        mask = frame[list(REQUIRED_COLUMNS - {"timestamp", "symbol"})].isna().any(axis=1)
        issues.append(DataQualityIssue(code="MISSING_OHLCV", severity="ERROR", message="OHLCV values may not be missing", rows=_rows(mask)))
    if frame["timestamp"].isna().any():
        mask = frame["timestamp"].isna()
        issues.append(DataQualityIssue(code="INVALID_TIMESTAMP", severity="ERROR", message="Timestamps must be parseable", rows=_rows(mask)))
    if not frame["timestamp"].is_monotonic_increasing:
        issues.append(DataQualityIssue(code="UNSORTED_TIMESTAMPS", severity="ERROR", message="Rows must be ordered by timestamp; input was not silently sorted"))
    duplicates = frame.duplicated(subset=["timestamp", "symbol"], keep=False)
    if duplicates.any():
        issues.append(DataQualityIssue(code="DUPLICATE_BARS", severity="ERROR", message="Duplicate symbol/timestamp bars detected", rows=_rows(duplicates)))
    invalid_ohlc = (
        (frame["high"] < frame[["open", "close", "low"]].max(axis=1))
        | (frame["low"] > frame[["open", "close", "high"]].min(axis=1))
    )
    if invalid_ohlc.any():
        issues.append(DataQualityIssue(code="INVALID_OHLC", severity="ERROR", message="High/low is inconsistent with OHLC values", rows=_rows(invalid_ohlc)))
    negative_volume = frame["volume"] < 0
    if negative_volume.any():
        issues.append(DataQualityIssue(code="NEGATIVE_VOLUME", severity="ERROR", message="Volume cannot be negative", rows=_rows(negative_volume)))

    clean_times = frame["timestamp"].dropna()
    if len(clean_times) >= 3:
        diffs = clean_times.sort_values().diff().dropna()
        typical = diffs.mode().iloc[0]
        gaps = diffs > typical * 1.5
        if gaps.any():
            issues.append(DataQualityIssue(code="MISSING_BARS", severity="WARNING", message=f"Detected {int(gaps.sum())} gaps larger than expected interval {typical}"))
    return issues


def load_ohlcv_csv(
    raw: bytes,
    *,
    dataset_id: str,
    market: Market,
    timezone: str,
    contract_type: ContractType = ContractType.INDIVIDUAL,
    contract_symbol: str | None = None,
    roll_method: str | None = None,
    adjustment_method: str | None = None,
) -> LoadedDataset:
    try:
        source_tz = ZoneInfo(timezone)
    except ZoneInfoNotFoundError as exc:
        raise ValueError(f"Unknown IANA timezone: {timezone}") from exc

    frame = pd.read_csv(BytesIO(raw))
    frame.columns = [str(c).strip().lower() for c in frame.columns]
    missing = REQUIRED_COLUMNS - set(frame.columns)
    if missing:
        report = DataQualityReport(valid=False, row_count=len(frame), issues=[DataQualityIssue(code="MISSING_COLUMNS", severity="ERROR", message=f"Missing required columns: {sorted(missing)}")])
        return LoadedDataset(frame=frame, report=report)

    for col in ("open", "high", "low", "close", "volume"):
        frame[col] = pd.to_numeric(frame[col], errors="coerce")
    parsed = pd.to_datetime(frame["timestamp"], errors="coerce")
    if parsed.dt.tz is None:
        try:
            parsed = parsed.dt.tz_localize(source_tz, ambiguous="raise", nonexistent="raise")
        except (ValueError, TypeError) as exc:
            raise ValueError(f"Ambiguous or nonexistent local timestamp: {exc}") from exc
    frame["timestamp"] = parsed.dt.tz_convert("UTC")

    issues = validate_ohlcv(frame)
    has_errors = any(issue.severity == "ERROR" for issue in issues)
    metadata = None
    if not has_errors and len(frame):
        metadata = DatasetMetadata(
            dataset_id=dataset_id,
            dataset_hash=hashlib.sha256(raw).hexdigest(),
            symbol=str(frame["symbol"].iloc[0]),
            market=market,
            timezone=timezone,
            rows=len(frame),
            data_start=frame["timestamp"].iloc[0].to_pydatetime(),
            data_end=frame["timestamp"].iloc[-1].to_pydatetime(),
            contract_type=contract_type,
            contract_symbol=contract_symbol,
            roll_method=roll_method,
            adjustment_method=adjustment_method,
        )
    return LoadedDataset(frame=frame, report=DataQualityReport(valid=not has_errors, row_count=len(frame), issues=issues, dataset=metadata))

