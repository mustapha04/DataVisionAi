"""
Dashboard router for PredictIQ.

CRUD operations for saved dashboards — users can
save, load, update, and delete custom dashboard layouts.
"""

from fastapi import APIRouter

router = APIRouter()


@router.post("/dashboards")
async def create_dashboard():
    ...


@router.get("/dashboards")
async def list_dashboards():
    ...


@router.get("/dashboards/{dashboard_id}")
async def get_dashboard(dashboard_id: str):
    ...


@router.put("/dashboards/{dashboard_id}")
async def update_dashboard(dashboard_id: str):
    ...


@router.delete("/dashboards/{dashboard_id}")
async def delete_dashboard(dashboard_id: str):
    ...
