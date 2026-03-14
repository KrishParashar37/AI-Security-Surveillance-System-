"""
AI Security Surveillance System - FastAPI Backend
Main application entry point
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from loguru import logger
import os

from app.routes import auth, cameras, alerts, detection, dashboard, notifications
from app.services.database import connect_db, disconnect_db
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle events."""
    logger.info("🚀 Starting AI Security Surveillance System...")
    await connect_db()
    # Create snapshots directory
    os.makedirs("data/snapshots", exist_ok=True)
    os.makedirs("data/recordings", exist_ok=True)
    yield
    logger.info("⏹️ Shutting down...")
    await disconnect_db()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered real-time security surveillance system with deep learning models",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
os.makedirs("data/snapshots", exist_ok=True)
app.mount("/snapshots", StaticFiles(directory="data/snapshots"), name="snapshots")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(cameras.router, prefix="/api/cameras", tags=["Cameras"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(detection.router, prefix="/api/detection", tags=["Detection"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])


@app.get("/", tags=["Root"])
async def root():
    return JSONResponse({
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs"
    })


@app.get("/health", tags=["Health"])
async def health_check():
    return JSONResponse({"status": "healthy", "message": "System is running"})


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
