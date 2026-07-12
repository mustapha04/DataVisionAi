from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter()


@router.get("/datasets")
def list_datasets():
    result = supabase.table("datasets").select("*").order("created_at", desc=True).execute()
    return {"datasets": result.data or []}


@router.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: str):
    result = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not result.data:
        raise HTTPException(404, "Dataset not found")
    return result.data[0]


@router.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: str):
    supabase.table("products").delete().eq("dataset_id", dataset_id).execute()
    supabase.table("dashboards").delete().eq("dataset_id", dataset_id).execute()
    supabase.table("ai_analyses").delete().eq("dataset_id", dataset_id).execute()
    result = supabase.table("datasets").delete().eq("id", dataset_id).execute()
    if not result.data:
        raise HTTPException(404, "Dataset not found")
    return {"message": "Deleted"}
