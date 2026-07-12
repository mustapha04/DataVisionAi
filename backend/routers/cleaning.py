from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.cleaner import build_cleaning_config, clean_dataset
from database import supabase
import pandas as pd

router = APIRouter()


class CleanRequest(BaseModel):
    config: dict = {}


@router.get("/datasets/{dataset_id}/clean/suggestions")
def get_cleaning_suggestions(dataset_id: str):
    ds = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not ds.data:
        raise HTTPException(404, "Dataset not found")

    meta = ds.data[0].get("columns_meta", [])
    suggestions = build_cleaning_config(meta)
    suggestions["file_name"] = ds.data[0].get("file_name")
    suggestions["row_count"] = ds.data[0].get("row_count")
    return suggestions


@router.post("/datasets/{dataset_id}/clean")
async def clean_dataset_endpoint(dataset_id: str, req: CleanRequest):
    ds = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not ds.data:
        raise HTTPException(404, "Dataset not found")

    products = supabase.table("products").select("*").eq("dataset_id", dataset_id).execute()
    if not products.data:
        raise HTTPException(400, "No product data found for this dataset")

    df = pd.DataFrame(products.data)

    cleaned_df, report = clean_dataset(df, req.config)

    if not cleaned_df.empty:
        for _, row in cleaned_df.iterrows():
            pid = row.get("id")
            if pid:
                supabase.table("products").update(row.to_dict()).eq("id", pid).execute()

    cols_meta = ds.data[0].get("columns_meta", [])
    total_cells = sum(c.get("total", 0) for c in cols_meta)
    null_cells_before = sum(c.get("nulls", 0) for c in cols_meta)

    null_cells_after = int(cleaned_df.isna().sum().sum())
    quality_before = round((1 - null_cells_before / total_cells) * 100, 1) if total_cells else 100
    quality_after = round((1 - null_cells_after / (cleaned_df.size or 1)) * 100, 1) if cleaned_df.size else 100

    supabase.table("datasets").update({
        "row_count": len(cleaned_df),
        "data_quality_score": quality_after,
    }).eq("id", dataset_id).execute()

    return {
        "report": report,
        "quality_before": quality_before,
        "quality_after": quality_after,
        "rows_before": report["rows_before"],
        "rows_after": len(cleaned_df),
    }
