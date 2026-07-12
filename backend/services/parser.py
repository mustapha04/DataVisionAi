import pandas as pd
import io
import json
import numpy as np
from typing import Any


def parse_file(content: bytes, filename: str) -> tuple[pd.DataFrame, list[dict]]:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "csv"

    if ext == "csv":
        df = pd.read_csv(io.BytesIO(content), skipinitialspace=True)
    elif ext == "tsv":
        df = pd.read_csv(io.BytesIO(content), sep="\t", skipinitialspace=True)
    elif ext == "json":
        data = json.loads(content.decode("utf-8"))
        if isinstance(data, list):
            df = pd.DataFrame(data)
        elif isinstance(data, dict) and "data" in data:
            df = pd.DataFrame(data["data"])
        else:
            df = pd.DataFrame([data])
    elif ext in ("xls", "xlsx"):
        df = pd.read_excel(io.BytesIO(content))
    elif ext == "txt":
        df = pd.read_csv(io.BytesIO(content), sep="|", skipinitialspace=True)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]

    df = _clean_dataframe(df)

    meta = _detect_columns(df)

    return df, meta


def _clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.replace([np.inf, -np.inf], np.nan)
    for col in df.columns:
        if df[col].dtype == object:
            cleaned = df[col].astype(str).str.strip()
            cleaned = cleaned.replace(["nan", "None", "", "null", "undefined"], np.nan)
            df[col] = cleaned

    str_cols = df.select_dtypes(include=["object"]).columns
    for col in str_cols:
        try:
            numeric = pd.to_numeric(df[col], errors="coerce")
            if numeric.notna().sum() > len(df) * 0.6:
                df[col] = numeric
        except (ValueError, TypeError):
            pass

    return df


def _detect_columns(df: pd.DataFrame) -> list[dict]:
    meta = []
    for col in df.columns:
        col_data = df[col]
        null_count = int(col_data.isna().sum())
        total = len(col_data)
        info = {"name": col, "nulls": null_count, "total": total}

        if pd.api.types.is_numeric_dtype(col_data):
            valid = col_data.dropna()
            info["type"] = "numeric"
            info["min"] = float(valid.min()) if len(valid) > 0 else 0
            info["max"] = float(valid.max()) if len(valid) > 0 else 0
            info["mean"] = float(valid.mean()) if len(valid) > 0 else 0
            info["median"] = float(valid.median()) if len(valid) > 0 else 0
            info["sum"] = float(valid.sum()) if len(valid) > 0 else 0
        else:
            valid = col_data.dropna().astype(str)
            info["type"] = "categorical"
            info["unique"] = int(valid.nunique())
            top_val = valid.value_counts().head(1)
            info["top_value"] = str(top_val.index[0]) if len(top_val) > 0 else ""
            info["top_count"] = int(top_val.iloc[0]) if len(top_val) > 0 else 0

        meta.append(info)

    return meta


def compute_data_quality(df: pd.DataFrame) -> float:
    total_cells = df.size
    if total_cells == 0:
        return 100.0
    null_cells = int(df.isna().sum().sum())
    score = max(0, round((1 - null_cells / total_cells) * 100, 1))
    return score


def find_numeric_columns(meta: list[dict]) -> list[str]:
    return [c["name"] for c in meta if c.get("type") == "numeric"]


def find_categorical_columns(meta: list[dict]) -> list[str]:
    return [c["name"] for c in meta if c.get("type") == "categorical"]
