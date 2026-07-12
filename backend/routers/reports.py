from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from services.reports import generate_pdf_report
from database import supabase

router = APIRouter()


class LocalReportPayload(BaseModel):
    rows: list[dict]
    meta: list[dict]
    file_name: str
    insights: list[dict] = []


@router.post("/datasets/{dataset_id}/report")
async def download_report_local(dataset_id: str, payload: LocalReportPayload):
    try:
        pdf_bytes = generate_pdf_report(
            file_name=payload.file_name,
            rows=payload.rows,
            meta=payload.meta,
            insights=payload.insights,
        )
    except Exception as e:
        raise HTTPException(500, f"Report generation failed: {str(e)}")

    safe_name = payload.file_name.replace(".csv", "").replace(".", "_")[:50]
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}_report.pdf"'},
    )


@router.get("/datasets/{dataset_id}/report")
async def download_report_supabase(dataset_id: str):
    ds = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not ds.data:
        raise HTTPException(404, "Dataset not found")

    ds_data = ds.data[0]
    file_name = ds_data.get("file_name", "dataset")
    meta = ds_data.get("columns_meta", [])

    products = supabase.table("products").select("*").eq("dataset_id", dataset_id).execute()
    rows = products.data or []

    insights_data = supabase.table("ai_analyses").select("*").eq("dataset_id", dataset_id).execute()
    insights = insights_data.data or []

    try:
        pdf_bytes = generate_pdf_report(
            file_name=file_name,
            rows=rows,
            meta=meta,
            insights=insights,
        )
    except Exception as e:
        raise HTTPException(500, f"Report generation failed: {str(e)}")

    safe_name = file_name.replace(".csv", "").replace(".", "_")[:50]
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}_report.pdf"'},
    )
