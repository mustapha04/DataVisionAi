from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from services.ai_provider import chat_with_data, CHAT_SYSTEM_PROMPT, chat_with_openrouter, chat_with_groq
from database import supabase


router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    provider: str = "auto"
    openrouter_key: str = ""
    groq_key: str = ""
    openrouter_model: str = ""
    groq_model: str = ""
    local_rows: list[dict] = []
    local_meta: list[dict] = []


class QueryRequest(BaseModel):
    operation: str = "top"
    column: Optional[str] = None
    value: Optional[str] = None
    metric: Optional[str] = None
    limit: int = 10
    local_rows: list[dict] = []
    local_meta: list[dict] = []


def _build_data_context(dataset_id: str, local_rows: list = None, local_meta: list = None) -> dict:
    if dataset_id.startswith("local-"):
        meta_list = local_meta or []
        rows = local_rows or []
        file_name = "local dataset"
        return _build_context_from_data(file_name, meta_list, rows)

    ds_result = supabase.table("datasets").select("*").eq("id", dataset_id).execute()
    if not ds_result.data:
        raise HTTPException(404, "Dataset not found")
    ds = ds_result.data[0]

    file_name = ds.get("file_name", "dataset")
    meta = ds.get("columns_meta", [])
    rows = (ds.get("preview_data", {}) or {}).get("rows", [])
    return _build_context_from_data(file_name, meta, rows)


def _build_context_from_data(file_name: str, meta: Any, rows: list) -> dict:
    row_count = len(rows)
    column_count = len(meta) if isinstance(meta, list) else 0

    if isinstance(meta, dict):
        meta_list = meta.get("columns", [])
        type_map = meta.get("types", {})
        for c in meta_list:
            raw_type = c.get("type") or type_map.get(c["name"], "text")
            c["type"] = "numeric" if raw_type == "numerical" else raw_type
    elif isinstance(meta, list):
        meta_list = meta
    else:
        meta_list = []

    col_lines_parts = []
    num_cols = []
    cat_cols = []
    for c in meta_list[:30]:
        name = c["name"]
        ctype = c.get("type", "unknown")
        if ctype == "numeric":
            num_cols.append(c)
            stats = f"min={c.get('min','?')}, max={c.get('max','?')}, mean={c.get('mean','?')}, sum={c.get('sum','?')}, nulls={c.get('nulls',0)}"
        else:
            cat_cols.append(c)
            stats = f"unique={c.get('unique','?')}, top='{c.get('top_value','?')}' ({c.get('top_count',0)}), nulls={c.get('nulls',0)}"
        col_lines_parts.append(f"  - {name} ({ctype}) \u2014 {stats}")

    sample_rows = rows[:30]
    headers = list(sample_rows[0].keys()) if sample_rows else []
    sample_lines = "\n".join(
        [" | ".join([str(r.get(h, ""))[:20] for h in headers[:8]]) for r in sample_rows]
    )

    summary_parts = []
    for c in num_cols[:5]:
        summary_parts.append(f"  - {c['name']}: sum={c.get('sum',0):.2f}, avg={c.get('mean',0):.2f}, range=[{c.get('min',0):.2f}, {c.get('max',0):.2f}]")

    top_categories = []
    if rows and cat_cols:
        cat_col_name = cat_cols[0]["name"]
        cat_breakdown = {}
        for r in rows:
            k = str(r.get(cat_col_name, "Unknown"))
            cat_breakdown[k] = cat_breakdown.get(k, 0) + 1
        top_categories = sorted(cat_breakdown.items(), key=lambda x: -x[1])[:5]

    summary_text = ""
    if top_categories:
        cats_lines = "\n".join([f"  - {k}: {v} rows" for k, v in top_categories])
        summary_text = f"\nTop categories:\n{cats_lines}"
    if summary_parts:
        summary_text += f"\n\nNumeric column stats:\n" + "\n".join(summary_parts)

    return {
        "file_name": file_name, "row_count": row_count, "column_count": column_count,
        "col_lines": "\n".join(col_lines_parts), "summary_text": summary_text.strip(),
        "sample_lines": sample_lines, "headers": headers, "rows": rows,
        "has_data": True, "meta_list": meta_list,
    }


@router.post("/datasets/{dataset_id}/chat")
async def chat_with_dataset(dataset_id: str, req: ChatRequest):
    try:
        ctx = _build_data_context(dataset_id, local_rows=req.local_rows, local_meta=req.local_meta)

        data_context = f"""Dataset: {ctx['file_name']}
Rows: {ctx['row_count']} | Columns: {ctx['column_count']}

Column profiles:
{ctx['col_lines']}

{ctx['summary_text']}

Sample rows (showing first {min(30, ctx['row_count'])} of {ctx['row_count']}):
Headers: {' | '.join(ctx['headers'][:8]) if ctx['headers'] else 'N/A'}
{ctx['sample_lines']}
"""

        system_content = f"{CHAT_SYSTEM_PROMPT}\n\n## Dataset Context\n{data_context}"

        messages = [{"role": "system", "content": system_content}]
        for h in req.history:
            messages.append({"role": h.role, "content": h.content})
        messages.append({"role": "user", "content": req.message})

        result = await chat_with_data(
            messages, provider=req.provider,
            openrouter_key=req.openrouter_key, groq_key=req.groq_key,
            openrouter_model=req.openrouter_model, groq_model=req.groq_model,
        )

        return {
            "reply": result["content"],
            "model_used": result.get("model", "unknown"),
            "tokens_used": result.get("tokens", 0),
            "provider_tried": result.get("provider_tried", req.provider),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(500, detail=f"Server error: {str(e)}")


@router.post("/datasets/{dataset_id}/query")
async def query_dataset(dataset_id: str, req: QueryRequest):
    try:
        ctx = _build_data_context(dataset_id, local_rows=req.local_rows, local_meta=req.local_meta)
        rows = ctx.get("rows", [])

        if not rows:
            return {"results": [], "total": 0, "summary": "No data available"}

        limit = min(req.limit, 100)

        if req.operation == "top":
            col = req.column or (ctx["headers"][0] if ctx["headers"] else None)
            metric = req.metric
            if metric:
                sorted_rows = sorted(rows, key=lambda r: abs(r.get(metric, 0) or 0), reverse=True)
            elif col:
                sorted_rows = sorted(rows, key=lambda r: str(r.get(col, "")).lower())
            else:
                sorted_rows = rows
            results = sorted_rows[:limit]
            summary = f"Top {len(results)} results"

        elif req.operation == "filter":
            col = req.column
            value = req.value
            if not col:
                return {"results": [], "total": 0, "summary": "No column specified"}
            filtered = [r for r in rows if str(r.get(col, "")).lower() == str(value).lower()]
            results = filtered[:limit]
            summary = f"Found {len(filtered)} rows where {col} = '{value}'"

        elif req.operation == "aggregate":
            col = req.column
            metric = req.metric or col
            if not col:
                return {"results": [], "total": 0, "summary": "No column specified"}
            groups = {}
            for r in rows:
                k = str(r.get(col, "Unknown"))
                v = r.get(metric, 0) or 0
                if k not in groups:
                    groups[k] = {"count": 0, "sum": 0}
                groups[k]["count"] += 1
                groups[k]["sum"] += v
            results = [
                {"key": k, "count": v["count"], "sum": round(v["sum"], 2), "avg": round(v["sum"] / v["count"], 2) if v["count"] > 0 else 0}
                for k, v in sorted(groups.items(), key=lambda x: -x[1]["sum"])[:limit]
            ]
            summary = f"Aggregated {len(rows)} rows by {col}, top {len(results)} groups"

        elif req.operation == "search":
            col = req.column
            value = req.value
            if not col or not value:
                return {"results": [], "total": 0, "summary": "Column and value required"}
            matched = [r for r in rows if str(value).lower() in str(r.get(col, "")).lower()]
            results = matched[:limit]
            summary = f"Found {len(matched)} rows matching '{value}' in {col}"

        else:
            results = rows[:limit]
            summary = f"Returned {len(results)} rows"

        return {"results": results, "total": len(results), "summary": summary}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Query error: {e}")
        raise HTTPException(500, detail=f"Server error: {str(e)}")


@router.post("/test-connection")
async def test_connection(req: ChatRequest):
    try:
        messages = [{"role": "user", "content": "Reply with exactly one word: OK"}]

        if req.provider == "openrouter":
            model = req.openrouter_model or "nvidia/nemotron-3-ultra-550b-a55b:free"
            result = await chat_with_openrouter(messages, api_key=req.openrouter_key or None, model=model)
        elif req.provider == "groq":
            model = req.groq_model or "llama-3.3-70b-versatile"
            result = await chat_with_groq(messages, api_key=req.groq_key or None, model=model)
        else:
            return {"success": False, "error": "Invalid provider for test"}

        if result:
            if result.get("error"):
                return {"success": False, "error": result["content"]}
            return {"success": True, "model_used": result.get("model", "unknown")}
        return {"success": False, "error": "No response from provider (check key and model)"}
    except Exception as e:
        return {"success": False, "error": str(e)}
