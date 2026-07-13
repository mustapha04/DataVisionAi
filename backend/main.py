import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from routers import upload, datasets, analytics, insights, auth, cleaning, forecast, reports, admin, export, chat

app = FastAPI(title="PredictIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://datavisionai.vercel.app", "https://datavisionai-jqka.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(datasets.router, prefix="/api", tags=["datasets"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(insights.router, prefix="/api", tags=["insights"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(cleaning.router, prefix="/api", tags=["cleaning"])
app.include_router(forecast.router, prefix="/api", tags=["forecast"])
app.include_router(reports.router, prefix="/api", tags=["reports"])
app.include_router(admin.router, prefix="/api", tags=["admin"])
app.include_router(export.router, prefix="/api", tags=["export"])
app.include_router(chat.router, prefix="/api", tags=["chat"])


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
