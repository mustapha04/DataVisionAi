"""
Validation utilities for PredictIQ.

Provides input validation helpers for column names,
data types, and API request payloads.
"""


def is_valid_column_name(name: str) -> bool:
    """Check if a string is a valid column name (no special chars)."""
    ...


def validate_numeric_range(value: float, min_v: float, max_v: float) -> bool:
    """Check if a numeric value falls within the allowed range."""
    ...


def sanitize_filename(name: str) -> str:
    """Remove unsafe characters from a filename."""
    ...
