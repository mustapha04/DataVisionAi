"""
Date/time utilities for PredictIQ.

Helpers for date parsing, formatting, range generation,
and timezone handling.
"""

from datetime import datetime, timedelta, date


def parse_date(date_str: str, formats: list[str] | None = None) -> datetime | None:
    """Try to parse a date string against common formats."""
    ...


def format_date(dt: datetime, fmt: str = "%Y-%m-%d") -> str:
    """Format a datetime as a string."""
    ...


def date_range(start: date, end: date) -> list[date]:
    """Generate a list of dates between start and end (inclusive)."""
    ...
