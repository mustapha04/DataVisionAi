from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase
from services.ai_provider import generate_insights
from datetime import datetime, timezone
import uuid

router = APIRouter()


class LocalInsightsPayload(BaseModel):
    rows: list[dict] = []
    meta: list[dict] = []


@router.post("/datasets/{dataset_id}/insights")
async def create_insights(dataset_id: str, analysis_type: str = "full", payload: Optional[LocalInsightsPayload] = None):
    if dataset_id.startswith("local-"):
        if not payload or not payload.rows:
            raise HTTPException(400, "Local dataset requires rows in body")
        rows = payload.rows
        meta = payload.meta
        file_name = "local dataset"
        row_count = len(rows)
    else:
        ds = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
        if not ds.data:
            raise HTTPException(404, "Dataset not found")

        meta = ds.data[0].get("columns_meta", [])
        row_count = ds.data[0].get("row_count", 0)
        file_name = ds.data[0].get("file_name", "dataset")

        products = supabase.table("products").select("*").eq("dataset_id", dataset_id).execute()
        rows = products.data or []

    col_summary = "\n".join([
        f"- {c['name']} ({c.get('type', 'unknown')})"
        for c in (meta[:15] if isinstance(meta, list) else [])
    ])

    sample_data = ""
    if rows:
        sample = rows[:5]
        headers = list(sample[0].keys()) if sample else []
        sample_data = "\n".join([
            " | ".join([str(r.get(h, ""))[:20] for h in headers[:8]])
            for r in sample
        ])

    prompt = f"""Dataset: {file_name}
Rows: {row_count} | Columns: {len(meta) if isinstance(meta, list) else 0}

Analysis type: {analysis_type}

Column profiles:
{col_summary}

Sample data (first {min(5, len(rows))} rows):
{headers[:8] if rows else ""}
{sample_data}

Provide business intelligence analysis with specific numbers and actionable recommendations."""

    result = await generate_insights(prompt)

    analysis_id = str(uuid.uuid4())
    if not dataset_id.startswith("local-"):
        payload_data = {
            "id": analysis_id,
            "dataset_id": dataset_id,
            "analysis_type": analysis_type,
            "prompt": prompt[:500],
            "response": result.get("content", {}),
            "model_used": result.get("model", "unknown"),
            "tokens_used": result.get("tokens", 0),
        }
        supabase.table("ai_analyses").insert(payload_data).execute()

    return {
        "id": analysis_id,
        "analysis_type": analysis_type,
        "content": result.get("content", {}),
        "model_used": result.get("model", "unknown"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/datasets/{dataset_id}/insights")
def get_insights(dataset_id: str):
    result = supabase.table("ai_analyses").select("*").eq("dataset_id", dataset_id).order("created_at", desc=True).execute()
    if not result.data:
        return {"insights": []}

    items = []
    for r in result.data:
        items.append({
            "id": r["id"],
            "analysis_type": r["analysis_type"],
            "content": r.get("response", {}),
            "model_used": r.get("model_used", ""),
            "created_at": r.get("created_at", ""),
        })
    return {"insights": items}
