import pandas as pd
import numpy as np
from typing import Any


def compute_chart_data(df: pd.DataFrame, meta: list[dict]) -> dict:
    num_cols = [c["name"] for c in meta if c.get("type") == "numeric"]
    cat_cols = [c["name"] for c in meta if c.get("type") == "categorical"]

    charts = {}

    revenue_cols = _match_columns(num_cols, ["revenue", "sale", "gross", "earnings"])
    units_cols = _match_columns(num_cols, ["unit", "sold", "transaction", "qty"])
    downloads_cols = _match_columns(num_cols, ["download", "install"])
    price_cols = _match_columns(num_cols, ["price", "cost", "fee"])
    date_cols = _match_columns(num_cols, ["date", "month", "year", "day"])
    all_date_cols = _match_columns(list(df.columns), ["date", "month", "year", "day", "timestamp"]) if not date_cols else date_cols

    revenue_col = revenue_cols[0] if revenue_cols else (num_cols[0] if num_cols else None)
    units_col = units_cols[0] if units_cols else None
    downloads_col = downloads_cols[0] if downloads_cols else None
    price_col = price_cols[0] if price_cols else None

    if cat_cols and revenue_col:
        charts["revenue_by_category"] = _build_category_chart(df, cat_cols[0], revenue_col)

    if price_col and units_col and revenue_col:
        charts["price_performance"] = _build_price_chart(df, price_col, units_col, revenue_col)
    elif price_col and revenue_col:
        charts["price_performance"] = _build_price_chart(df, price_col, None, revenue_col)

    if revenue_col and all_date_cols:
        charts["daily_trend"] = _build_trend_chart(df, all_date_cols[0], revenue_col)
    elif revenue_col:
        charts["daily_trend"] = _build_index_trend(df, revenue_col)

    if cat_cols:
        charts["category_distribution"] = _build_distribution_chart(df, cat_cols[0])

    if num_cols and len(num_cols) >= 2:
        charts["correlation"] = _build_correlation_data(df, num_cols[:4])

    return charts


def _build_category_chart(df: pd.DataFrame, cat_col: str, val_col: str) -> dict:
    grouped = df.groupby(cat_col)[val_col].sum().sort_values(ascending=False).head(10)
    labels = [str(k) for k in grouped.index]
    data = [round(float(v), 2) for v in grouped.values]
    colors = ["#00d4aa", "#3b82f6", "#f59e0b", "#ef4444", "#a78bfa",
              "#34d399", "#f97316", "#06b6d4", "#ec4899", "#8b5cf6"]
    return {
        "chart_type": "bar",
        "title": f"Revenue by {cat_col.title()} (USD)",
        "labels": labels,
        "datasets": [{
            "label": "Revenue",
            "data": data,
            "backgroundColor": [c + "33" for c in colors[:len(data)]],
            "borderColor": [c for c in colors[:len(data)]],
            "borderWidth": 2,
            "borderRadius": 4,
        }],
        "legends": [{"label": labels[i], "color": colors[i % len(colors)]} for i in range(len(labels))],
    }


def _build_price_chart(df: pd.DataFrame, price_col: str, units_col: str | None, revenue_col: str) -> dict:
    price_labels = ["$0.99", "$1.49", "$1.99", "$2.99", "$4.99", "$6.99", "$9.99", "$14.99", "$19.99"]
    price_bins = [0, 1.24, 1.74, 2.49, 3.99, 5.99, 8.49, 12.49, 17.49, 999]

    df_valid = df.dropna(subset=[price_col])
    df_valid["price_bin"] = pd.cut(df_valid[price_col], bins=price_bins, labels=price_labels, right=False)

    units_data = []
    revenue_data = []
    for label in price_labels:
        subset = df_valid[df_valid["price_bin"] == label]
        if units_col:
            units_data.append(int(subset[units_col].sum()) if len(subset) > 0 else 0)
        revenue_data.append(round(float(subset[revenue_col].sum()), 2) if len(subset) > 0 else 0)

    if not units_col:
        units_data = [0] * len(price_labels)

    datasets = []
    if units_col:
        datasets.append({
            "label": "Units Sold",
            "data": units_data,
            "backgroundColor": "#3b82f6" + "55",
            "borderColor": "#3b82f6",
            "borderWidth": 2,
            "borderRadius": 4,
            "yAxisID": "y",
        })
    datasets.append({
        "label": "Revenue ($)",
        "data": revenue_data,
        "backgroundColor": "#00d4aa" + "55",
        "borderColor": "#00d4aa",
        "borderWidth": 2,
        "borderRadius": 4,
        "yAxisID": units_col and "y1" or "y",
    })

    return {
        "chart_type": "bar",
        "title": "Price Point Performance (USD)",
        "labels": price_labels,
        "datasets": datasets,
        "legends": [
            {"label": "Units Sold", "color": "#3b82f6"},
            {"label": "Revenue Generated", "color": "#00d4aa"},
        ],
    }


def _build_trend_chart(df: pd.DataFrame, date_col: str, val_col: str) -> dict:
    try:
        df_date = df.copy()
        df_date[date_col] = pd.to_datetime(df_date[date_col], errors="coerce")
        df_date = df_date.dropna(subset=[date_col])
        trend = df_date.set_index(date_col).resample("D")[val_col].sum()
        labels = [d.strftime("%b %d") for d in trend.index]
        data = [round(float(v), 2) for v in trend.values]
    except (ValueError, TypeError):
        return _build_index_trend(df, val_col)

    return {
        "chart_type": "line",
        "title": f"{val_col.title()} Trend",
        "labels": labels,
        "datasets": [{
            "label": val_col,
            "data": data,
            "borderColor": "#3b82f6",
            "backgroundColor": "rgba(59, 130, 246, 0.1)",
            "borderWidth": 2.5,
            "fill": True,
            "tension": 0.4,
            "pointRadius": 3,
            "pointBackgroundColor": "#3b82f6",
        }],
        "legends": [],
    }


def _build_index_trend(df: pd.DataFrame, val_col: str) -> dict:
    vals = df[val_col].dropna().values[:50]
    labels = [f"#{i+1}" for i in range(len(vals))]
    data = [round(float(v), 2) for v in vals]
    return {
        "chart_type": "line",
        "title": f"{val_col.title()} (Row Order)",
        "labels": labels,
        "datasets": [{
            "label": val_col,
            "data": data,
            "borderColor": "#3b82f6",
            "backgroundColor": "rgba(59, 130, 246, 0.1)",
            "borderWidth": 2,
            "fill": True,
            "tension": 0.3,
            "pointRadius": 2,
        }],
        "legends": [],
    }


def _build_distribution_chart(df: pd.DataFrame, cat_col: str) -> dict:
    freq = df[cat_col].value_counts().head(8)
    labels = [str(k) for k in freq.index]
    data = [int(v) for v in freq.values]
    colors = ["#00d4aa", "#3b82f6", "#f59e0b", "#ef4444", "#a78bfa",
              "#34d399", "#f97316", "#06b6d4"]
    return {
        "chart_type": "doughnut",
        "title": f"{cat_col.title()} Distribution",
        "labels": labels,
        "datasets": [{
            "label": "Count",
            "data": data,
            "backgroundColor": [c + "cc" for c in colors[:len(data)]],
            "borderColor": colors[:len(data)],
            "borderWidth": 1,
        }],
        "legends": [{"label": labels[i], "color": colors[i % len(colors)]} for i in range(len(labels))],
    }


def _build_correlation_data(df: pd.DataFrame, num_cols: list[str]) -> dict:
    data = {}
    for col in num_cols:
        vals = df[col].dropna()
        if len(vals) > 0:
            data[col] = {
                "mean": round(float(vals.mean()), 2),
                "min": round(float(vals.min()), 2),
                "max": round(float(vals.max()), 2),
                "sum": round(float(vals.sum()), 2),
            }
    return {
        "chart_type": "stats",
        "title": "Numeric Column Overview",
        "labels": list(data.keys()),
        "datasets": [{"data": data}],
        "legends": [],
    }


def compute_products(df: pd.DataFrame, meta: list[dict]) -> list[dict]:
    name_cols = _match_columns(list(df.columns), ["app", "product", "name", "title", "item"])
    cat_cols = [c["name"] for c in meta if c.get("type") == "categorical"]
    num_cols = [c["name"] for c in meta if c.get("type") == "numeric"]

    revenue_col = _match_columns(num_cols, ["revenue", "sale", "gross", "earnings"])
    earnings_col = _match_columns(num_cols, ["earning", "profit", "net"])
    units_col = _match_columns(num_cols, ["unit", "sold", "transaction"])
    downloads_col = _match_columns(num_cols, ["download", "install"])
    refund_col = _match_columns(num_cols, ["refund", "return"])
    rating_col = _match_columns(num_cols, ["rating", "score", "star"])
    price_col = _match_columns(num_cols, ["price", "cost", "fee"])

    products = []
    for idx, row in df.iterrows():
        product = {
            "product_name": str(row[name_cols[0]]) if name_cols else f"Product {idx+1}",
            "category": str(row[cat_cols[0]]) if cat_cols else "Uncategorized",
            "price": float(row[price_col[0]]) if price_col else 0,
            "units_sold": int(row[units_col[0]]) if units_col else 0,
            "revenue": float(row[revenue_col[0]]) if revenue_col else 0,
            "earnings": float(row[earnings_col[0]]) if earnings_col else 0,
            "downloads": int(row[downloads_col[0]]) if downloads_col else 0,
            "refunds": int(row[refund_col[0]]) if refund_col else 0,
            "rating": float(row[rating_col[0]]) if rating_col else None,
        }
        products.append(product)

    products.sort(key=lambda p: p["revenue"], reverse=True)
    return products[:50]


def compute_opportunities(df: pd.DataFrame, meta: list[dict]) -> list[dict]:
    downloads_cols = _match_columns(list(df.columns), ["download", "install"])
    revenue_cols = _match_columns(list(df.columns), ["revenue", "sale", "gross"])
    name_cols = _match_columns(list(df.columns), ["app", "product", "name", "title"])
    units_cols = _match_columns(list(df.columns), ["unit", "sold", "transaction"])

    if not downloads_cols or not name_cols:
        return []

    opportunities = []
    for idx, row in df.iterrows():
        downloads = row[downloads_cols[0]]
        revenue = row[revenue_cols[0]] if revenue_cols else 0
        units = row[units_cols[0]] if units_cols else 0

        try:
            downloads = int(downloads) if pd.notna(downloads) else 0
            revenue = float(revenue) if pd.notna(revenue) else 0
            units = int(units) if pd.notna(units) else 0
        except (ValueError, TypeError):
            continue

        free_downloads = max(0, downloads - units)
        potential_revenue = free_downloads * 0.99

        if free_downloads > 0:
            opportunities.append({
                "app_name": str(row[name_cols[0]]),
                "downloads": free_downloads,
                "potential_revenue": round(potential_revenue, 2),
                "color": "#ef4444" if free_downloads >= 15 else "#f59e0b" if free_downloads >= 5 else "#00d4aa",
            })

    opportunities.sort(key=lambda o: o["downloads"], reverse=True)
    return opportunities[:10]


def _match_columns(cols: list[str], keywords: list[str]) -> list[str]:
    results = []
    for col in cols:
        col_lower = col.lower().replace("_", " ").replace("-", " ")
        for kw in keywords:
            if kw in col_lower:
                results.append(col)
                break
    return results
