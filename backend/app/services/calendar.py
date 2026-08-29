from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timezone
from zoneinfo import ZoneInfo


@dataclass(frozen=True)
class Session:
    name: str
    timezone: str
    open_time: time
    close_time: time
    always_open: bool = False


class SessionCalendarService:
    """DST-aware session boundary service; holiday providers can replace this base implementation."""

    _sessions = {
        "NQ": Session("NQ RTH", "America/New_York", time(9, 30), time(16, 0)),
        "GC": Session("GC COMEX", "America/New_York", time(8, 20), time(13, 30)),
        "CRYPTO": Session("Crypto 24/7", "UTC", time(0, 0), time(23, 59, 59), True),
    }

    def session(self, market: str) -> Session:
        try:
            return self._sessions[market]
        except KeyError as exc:
            raise ValueError(f"Unsupported market: {market}") from exc

    def local_to_utc(self, day: date, local_time: time, timezone_name: str) -> datetime:
        local = datetime.combine(day, local_time, tzinfo=ZoneInfo(timezone_name))
        return local.astimezone(timezone.utc)

    def bounds_utc(self, market: str, day: date) -> tuple[datetime, datetime]:
        session = self.session(market)
        return (
            self.local_to_utc(day, session.open_time, session.timezone),
            self.local_to_utc(day, session.close_time, session.timezone),
        )

