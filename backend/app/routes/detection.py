"""AI Detection engine routes."""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect
from typing import List
from datetime import datetime
import base64
import numpy as np
import random
import asyncio
import json
from loguru import logger

from app.models.schemas import DetectionResult, FrameAnalysisRequest, ActivityType
from app.routes.auth import get_current_user
from app.services.ai_engine import AIDetectionEngine

router = APIRouter()
ai_engine = AIDetectionEngine()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"🔌 WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"🔌 WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.active_connections.remove(conn)

manager = ConnectionManager()


@router.websocket("/ws/stream/{camera_id}")
async def websocket_stream(websocket: WebSocket, camera_id: str):
    """WebSocket endpoint for real-time detection stream."""
    await manager.connect(websocket)
    try:
        while True:
            # Simulate real-time detection results
            detection = ai_engine.simulate_detection(camera_id)
            await websocket.send_json(detection)
            await asyncio.sleep(2)  # Send update every 2 seconds
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.post("/analyze-frame", response_model=DetectionResult)
async def analyze_frame(
    request: FrameAnalysisRequest,
    current_user: dict = Depends(get_current_user)
):
    """Analyze a single video frame using AI model."""
    try:
        # Decode base64 frame
        frame_bytes = base64.b64decode(request.frame_base64)
        frame_array = np.frombuffer(frame_bytes, dtype=np.uint8)
        result = ai_engine.analyze_frame(request.camera_id, frame_array)
        return DetectionResult(**result)
    except Exception as e:
        logger.error(f"Frame analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-video")
async def analyze_video(
    camera_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload and analyze a video file."""
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    contents = await file.read()
    logger.info(f"📹 Video uploaded for camera {camera_id}: {file.filename} ({len(contents)} bytes)")
    # Simulate async video processing
    result = {
        "status": "processing",
        "camera_id": camera_id,
        "filename": file.filename,
        "size_bytes": len(contents),
        "estimated_time": "30 seconds",
        "job_id": f"job_{random.randint(10000, 99999)}"
    }
    return result


@router.get("/simulate/{camera_id}")
async def simulate_detection(
    camera_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Simulate AI detection for demo purposes."""
    result = ai_engine.simulate_detection(camera_id)
    return result


@router.get("/models/status")
async def get_model_status(current_user: dict = Depends(get_current_user)):
    """Get AI model loading status."""
    return ai_engine.get_model_status()


@router.post("/broadcast-alert")
async def broadcast_detection_alert(
    alert: dict,
    current_user: dict = Depends(get_current_user)
):
    """Broadcast real-time alert to all connected WebSocket clients."""
    await manager.broadcast({"type": "alert", "data": alert})
    return {"message": f"Alert broadcasted to {len(manager.active_connections)} clients"}
