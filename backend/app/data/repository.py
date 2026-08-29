from __future__ import annotations

from threading import RLock

from app.data.loader import LoadedDataset


class DatasetRepository:
    def __init__(self) -> None:
        self._items: dict[str, LoadedDataset] = {}
        self._lock = RLock()

    def put(self, item: LoadedDataset) -> None:
        if not item.report.valid or item.report.dataset is None:
            raise ValueError("Only validated datasets can enter the research repository")
        with self._lock:
            self._items[item.report.dataset.dataset_id] = item

    def get(self, dataset_id: str) -> LoadedDataset | None:
        with self._lock:
            return self._items.get(dataset_id)

    def list(self) -> list[LoadedDataset]:
        with self._lock:
            return list(self._items.values())


datasets = DatasetRepository()

