from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from services.ml_engine import train_forecast, evaluate, detect_columns
from database import supabase
import pandas as pd

router = APIRouter()


class ForecastRequest(BaseModel):
    date_col: str
    value_col: str
    periods: int = 30
    seasonality: str = "auto"
    include_history: bool = True


class EvaluateRequest(BaseModel):
    date_col: str
    value_col: str
    horizon: str = "7 days"


@router.get("/datasets/{dataset_id}/forecast/columns")
def get_forecast_columns(dataset_id: str):
    ds = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not ds.data:
        raise HTTPException(404, "Dataset not found")

    products = supabase.table("products").select("*").eq("dataset_id", dataset_id).limit(1).execute()
    if not products.data:
        raise HTTPException(400, "No product data found")

    cols = list(products.data[0].keys())
    sample_df = pd.DataFrame([products.data[0]])
    detection = detect_columns(sample_df)

    return {
        "columns": cols,
        "date_cols": detection["date_cols"],
        "numeric_cols": detection["numeric_cols"],
        "suggested_date_col": detection["date_col"],
        "suggested_value_col": detection["value_col"],
    }


@router.post("/datasets/{dataset_id}/forecast")
def run_forecast(dataset_id: str, req: ForecastRequest):
    ds = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not ds.data:
        raise HTTPException(404, "Dataset not found")

    products = supabase.table("products").select("*").eq("dataset_id", dataset_id).execute()
    if not products.data:
        raise HTTPException(400, "No product data found")

    df = pd.DataFrame(products.data)
    result = train_forecast(df, req.date_col, req.value_col, req.periods, req.seasonality, req.include_history)

    if "error" in result:
        raise HTTPException(400, result["error"])

    return result


@router.post("/datasets/{dataset_id}/forecast/evaluate")
def run_evaluate(dataset_id: str, req: EvaluateRequest):
    ds = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not ds.data:
        raise HTTPException(404, "Dataset not found")

    products = supabase.table("products").select("*").eq("dataset_id", dataset_id).execute()
    if not products.data:
        raise HTTPException(400, "No product data found")

    df = pd.DataFrame(products.data)
    result = evaluate(df, req.date_col, req.value_col, req.horizon)

    return result
