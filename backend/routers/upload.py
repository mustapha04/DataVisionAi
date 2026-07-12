from fastapi import APIRouter, UploadFile, File, HTTPException
from services.parser import parse_file, compute_data_quality
from database import supabase
import hashlib
import uuid

router = APIRouter()


@router.post("/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(400, "No file provided")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ("csv", "json", "tsv", "txt", "xls", "xlsx"):
        raise HTTPException(400, f"Unsupported file type: .{ext}")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(400, "Empty file")

    try:
        df, meta = parse_file(content, file.filename)
    except Exception as e:
        raise HTTPException(400, f"Parse error: {str(e)}")

    quality = compute_data_quality(df)
    row_count = len(df)
    col_count = len(meta)

    data_hash = hashlib.md5(content).hexdigest()

    existing = supabase.table("datasets").select("id").eq("data_hash", data_hash).execute()
    if existing.data and len(existing.data) > 0:
        raise HTTPException(409, "This dataset has already been uploaded")

    temp_user_id = str(uuid.uuid4())

    ds_payload = {
        "user_id": temp_user_id,
        "file_name": file.filename,
        "row_count": row_count,
        "column_count": col_count,
        "data_quality_score": quality,
        "columns_meta": meta,
        "data_hash": data_hash,
    }

    ds_result = supabase.table("datasets").insert(ds_payload).execute()
    if not ds_result.data:
        raise HTTPException(500, "Failed to save dataset")

    dataset_id = ds_result.data[0]["id"]

    products = _df_to_products(df, meta)
    if products:
        for p in products:
            p["dataset_id"] = dataset_id

        batch_size = 100
        for i in range(0, len(products), batch_size):
            batch = products[i:i + batch_size]
            supabase.table("products").insert(batch).execute()

    return {
        "id": dataset_id,
        "file_name": file.filename,
        "row_count": row_count,
        "column_count": col_count,
        "data_quality_score": quality,
        "columns_meta": meta,
    }


def _df_to_products(df, meta):
    name_cols = [c["name"] for c in meta if c.get("type") != "numeric" and any(
        kw in c["name"].lower().replace("_", " ") for kw in ["app", "product", "name", "title", "item"]
    )]
    cat_cols = [c["name"] for c in meta if c.get("type") == "categorical"]
    num_cols = [c["name"] for c in meta if c.get("type") == "numeric"]

    rev_col = _match_any(num_cols, ["revenue", "sale", "gross", "earnings"])
    earn_col = _match_any(num_cols, ["earning", "profit", "net"])
    unit_col = _match_any(num_cols, ["unit", "sold", "transaction", "qty"])
    dl_col = _match_any(num_cols, ["download", "install"])
    ref_col = _match_any(num_cols, ["refund", "return"])
    rat_col = _match_any(num_cols, ["rating", "score", "star"])
    pri_col = _match_any(num_cols, ["price", "cost", "fee"])

    products = []
    for _, row in df.iterrows():
        p = {
            "product_name": str(row[name_cols[0]]) if name_cols else "Unknown",
            "category": str(row[cat_cols[0]]) if cat_cols else "Uncategorized",
            "price": float(row[pri_col]) if pri_col and row[pri_col] else 0,
            "units_sold": int(row[unit_col]) if unit_col and row[unit_col] else 0,
            "revenue": float(row[rev_col]) if rev_col and row[rev_col] else 0,
            "earnings": float(row[earn_col]) if earn_col and row[earn_col] else 0,
            "downloads": int(row[dl_col]) if dl_col and row[dl_col] else 0,
            "refunds": int(row[ref_col]) if ref_col and row[ref_col] else 0,
            "rating": float(row[rat_col]) if rat_col and row[rat_col] else None,
        }
        products.append(p)

    return products


def _match_any(cols, keywords):
    for col in cols:
        cl = col.lower().replace("_", " ").replace("-", " ")
        for kw in keywords:
            if kw in cl:
                return col
    return None
