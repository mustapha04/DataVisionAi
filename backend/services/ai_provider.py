import hashlib
import httpx
import json
import time
from collections import OrderedDict
from typing import Optional
from core.config import settings


SYSTEM_PROMPT = """You are PredictIQ, an expert data analyst AI. Analyze the dataset and return actionable business insights.

Return your analysis as a JSON object with this exact structure:
{
  "insights": [
    {
      "title": "Short insight title",
      "type": "opportunity|warning|insight",
      "finding": "What the data shows (include specific numbers)",
      "impact": "Business impact of this finding",
      "action": "Specific recommended action",
      "risk": "Any risk to consider"
    }
  ],
  "summary": "2-3 sentence executive summary",
  "key_metrics": {"metric_name": "value"}
}

Be specific. Use exact numbers from the data. Focus on actionable recommendations."""


OPENROUTER_FREE_MODELS = [
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
]


class LRUCache:
    def __init__(self, capacity: int = 32, ttl: int = 300):
        self.cache = OrderedDict()
        self.capacity = capacity
        self.ttl = ttl

    def _key(self, text: str) -> str:
        return hashlib.sha256(text.encode()).hexdigest()

    def get(self, text: str) -> Optional[dict]:
        key = self._key(text)
        if key not in self.cache:
            return None
        entry = self.cache[key]
        if time.time() - entry["ts"] > self.ttl:
            del self.cache[key]
            return None
        self.cache.move_to_end(key)
        return entry["value"]

    def set(self, text: str, value: dict):
        key = self._key(text)
        self.cache[key] = {"value": value, "ts": time.time()}
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)


_insights_cache = LRUCache(capacity=32, ttl=300)


CHAT_SYSTEM_PROMPT = """You are PredictIQ, an expert data analyst AI assistant. You help users understand their dataset by answering questions conversationally.

Rules:
- Answer based ONLY on the dataset context provided below. Do not make up data.
- Use specific numbers from the data when relevant.
- Keep responses concise and actionable (2-4 paragraphs max unless asked for detail).
- If you don't know something, say so — don't hallucinate.
- Format numbers with commas and dollar signs where appropriate.
- You can suggest analyses, point out trends, flag anomalies, and recommend actions.
- Be helpful, professional, and data-driven."""


async def _call_openrouter(model: str, messages: list[dict], timeout: int = 45, api_key: Optional[str] = None) -> Optional[dict]:
    api_key = api_key or settings.openrouter_api_key
    if not api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://predictiq.app",
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.5,
                    "max_tokens": 1000,
                },
            )
            data = resp.json()
            if resp.status_code != 200:
                err_msg = data.get("error", {}).get("message", "?")
                print(f"OpenRouter {model}: {resp.status_code} - {err_msg}")
                return {"content": f"OpenRouter error ({resp.status_code}): {err_msg}", "model": model, "tokens": 0, "error": True}
            content = data["choices"][0]["message"]["content"]
            return {
                "content": content,
                "model": data.get("model", model),
                "tokens": data.get("usage", {}).get("total_tokens", 0),
            }
    except httpx.TimeoutException:
        print(f"OpenRouter {model}: timeout")
        return {"content": f"OpenRouter timeout after {timeout}s", "model": model, "tokens": 0, "error": True}
    except Exception as e:
        print(f"OpenRouter {model}: {e}")
        return {"content": f"OpenRouter error: {e}", "model": model, "tokens": 0, "error": True}


async def analyze_with_openrouter(prompt: str) -> Optional[dict]:
    import asyncio
    for model in OPENROUTER_FREE_MODELS:
        msgs = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ]
        result = await _call_openrouter(model, msgs, timeout=45)
        if not result:
            await asyncio.sleep(0.5)
            continue
        try:
            parsed = json.loads(result["content"])
            return {
                "content": parsed,
                "model": result["model"],
                "tokens": result["tokens"],
            }
        except json.JSONDecodeError:
            print(f"OpenRouter {model} returned non-JSON")
            continue
    return None


async def analyze_with_groq(prompt: str) -> Optional[dict]:
    api_key = settings.groq_api_key
    if not api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 2000,
                    "response_format": {"type": "json_object"},
                },
            )
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            return {
                "content": json.loads(content),
                "model": data.get("model", "unknown"),
                "tokens": data.get("usage", {}).get("total_tokens", 0),
            }
    except Exception as e:
        print(f"Groq error: {e}")
        return None


async def generate_insights(prompt: str) -> dict:
    cached = _insights_cache.get(prompt)
    if cached:
        print("Returning cached insights")
        return cached

    result = await analyze_with_groq(prompt)

    if not result:
        result = await analyze_with_openrouter(prompt)

    if not result:
        result = generate_mock_insights(prompt)

    _insights_cache.set(prompt, result)
    return result


def generate_mock_insights(prompt: str) -> dict:
    return {
        "content": {
            "insights": [
                {
                    "title": "Revenue Leaders Identified",
                    "type": "insight",
                    "finding": "Top revenue-generating products show strong performance in your dataset. Consider doubling down on your highest-performing categories.",
                    "impact": "Focusing on top performers typically yields 5-10x better ROI than spreading resources evenly.",
                    "action": "Review your top 3 products by revenue and allocate 60% of marketing budget to them.",
                    "risk": "Over-concentration in one category creates dependency risk.",
                },
                {
                    "title": "Pricing Optimization Opportunity",
                    "type": "opportunity",
                    "finding": "Analysis of price points vs units sold reveals opportunities for pricing optimization across your product range.",
                    "impact": "Strategic price adjustments typically increase revenue by 8-15% without additional cost.",
                    "action": "Test 10-15% price increases on products with above-average ratings and consistent sales volume.",
                    "risk": "Large price changes may temporarily reduce sales volume — test on 2-3 products first.",
                },
                {
                    "title": "Growth Opportunity in Downloads",
                    "type": "opportunity",
                    "finding": "Free downloads significantly outpace paid conversions in some products, suggesting untapped monetization potential.",
                    "impact": "Converting even 5-10% of free users can meaningfully increase revenue.",
                    "action": "Add in-app purchases, premium tiers, or limited-time offers to high-download free products.",
                    "risk": "Aggressive monetization may reduce download velocity — test gradually.",
                },
            ],
            "summary": "Your dataset shows promising revenue patterns with clear opportunities for pricing optimization and download monetization. Focus on your top-performing categories while systematically improving conversion from free to paid.",
            "key_metrics": {
                "total_products": "Analyzed",
                "revenue_potential": "Identified",
                "growth_areas": "Multiple detected",
            },
        },
        "model": "mock-analyzer",
        "tokens": 0,
    }


async def chat_with_openrouter(messages: list[dict], api_key: Optional[str] = None, model: Optional[str] = None) -> Optional[dict]:
    import asyncio
    models = [model] if model else OPENROUTER_FREE_MODELS
    for m in models:
        result = await _call_openrouter(m, messages, timeout=45, api_key=api_key)
        if result:
            if result.get("error"):
                if model:
                    return result
                continue
            return result
        await asyncio.sleep(1)
    return None


async def chat_with_groq(messages: list[dict], api_key: Optional[str] = None, model: Optional[str] = None) -> Optional[dict]:
    api_key = api_key or settings.groq_api_key
    if not api_key:
        return None

    model_id = model or "llama-3.3-70b-versatile"
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model_id,
                    "messages": messages,
                    "temperature": 0.5,
                    "max_tokens": 2000,
                },
            )
            data = resp.json()
            if resp.status_code != 200:
                err_msg = data.get("error", {}).get("message", "?")
                print(f"Groq: {resp.status_code} - {err_msg}")
                return {"content": f"Groq error: {err_msg}", "model": model_id, "tokens": 0, "error": True}
            content = data["choices"][0]["message"]["content"]
            return {
                "content": content,
                "model": data.get("model", model_id),
                "tokens": data.get("usage", {}).get("total_tokens", 0),
            }
    except Exception as e:
        print(f"Groq chat error: {e}")
        return None


def _extract_context(messages: list[dict]) -> dict:
    system = next((m["content"] for m in messages if m["role"] == "system"), "")
    ctx = {"name": "", "rows": "0", "cols": "0"}
    for line in system.split("\n"):
        if line.startswith("Dataset:"):
            ctx["name"] = line.replace("Dataset:", "").strip()
        if "Rows:" in line and "Columns:" in line:
            parts = line.split("|")
            ctx["rows"] = parts[0].replace("Rows:", "").strip() if len(parts) > 0 else "?"
            ctx["cols"] = parts[1].replace("Columns:", "").strip() if len(parts) > 1 else "?"
    return ctx


def chat_mock(messages: list[dict]) -> dict:
    ctx = _extract_context(messages)
    last = messages[-1]["content"] if messages else ""
    q = last.lower()

    name = ctx.get("name", "this dataset") or "this dataset"
    rows = ctx.get("rows", "?")
    cols = ctx.get("cols", "?")

    if "summar" in q or "overview" in q or "analyze" in q:
        reply = f"Here is a summary of **{name}**:\n\n"
        reply += f"- **{rows} rows** across **{cols} columns**\n"
        reply += f"- The dataset contains transactional/revenue data with product details, pricing, and sales metrics\n"
        reply += f"- I can help you explore top products, revenue trends, pricing analysis, and growth opportunities"
    elif "revenue" in q or "top" in q or "best" in q or "highest" in q:
        reply = f"Looking at **{name}**, the top revenue drivers are concentrated in a few key areas. "
        reply += f"With {rows} transactions recorded, I recommend filtering by revenue to identify your best performers and focusing marketing efforts there for maximum ROI."
    elif "trend" in q or "forecast" in q or "growth" in q or "pattern" in q:
        reply = f"I can see clear sales patterns across the {rows} records in **{name}**. "
        reply += "For detailed trend projections, check the Forecast tab which runs linear regression with seasonal decomposition."
    elif "price" in q or "pricing" in q or "cost" in q:
        reply = f"Pricing analysis of **{name}** shows varying price points across the dataset. "
        reply += "Look for clusters of high-volume vs high-margin products to optimize your pricing strategy."
    elif "clean" in q or "quality" in q or "missing" in q or "null" in q:
        reply = f"Data quality for **{name}**: The dataset has been parsed and cleaned. "
        reply += "You can review column profiles (null counts, ranges) and adjust cleaning options from the upload step."
    elif "download" in q or "free" in q or "install" in q:
        reply = f"Looking at download patterns in **{name}**: Free downloads often outpace paid conversions. "
        reply += "Check the Analytics Dashboard for monetization opportunities on high-download free products."
    else:
        reply = f"I can help you analyze **{name}** ({rows} rows, {cols} columns)! Try asking about top products, revenue trends, pricing, free downloads, or request a data summary."

    return {"content": reply, "model": "mock-chat", "tokens": 0}


async def chat_with_data(messages: list[dict], provider: str = "auto", openrouter_key: str = "", groq_key: str = "", openrouter_model: str = "", groq_model: str = "") -> dict:
    or_key = openrouter_key or None
    g_key = groq_key or None
    or_model = openrouter_model or None
    g_model = groq_model or None

    if provider == "openrouter":
        result = await chat_with_openrouter(messages, api_key=or_key, model=or_model)
        tried = "openrouter"
    elif provider == "groq":
        result = await chat_with_groq(messages, api_key=g_key, model=g_model)
        tried = "groq"
    elif provider == "mock":
        result = chat_mock(messages)
        tried = "mock"
    else:
        result = await chat_with_groq(messages, api_key=g_key, model=g_model)
        tried = "groq"
        if not result:
            result = await chat_with_openrouter(messages, api_key=or_key, model=or_model)
            tried = "openrouter"

    if not result:
        result = chat_mock(messages)
        tried = "mock"

    result["provider_tried"] = tried
    return result
