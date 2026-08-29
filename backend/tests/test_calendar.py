from datetime import date, time

from app.services.calendar import SessionCalendarService


def test_new_york_dst_conversion_changes_utc_hour():
    service = SessionCalendarService()
    winter = service.local_to_utc(date(2025, 1, 15), time(9, 30), "America/New_York")
    summer = service.local_to_utc(date(2025, 7, 15), time(9, 30), "America/New_York")
    assert winter.hour == 14
    assert summer.hour == 13


def test_crypto_is_24_7():
    assert SessionCalendarService().session("CRYPTO").always_open

