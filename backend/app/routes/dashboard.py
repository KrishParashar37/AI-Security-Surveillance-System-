"""Dashboard analytics routes."""
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
import random

from app.routes.auth import get_current_user

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get main dashboard statistics."""
    return {
        "total_cameras": 6,
        "active_cameras": 4,
        "offline_cameras": 1,
        "maintenance_cameras": 1,
        "total_alerts_today": 11,
        "critical_alerts": 3,
        "unacknowledged_alerts": 7,
        "suspicious_activities_detected": 47,
        "persons_detected_today": 312,
        "vehicles_detected_today": 89,
        "system_uptime": "7 days, 14 hours",
        "ai_model_accuracy": 94.7,
        "processing_fps": 24.3,
    }


@router.get("/activity-chart")
async def get_activity_chart(
    period: str = "24h",
    current_user: dict = Depends(get_current_user)
):
    """Get activity chart data for specified period."""
    now = datetime.utcnow()
    hours = 24 if period == "24h" else 168 if period == "7d" else 720

    data = []
    for i in range(min(hours, 24)):
        timestamp = (now - timedelta(hours=hours - i)).isoformat()
        data.append({
            "timestamp": timestamp,
            "label": f"{(now - timedelta(hours=hours - i)).strftime('%H:00')}",
            "alerts": random.randint(0, 8),
            "persons": random.randint(5, 45),
            "vehicles": random.randint(0, 12),
            "suspicious": random.randint(0, 4),
        })
    return {"period": period, "data": data}


@router.get("/heatmap")
async def get_activity_heatmap(current_user: dict = Depends(get_current_user)):
    """Get activity heatmap by camera zone."""
    zones = [
        {"zone": "Main Entrance", "camera_id": "cam_001", "activity_score": 87, "lat": 28.6, "lng": 77.2},
        {"zone": "Parking Lot A", "camera_id": "cam_002", "activity_score": 64, "lat": 28.61, "lng": 77.21},
        {"zone": "Server Room", "camera_id": "cam_003", "activity_score": 23, "lat": 28.62, "lng": 77.22},
        {"zone": "Lobby", "camera_id": "cam_004", "activity_score": 91, "lat": 28.63, "lng": 77.23},
        {"zone": "Warehouse", "camera_id": "cam_005", "activity_score": 55, "lat": 28.64, "lng": 77.24},
        {"zone": "Rooftop", "camera_id": "cam_006", "activity_score": 12, "lat": 28.65, "lng": 77.25},
    ]
    return zones


@router.get("/recent-events")
async def get_recent_events(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get recent detection events feed."""
    activities = ["fighting", "theft", "trespassing", "loitering", "crowd_violence",
                  "unauthorized_entry", "normal", "normal", "normal"]
    cameras = ["Main Entrance", "Parking Lot A", "Server Room", "Lobby Camera", "Warehouse Entry"]
    events = []
    for i in range(limit):
        activity = random.choice(activities)
        events.append({
            "id": f"evt_{i:03d}",
            "camera": random.choice(cameras),
            "activity": activity,
            "confidence": round(random.uniform(0.65, 0.99), 2),
            "objects": random.sample(["person", "vehicle", "bag"], k=random.randint(1, 3)),
            "timestamp": (datetime.utcnow() - timedelta(minutes=i * 3)).isoformat(),
            "is_suspicious": activity != "normal",
        })
    return events


@router.get("/performance")
async def get_system_performance(current_user: dict = Depends(get_current_user)):
    """Get system performance metrics."""
    return {
        "cpu_usage": round(random.uniform(30, 65), 1),
        "gpu_usage": round(random.uniform(45, 80), 1),
        "memory_usage": round(random.uniform(40, 70), 1),
        "fps_per_camera": {
            "cam_001": round(random.uniform(22, 30), 1),
            "cam_002": round(random.uniform(22, 30), 1),
            "cam_003": round(random.uniform(22, 30), 1),
            "cam_004": 0.0,
            "cam_005": round(random.uniform(22, 30), 1),
            "cam_006": 0.0,
        },
        "model_inference_ms": round(random.uniform(28, 65), 1),
        "alerts_per_hour": round(random.uniform(2, 8), 1),
    }
