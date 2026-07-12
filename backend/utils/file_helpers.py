"""
File helper utilities for PredictIQ.

Handles file size validation, format detection,
encoding detection, and temporary file management.
"""


def validate_file_size(size_bytes: int, max_mb: int = 50) -> bool:
    """Check if file size is within the allowed limit."""
    ...


def detect_encoding(file_path: str) -> str:
    """Detect the character encoding of a file."""
    ...


def get_file_extension(filename: str) -> str:
    """Return the lowercase file extension."""
    ...


def save_temp_file(content: bytes, suffix: str = ".csv") -> str:
    """Save content to a temporary file and return the path."""
    ...
