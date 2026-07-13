import io, csv
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from database import supabase

router = APIRouter()


class LocalExportPayload(BaseModel):
    rows: list[dict]
    file_name: str = "export"


@router.post("/datasets/{dataset_id}/export/csv")
async def export_csv_local(dataset_id: str, payload: LocalExportPayload):
    if not payload.rows:
        raise HTTPException(404, "No data rows found")

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=payload.rows[0].keys())
    writer.writeheader()
    writer.writerows(payload.rows)
    output.seek(0)

    safe_name = payload.file_name.replace(".csv", "").replace(".", "_")[:50]
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}.csv"'},
    )


@router.get("/datasets/{dataset_id}/export/csv")
async def export_csv_supabase(dataset_id: str):
    ds = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not ds.data:
        raise HTTPException(404, "Dataset not found")

    ds_data = ds.data[0]
    rows = (ds_data.get("preview_data", {}) or {}).get("rows", [])
    file_name = ds_data.get("file_name", "export").replace(".csv", "")

    if not rows:
        raise HTTPException(404, "No data rows found")

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)

    safe_name = file_name.replace(".", "_")[:50]
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}.csv"'},
    )
