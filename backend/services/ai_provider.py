import httpx
import json
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


async def analyze_with_openrouter(prompt: str) -> Optional[dict]:
    api_key = settings.openrouter_api_key
    if not api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://predictiq.app",
                },
                json={
                    "model": "google/gemini-2.0-flash-lite-001",
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
        print(f"OpenRouter error: {e}")
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
    result = await analyze_with_openrouter(prompt)

    if not result:
        result = await analyze_with_groq(prompt)

    if not result:
        result = generate_mock_insights(prompt)

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
