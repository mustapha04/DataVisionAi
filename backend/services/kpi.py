import pandas as pd
import numpy as np
from typing import Any


def compute_kpis(df: pd.DataFrame, meta: list[dict]) -> list[dict]:
    num_cols = [c["name"] for c in meta if c.get("type") == "numeric"]
    cat_cols = [c["name"] for c in meta if c.get("type") == "categorical"]

    kpis = []
    revenue_cols = _find_revenue_columns(df, num_cols)
    earnings_cols = _find_earnings_columns(df, num_cols)
    units_cols = _find_units_columns(df, num_cols)
    downloads_cols = _find_downloads_columns(df, num_cols)
    refund_cols = _find_refund_columns(df, num_cols)
    price_cols = _find_price_columns(df, num_cols)
    rating_cols = _find_rating_columns(df, num_cols)

    if revenue_cols:
        total_rev = df[revenue_cols[0]].sum()
        kpis.append({
            "label": "Total Revenue",
            "value": f"${total_rev:,.2f}",
            "formatted_value": f"${total_rev:,.2f}",
            "sub": f"{len(df)} records",
            "delta": _calc_delta(df, revenue_cols[0]),
            "delta_type": "up" if total_rev > 0 else "neutral",
        })

    if earnings_cols:
        total_earn = df[earnings_cols[0]].sum()
        margin = (total_earn / total_rev * 100) if revenue_cols and total_rev > 0 else 0
        kpis.append({
            "label": "Estimated Earnings",
            "value": f"${total_earn:,.2f}",
            "formatted_value": f"${total_earn:,.2f}",
            "sub": f"{margin:.1f}% margin" if margin else "",
            "delta": f"${total_earn:,.0f} total",
            "delta_type": "up" if total_earn > 0 else "neutral",
        })

    if units_cols:
        total_units = int(df[units_cols[0]].sum())
        kpis.append({
            "label": "Total Transactions",
            "value": str(total_units),
            "formatted_value": str(total_units),
            "sub": _get_refund_text(df, refund_cols, total_units),
            "delta": f"{total_units} total",
            "delta_type": "neutral",
        })

    if downloads_cols:
        total_dl = int(df[downloads_cols[0]].sum())
        free_pct = _calc_free_pct(df, units_cols, downloads_cols, total_dl)
        kpis.append({
            "label": "Free Downloads",
            "value": str(total_dl),
            "formatted_value": str(total_dl),
            "sub": f"{free_pct:.0f}% of all installs" if free_pct else "",
            "delta": f"${total_dl * 0.99:,.0f} opportunity",
            "delta_type": "up" if total_dl > 0 else "neutral",
        })

    if revenue_cols and units_cols:
        avg_price = total_rev / df[units_cols[0]].sum() if df[units_cols[0]].sum() > 0 else 0
        kpis.append({
            "label": "Average Price",
            "value": f"${avg_price:.2f}",
            "formatted_value": f"${avg_price:.2f}",
            "sub": f"across {len(df)} products",
            "delta": "per transaction",
            "delta_type": "neutral",
        })

    if rating_cols:
        avg_rating = df[rating_cols[0]].mean()
        kpis.append({
            "label": "Average Rating",
            "value": f"{avg_rating:.1f}",
            "formatted_value": f"{avg_rating:.1f}",
            "sub": "out of 5.0",
            "delta": "product quality",
            "delta_type": "up" if avg_rating >= 4 else "down" if avg_rating < 3 else "neutral",
        })

    return kpis[:6]


def _calc_delta(df: pd.DataFrame, col: str) -> str:
    vals = df[col].dropna().values
    if len(vals) < 4:
        return ""
    half = len(vals) // 2
    first_half = vals[:half].sum()
    second_half = vals[half:2*half].sum()
    if first_half == 0:
        return ""
    pct = ((second_half - first_half) / first_half) * 100
    sign = "+" if pct >= 0 else ""
    return f"{sign}{pct:.1f}% vs prior"


def _get_refund_text(df: pd.DataFrame, refund_cols: list[str], total_units: int) -> str:
    if refund_cols and total_units > 0:
        total_refunds = int(df[refund_cols[0]].sum())
        rate = (total_refunds / total_units) * 100
        return f"{total_refunds} refunds ({rate:.1f}%)"
    return ""


def _calc_free_pct(df: pd.DataFrame, units_cols: list[str], downloads_cols: list[str], total_dl: int) -> float:
    if units_cols and downloads_cols and total_dl > 0:
        total_units = int(df[units_cols[0]].sum())
        paid = total_units
        free = total_dl - paid
        return (free / total_dl) * 100 if total_dl > 0 else 0
    return 0


def _find_revenue_columns(df: pd.DataFrame, num_cols: list[str]) -> list[str]:
    keywords = ["revenue", "sale", "gross", "income", "turnover"]
    return _match_columns(num_cols, keywords)


def _find_earnings_columns(df: pd.DataFrame, num_cols: list[str]) -> list[str]:
    keywords = ["earning", "profit", "net", "margin", "royalty"]
    return _match_columns(num_cols, keywords)


def _find_units_columns(df: pd.DataFrame, num_cols: list[str]) -> list[str]:
    keywords = ["unit", "sold", "transaction", "quantity", "qty", "volume"]
    return _match_columns(num_cols, keywords)


def _find_downloads_columns(df: pd.DataFrame, num_cols: list[str]) -> list[str]:
    keywords = ["download", "install", "acquisition"]
    return _match_columns(num_cols, keywords)


def _find_refund_columns(df: pd.DataFrame, num_cols: list[str]) -> list[str]:
    keywords = ["refund", "return", "chargeback", "cancel"]
    return _match_columns(num_cols, keywords)


def _find_price_columns(df: pd.DataFrame, num_cols: list[str]) -> list[str]:
    keywords = ["price", "cost", "fee", "amount"]
    return _match_columns(num_cols, keywords)


def _find_rating_columns(df: pd.DataFrame, num_cols: list[str]) -> list[str]:
    keywords = ["rating", "score", "review", "star"]
    return _match_columns(num_cols, keywords)


def _match_columns(cols: list[str], keywords: list[str]) -> list[str]:
    results = []
    for col in cols:
        col_lower = col.lower().replace("_", " ").replace("-", " ")
        for kw in keywords:
            if kw in col_lower:
                results.append(col)
                break
    if not results and cols:
        return cols[:1]
    return results
