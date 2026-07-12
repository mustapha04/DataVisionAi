from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class DatasetCreate(BaseModel):
    file_name: str
    row_count: int
    column_count: int
    data_quality_score: float
    columns_meta: list[dict]


class DatasetOut(BaseModel):
    id: str
    user_id: str
    file_name: str
    row_count: int
    column_count: int
    data_quality_score: float
    columns_meta: list[dict]
    created_at: str


class KpiMetric(BaseModel):
    label: str
    value: str
    formatted_value: str
    sub: str
    delta: Optional[str] = None
    delta_type: str = "neutral"


class ChartData(BaseModel):
    chart_type: str
    title: str
    labels: list[str]
    datasets: list[dict]
    legends: list[dict]


class ProductRow(BaseModel):
    product_name: str
    category: str
    price: float
    units_sold: int
    revenue: float
    earnings: float
    downloads: int
    refunds: int
    rating: Optional[float] = None


class OpportunityItem(BaseModel):
    app_name: str
    downloads: int
    potential_revenue: float
    color: str


class InsightResponse(BaseModel):
    id: str
    analysis_type: str
    content: str
    model_used: str
    created_at: str
