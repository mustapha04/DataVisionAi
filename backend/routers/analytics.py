from fastapi import APIRouter, HTTPException, Query
from database import supabase
from services.kpi import compute_kpis
from services.aggregator import compute_chart_data, compute_products, compute_opportunities
import pandas as pd

router = APIRouter()


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


@router.get("/datasets/{dataset_id}/kpis")
def get_kpis(dataset_id: str):
    df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"kpis": []}
    kpis = compute_kpis(df, meta)
    return {"kpis": kpis}


@router.get("/datasets/{dataset_id}/charts")
def get_charts(dataset_id: str):
    df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"charts": {}}
    charts = compute_chart_data(df, meta)
    return {"charts": charts}


@router.get("/datasets/{dataset_id}/products")
def get_products(
    dataset_id: str,
    sort_by: str = Query("revenue", description="Sort field"),
    limit: int = Query(50, le=100),
):
    df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"products": []}
    products = compute_products(df, meta)
    return {"products": products[:limit]}


@router.get("/datasets/{dataset_id}/opportunities")
def get_opportunities(dataset_id: str):
    df, meta = _load_dataset(dataset_id)
    if df.empty:
        return {"opportunities": []}
    opps = compute_opportunities(df, meta)
    return {"opportunities": opps}
