from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from database import supabase
from services.kpi import compute_kpis
from services.aggregator import compute_chart_data, compute_products, compute_opportunities
import pandas as pd

router = APIRouter()


class LocalDataPayload(BaseModel):
    rows: list[dict] = []
    meta: list[dict] = []


def _load_dataset(dataset_id: str) -> tuple[pd.DataFrame, list[dict]]:
    ds = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not ds.data:
        raise HTTPException(404, "Dataset not found")
    meta = ds.data[0].get("columns_meta", [])
    products = supabase.table("products").select("*").eq("dataset_id", dataset_id).execute()
    if products.data:
        df = pd.DataFrame(products.data)
        return df, meta
    return pd.DataFrame(), meta


def _load_local(payload: Optional[LocalDataPayload]) -> tuple[pd.DataFrame, list[dict]]:
    if not payload or not payload.rows:
        raise HTTPException(400, "No data rows provided")
    df = pd.DataFrame(payload.rows)
    return df, payload.meta


@router.get("/datasets/{dataset_id}/kpis")
def get_kpis(dataset_id: str):
    df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"kpis": []}
    return {"kpis": compute_kpis(df, meta)}


@router.post("/datasets/{dataset_id}/kpis")
def get_kpis_local(dataset_id: str, payload: Optional[LocalDataPayload] = None):
    if dataset_id.startswith("local-"):
        df, meta = _load_local(payload)
    else:
        df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"kpis": []}
    return {"kpis": compute_kpis(df, meta)}


@router.get("/datasets/{dataset_id}/charts")
def get_charts(dataset_id: str):
    df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"charts": {}}
    return {"charts": compute_chart_data(df, meta)}


@router.post("/datasets/{dataset_id}/charts")
def get_charts_local(dataset_id: str, payload: Optional[LocalDataPayload] = None):
    if dataset_id.startswith("local-"):
        df, meta = _load_local(payload)
    else:
        df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"charts": {}}
    return {"charts": compute_chart_data(df, meta)}


@router.get("/datasets/{dataset_id}/products")
def get_products(
    dataset_id: str,
    sort_by: str = Query("revenue", description="Sort field"),
    limit: int = Query(50, le=100),
):
    df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"products": []}
    return {"products": compute_products(df, meta)[:limit]}


@router.post("/datasets/{dataset_id}/products")
def get_products_local(
    dataset_id: str,
    sort_by: str = Query("revenue", description="Sort field"),
    limit: int = Query(50, le=100),
    payload: Optional[LocalDataPayload] = None,
):
    if dataset_id.startswith("local-"):
        df, meta = _load_local(payload)
    else:
        df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"products": []}
    return {"products": compute_products(df, meta)[:limit]}


@router.get("/datasets/{dataset_id}/opportunities")
def get_opportunities(dataset_id: str):
    df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"opportunities": []}
    return {"opportunities": compute_opportunities(df, meta)}


@router.post("/datasets/{dataset_id}/opportunities")
def get_opportunities_local(dataset_id: str, payload: Optional[LocalDataPayload] = None):
    if dataset_id.startswith("local-"):
        df, meta = _load_local(payload)
    else:
        df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"opportunities": []}
    return {"opportunities": compute_opportunities(df, meta)}
