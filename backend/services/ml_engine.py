import pandas as pd
import numpy as np
from typing import Optional
from sklearn.linear_model import LinearRegression

_DATE_KEYWORDS = [
    "date", "time", "timestamp", "day", "month", "year",
    "created", "updated", "transaction", "order", "sale",
    "period", "ds", "datetime", "released", "submitted",
]


def detect_columns(df: pd.DataFrame, prefer_date: Optional[str] = None, prefer_value: Optional[str] = None) -> dict:
    candidates = {"date_cols": [], "numeric_cols": []}

    for col in df.columns:
        cl = col.lower().replace("_", " ").replace("-", " ")
        if col == prefer_date:
            candidates["date_cols"].insert(0, col)
            continue
        try:
            pd.to_datetime(df[col], errors="raise")
            candidates["date_cols"].append(col)
            continue
        except (ValueError, TypeError):
            pass
        if any(kw in cl for kw in _DATE_KEYWORDS):
            candidates["date_cols"].append(col)

    for col in df.columns:
        if col == prefer_value:
            candidates["numeric_cols"].insert(0, col)
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            candidates["numeric_cols"].append(col)

    date_col = prefer_date or (candidates["date_cols"][0] if candidates["date_cols"] else None)
    value_col = prefer_value or (candidates["numeric_cols"][0] if candidates["numeric_cols"] else None)

    return {
        "date_col": date_col,
        "value_col": value_col,
        "date_cols": candidates["date_cols"],
        "numeric_cols": candidates["numeric_cols"],
    }


def prepare_data(df: pd.DataFrame, date_col: str, value_col: str) -> pd.DataFrame:
    data = df[[date_col, value_col]].copy()
    data = data.dropna(subset=[value_col])
    data[date_col] = pd.to_datetime(data[date_col], errors="coerce")
    data = data.dropna(subset=[date_col])
    data = data.sort_values(date_col).reset_index(drop=True)
    return data.rename(columns={date_col: "ds", value_col: "y"})


def _detect_seasonality(ds: pd.Series) -> int:
    if len(ds) < 4:
        return 1
    day_diffs = ds.diff().dropna().dt.total_seconds().value_counts()
    if day_diffs.empty:
        return 1
    most_common = day_diffs.index[0]
    freq_seconds = abs(most_common)
    if freq_seconds < 3600 * 12:
        return 24
    elif freq_seconds < 3600 * 48:
        return 7
    elif freq_seconds < 3600 * 24 * 15:
        return 30
    else:
        return 365


def train_forecast(
    df: pd.DataFrame,
    date_col: str,
    value_col: str,
    periods: int = 30,
    seasonality: str = "auto",
    include_history: bool = True,
) -> dict:
    prepared = prepare_data(df, date_col, value_col)
    if len(prepared) < 4:
        return {"error": f"Need at least 4 rows with valid dates and values, got {len(prepared)}"}

    ds = prepared["ds"]
    y = prepared["y"].values
    n = len(y)

    period = _detect_seasonality(ds)
    if seasonality == "none":
        period = 1
    elif seasonality == "weekly":
        period = 7
    elif seasonality == "monthly":
        period = 30

    t = np.arange(n)

    trend_model = LinearRegression()
    trend_model.fit(t.reshape(-1, 1), y)
    trend = trend_model.predict(t.reshape(-1, 1))

    detrended = y - trend

    seasonal = np.zeros(n)
    if period > 1 and n >= period * 2:
        seasonal_periods = detrended[: (n // period) * period].reshape(-1, period)
        seasonal_pattern = seasonal_periods.mean(axis=0)
        seasonal = np.tile(seasonal_pattern, int(np.ceil(n / period)))[:n]

    residuals = y - trend - seasonal

    future_t = np.arange(n, n + periods)
    trend_forecast = trend_model.predict(future_t.reshape(-1, 1))

    seasonal_forecast = np.zeros(periods)
    if period > 1:
        seasonal_forecast = np.tile(seasonal_pattern, int(np.ceil(periods / period)))[:periods]

    yhat = trend_forecast + seasonal_forecast

    residual_std = np.std(residuals) if len(residuals) > 1 else 0
    z = 1.96

    forecast_out = []
    for i in range(periods):
        forecast_out.append({
            "ds": str((ds.iloc[-1] + pd.Timedelta(days=(i + 1))).date()),
            "yhat": round(float(yhat[i]), 4),
            "yhat_lower": round(float(yhat[i] - z * residual_std), 4),
            "yhat_upper": round(float(yhat[i] + z * residual_std), 4),
        })

    result = {
        "forecast": forecast_out,
        "components": {
            "trend": [round(float(v), 4) for v in trend],
            "seasonal": [round(float(v), 4) for v in seasonal],
        },
        "metadata": {
            "rows_used": n,
            "periods_forecasted": periods,
            "date_col": date_col,
            "value_col": value_col,
            "seasonality_period": period,
            "model": "linear_trend_seasonal",
        },
    }

    if include_history:
        result["actuals"] = [
            {"ds": str(d.date()), "y": round(float(v), 4)}
            for d, v in zip(ds, y)
        ]
        result["fitted_values"] = [
            {"ds": str(d.date()), "yhat": round(float(trend[i] + seasonal[i]), 4)}
            for i, d in enumerate(ds)
        ]

    return result


def evaluate(df: pd.DataFrame, date_col: str, value_col: str, horizon: str = "7 days") -> dict:
    prepared = prepare_data(df, date_col, value_col)
    if len(prepared) < 10:
        return {"error": f"Need at least 10 rows, got {len(prepared)}"}

    try:
        import re
        horizon_days = int(re.search(r"\d+", horizon).group()) if re.search(r"\d+", horizon) else 7

        if len(prepared) <= horizon_days:
            return {"error": f"Dataset too small for horizon {horizon}"}

        train = prepared.iloc[:-horizon_days]
        test = prepared.iloc[-horizon_days:]

        result = train_forecast(train, "ds", "y", periods=horizon_days, include_history=False)
        if "error" in result:
            return result

        actual = test["y"].values
        predicted = np.array([f["yhat"] for f in result["forecast"]][:horizon_days])

        rmse = float(np.sqrt(np.mean((actual - predicted) ** 2)))
        mae = float(np.mean(np.abs(actual - predicted)))
        mape = float(np.mean(np.abs((actual - predicted) / (actual + 1e-10)))) * 100

        return {
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "mape": round(mape, 2),
            "horizon": horizon,
            "cv_splits": 1,
        }
    except Exception as e:
        return {"error": str(e), "rmse": None, "mae": None, "mape": None}
