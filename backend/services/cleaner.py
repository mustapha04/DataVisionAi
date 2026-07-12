import pandas as pd
import numpy as np
from typing import Any


def clean_dataset(df: pd.DataFrame, config: dict | None = None) -> tuple[pd.DataFrame, dict]:
    config = config or {}
    report = {"steps_applied": [], "rows_before": len(df), "rows_after": len(df), "changes": {}}

    if config.get("drop_fully_null", True):
        fully_null = [col for col in df.columns if df[col].isna().all()]
        if fully_null:
            df = df.drop(columns=fully_null)
            report["steps_applied"].append("drop_fully_null")
            report["changes"]["fully_null_columns_dropped"] = fully_null

    if config.get("deduplicate", False):
        subset = config.get("deduplicate_subset")
        before = len(df)
        df = deduplicate(df, subset)
        removed = before - len(df)
        if removed:
            report["steps_applied"].append("deduplicate")
            report["changes"]["duplicates_removed"] = removed

    fill_strategy = config.get("fill_missing", "auto")
    if fill_strategy and fill_strategy != "none":
        before_nulls = int(df.isna().sum().sum())
        df = fill_missing(df, fill_strategy)
        after_nulls = int(df.isna().sum().sum())
        filled = before_nulls - after_nulls
        if filled:
            report["steps_applied"].append(f"fill_missing ({fill_strategy})")
            report["changes"]["nulls_filled"] = filled

    outlier_method = config.get("remove_outliers", "none")
    if outlier_method and outlier_method != "none":
        threshold = float(config.get("outlier_threshold", 1.5))
        before = len(df)
        df = remove_outliers(df, outlier_method, threshold)
        removed = before - len(df)
        if removed:
            report["steps_applied"].append(f"remove_outliers ({outlier_method})")
            report["changes"]["outliers_removed"] = removed
            report["rows_after"] = len(df)

    if config.get("drop_columns"):
        cols = [c for c in config["drop_columns"] if c in df.columns]
        if cols:
            df = df.drop(columns=cols)
            report["steps_applied"].append("drop_columns")
            report["changes"]["columns_dropped"] = cols

    if config.get("normalize_strings", False):
        before = df.select_dtypes(include=["object"]).columns.tolist()
        df = normalize_strings(df)
        if before:
            report["steps_applied"].append("normalize_strings")
            report["changes"]["string_cols_normalized"] = before

    return df, report


def deduplicate(df: pd.DataFrame, subset: list[str] | None = None) -> pd.DataFrame:
    return df.drop_duplicates(subset=subset)


def fill_missing(df: pd.DataFrame, strategy: str = "auto") -> pd.DataFrame:
    df = df.copy()
    for col in df.columns:
        null_mask = df[col].isna()
        if not null_mask.any():
            continue

        if null_mask.all():
            continue

        if pd.api.types.is_numeric_dtype(df[col]):
            valid = df[col].dropna()
            if len(valid) == 0:
                continue
            if strategy == "auto" or strategy == "median":
                fill_val = valid.median()
            elif strategy == "mean":
                fill_val = valid.mean()
            elif strategy == "mode":
                fill_val = valid.mode().iloc[0] if not valid.mode().empty else 0
            elif strategy == "zero":
                fill_val = 0
            elif strategy == "drop":
                df = df.dropna(subset=[col])
                continue
            else:
                fill_val = valid.median()
            df[col] = df[col].fillna(fill_val)
        else:
            if strategy == "drop":
                df = df.dropna(subset=[col])
                continue
            valid = df[col].dropna()
            fill_val = valid.mode().iloc[0] if not valid.mode().empty else "Unknown"
            df[col] = df[col].fillna(fill_val)

    return df


def remove_outliers(df: pd.DataFrame, method: str = "iqr", threshold: float = 1.5) -> pd.DataFrame:
    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns

    for col in numeric_cols:
        valid = df[col].dropna()
        if len(valid) < 4:
            continue

        if method == "iqr":
            q1 = valid.quantile(0.25)
            q3 = valid.quantile(0.75)
            iqr = q3 - q1
            if iqr == 0:
                continue
            lower = q1 - threshold * iqr
            upper = q3 + threshold * iqr
            df = df[(df[col].isna()) | ((df[col] >= lower) & (df[col] <= upper))]

        elif method == "zscore":
            mean = valid.mean()
            std = valid.std()
            if std == 0:
                continue
            z_scores = (df[col] - mean) / std
            df = df[z_scores.abs() <= threshold]

    return df


def normalize_strings(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    str_cols = df.select_dtypes(include=["object"]).columns
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip().str.replace(r"\s+", " ", regex=True)
    return df


def build_cleaning_config(meta: list[dict]) -> dict:
    null_cols = [c for c in meta if c.get("nulls", 0) > 0]
    numeric_cols = [c["name"] for c in meta if c.get("type") == "numeric"]

    suggestions = {}
    if null_cols:
        suggestions["fill_missing"] = "auto"
    if len(numeric_cols) > 0:
        suggestions["remove_outliers"] = "iqr"
    suggestions["deduplicate"] = True
    suggestions["normalize_strings"] = True

    fully_null_cols = [c for c in meta if c.get("nulls", 0) == c.get("total", 0) and c.get("total", 0) > 0]

    return {
        "suggested_config": suggestions,
        "columns_with_nulls": [{"name": c["name"], "nulls": c["nulls"], "total": c["total"], "type": c.get("type")} for c in null_cols],
        "fully_null_columns": [c["name"] for c in fully_null_cols],
        "numeric_columns": numeric_cols,
        "total_nulls": sum(c.get("nulls", 0) for c in meta),
        "total_cells": sum(c.get("total", 0) for c in meta),
    }
