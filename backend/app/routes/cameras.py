"""Camera management routes."""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
import uuid
from loguru import logger

from app.models.schemas import CameraCreate, CameraResponse, CameraStatus
from app.services.database import get_db
from app.routes.auth import get_current_user

router = APIRouter()

# Mock camera data for demo
MOCK_CAMERAS = [
    {
        "id": "cam_001", "camera_id": "cam_001", "name": "Main Entrance",
        "location": "Building A - Gate 1", "stream_url": "rtsp://demo/stream1",
        "status": "active", "last_seen": datetime.utcnow(), "alerts_today": 3,
        "thumbnail": "/snapshots/cam1_thumb.jpg"
    },
    {
        "id": "cam_002", "camera_id": "cam_002", "name": "Parking Lot A",
        "location": "Parking Zone A", "stream_url": "rtsp://demo/stream2",
        "status": "active", "last_seen": datetime.utcnow(), "alerts_today": 1,
        "thumbnail": "/snapshots/cam2_thumb.jpg"
    },
    {
        "id": "cam_003", "camera_id": "cam_003", "name": "Server Room",
        "location": "Building B - Floor 2", "stream_url": "rtsp://demo/stream3",
        "status": "active", "last_seen": datetime.utcnow(), "alerts_today": 0,
        "thumbnail": "/snapshots/cam3_thumb.jpg"
    },
    {
        "id": "cam_004", "camera_id": "cam_004", "name": "Lobby Camera",
        "location": "Building A - Lobby", "stream_url": "rtsp://demo/stream4",
        "status": "maintenance", "last_seen": datetime.utcnow(), "alerts_today": 2,
        "thumbnail": "/snapshots/cam4_thumb.jpg"
    },
    {
        "id": "cam_005", "camera_id": "cam_005", "name": "Warehouse Entry",
        "location": "Warehouse - Gate", "stream_url": "rtsp://demo/stream5",
        "status": "active", "last_seen": datetime.utcnow(), "alerts_today": 5,
        "thumbnail": "/snapshots/cam5_thumb.jpg"
    },
    {
        "id": "cam_006", "camera_id": "cam_006", "name": "Rooftop View",
        "location": "Rooftop - North", "stream_url": "rtsp://demo/stream6",
        "status": "offline", "last_seen": datetime.utcnow(), "alerts_today": 0,
        "thumbnail": "/snapshots/cam6_thumb.jpg"
    },
]


@router.get("/", response_model=List[CameraResponse])
async def get_cameras(current_user: dict = Depends(get_current_user)):
    """Get all cameras."""
    db = get_db()
    if db is None:
        return [CameraResponse(**c) for c in MOCK_CAMERAS]
    cameras = await db.cameras.find().to_list(100)
    return [CameraResponse(**c) for c in cameras]


@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(camera_id: str, current_user: dict = Depends(get_current_user)):
    """Get camera by ID."""
    db = get_db()
    if db is None:
        cam = next((c for c in MOCK_CAMERAS if c["camera_id"] == camera_id), None)
        if not cam:
            raise HTTPException(status_code=404, detail="Camera not found")
        return CameraResponse(**cam)
    cam = await db.cameras.find_one({"camera_id": camera_id})
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    return CameraResponse(**cam)


@router.post("/", response_model=CameraResponse, status_code=201)
async def add_camera(camera: CameraCreate, current_user: dict = Depends(get_current_user)):
    """Add a new camera."""
    if current_user["role"] not in ["admin", "operator"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    new_cam = {
        "id": f"cam_{uuid.uuid4().hex[:6]}",
        "camera_id": camera.camera_id,
        "name": camera.name,
        "location": camera.location,
        "stream_url": camera.stream_url,
        "status": "active",
        "last_seen": datetime.utcnow(),
        "alerts_today": 0,
        "thumbnail": None,
    }
    db = get_db()
    if db is not None:
        await db.cameras.insert_one(new_cam)
    MOCK_CAMERAS.append(new_cam)
    logger.info(f"📷 Camera added: {camera.name}")
    return CameraResponse(**new_cam)


@router.patch("/{camera_id}/status")
async def update_camera_status(
    camera_id: str, status: CameraStatus,
    current_user: dict = Depends(get_current_user)
):
    """Update camera status."""
    for cam in MOCK_CAMERAS:
        if cam["camera_id"] == camera_id:
            cam["status"] = status.value
            return {"message": f"Camera {camera_id} status updated to {status.value}"}
    raise HTTPException(status_code=404, detail="Camera not found")


@router.delete("/{camera_id}")
async def delete_camera(camera_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a camera."""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    global MOCK_CAMERAS
    MOCK_CAMERAS = [c for c in MOCK_CAMERAS if c["camera_id"] != camera_id]
    return {"message": f"Camera {camera_id} deleted"}
