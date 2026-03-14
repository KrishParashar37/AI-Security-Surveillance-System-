"""Alerts management routes."""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import random

from app.models.schemas import AlertCreate, AlertResponse, AlertSeverity, ActivityType
from app.services.database import get_db
from app.routes.auth import get_current_user

router = APIRouter()

# Generate mock alerts
def _make_alert(i, activity, severity, camera_name, location, desc, minutes_ago):
    return {
        "id": f"alert_{uuid.uuid4().hex[:8]}",
        "camera_id": f"cam_00{(i % 6) + 1}",
        "camera_name": camera_name,
        "location": location,
        "activity_type": activity,
        "severity": severity,
        "confidence": round(random.uniform(0.72, 0.98), 2),
        "description": desc,
        "snapshot_url": f"/snapshots/alert_{i}.jpg",
        "timestamp": (datetime.utcnow() - timedelta(minutes=minutes_ago)).isoformat(),
        "acknowledged": i % 3 == 0,
        "acknowledged_by": "admin@surveillance.com" if i % 3 == 0 else None,
    }

MOCK_ALERTS = [
    _make_alert(1, "fighting", "critical", "Main Entrance", "Building A - Gate 1",
                "Two individuals engaged in physical altercation detected near entrance", 5),
    _make_alert(2, "theft", "high", "Parking Lot A", "Parking Zone A",
                "Suspicious individual attempting to break into vehicle", 12),
    _make_alert(3, "trespassing", "high", "Server Room", "Building B - Floor 2",
                "Unauthorized person detected in restricted server room area", 28),
    _make_alert(4, "loitering", "medium", "Lobby Camera", "Building A - Lobby",
                "Person loitering in lobby for extended period (>15 minutes)", 45),
    _make_alert(5, "unauthorized_entry", "critical", "Warehouse Entry", "Warehouse - Gate",
                "Breach detected: unauthorized entry through emergency exit", 62),
    _make_alert(6, "crowd_violence", "high", "Main Entrance", "Building A - Gate 1",
                "Crowd disturbance detected involving 5+ individuals", 80),
    _make_alert(7, "loitering", "low", "Parking Lot A", "Parking Zone A",
                "Unidentified vehicle parked for extended duration", 120),
    _make_alert(8, "trespassing", "medium", "Rooftop View", "Rooftop - North",
                "Unauthorized access to rooftop area detected", 180),
    _make_alert(9, "theft", "high", "Lobby Camera", "Building A - Lobby",
                "Shoplifting behavior detected near display area", 240),
    _make_alert(10, "weapon_detected", "critical", "Main Entrance", "Building A - Gate 1",
                "Potential weapon detected on individual entering premises", 300),
]


@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    limit: int = Query(50, le=200),
    severity: Optional[AlertSeverity] = None,
    acknowledged: Optional[bool] = None,
    camera_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all alerts with optional filters."""
    alerts = MOCK_ALERTS.copy()
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity.value]
    if acknowledged is not None:
        alerts = [a for a in alerts if a["acknowledged"] == acknowledged]
    if camera_id:
        alerts = [a for a in alerts if a["camera_id"] == camera_id]
    return [AlertResponse(**a) for a in alerts[:limit]]


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    """Get alert by ID."""
    alert = next((a for a in MOCK_ALERTS if a["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return AlertResponse(**alert)


@router.post("/", response_model=AlertResponse, status_code=201)
async def create_alert(alert: AlertCreate, current_user: dict = Depends(get_current_user)):
    """Create a new alert (called by detection engine)."""
    new_alert = {
        "id": f"alert_{uuid.uuid4().hex[:8]}",
        **alert.dict(),
        "timestamp": datetime.utcnow().isoformat(),
        "acknowledged": False,
        "acknowledged_by": None,
    }
    MOCK_ALERTS.insert(0, new_alert)
    return AlertResponse(**new_alert)


@router.patch("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    """Acknowledge an alert."""
    for alert in MOCK_ALERTS:
        if alert["id"] == alert_id:
            alert["acknowledged"] = True
            alert["acknowledged_by"] = current_user["email"]
            return {"message": "Alert acknowledged", "alert_id": alert_id}
    raise HTTPException(status_code=404, detail="Alert not found")


@router.delete("/{alert_id}")
async def delete_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an alert."""
    global MOCK_ALERTS
    MOCK_ALERTS = [a for a in MOCK_ALERTS if a["id"] != alert_id]
    return {"message": "Alert deleted"}


@router.get("/stats/summary")
async def get_alert_stats(current_user: dict = Depends(get_current_user)):
    """Get alert statistics."""
    today = datetime.utcnow()
    return {
        "total": len(MOCK_ALERTS),
        "critical": sum(1 for a in MOCK_ALERTS if a["severity"] == "critical"),
        "high": sum(1 for a in MOCK_ALERTS if a["severity"] == "high"),
        "medium": sum(1 for a in MOCK_ALERTS if a["severity"] == "medium"),
        "low": sum(1 for a in MOCK_ALERTS if a["severity"] == "low"),
        "unacknowledged": sum(1 for a in MOCK_ALERTS if not a["acknowledged"]),
        "by_type": {
            "fighting": sum(1 for a in MOCK_ALERTS if a["activity_type"] == "fighting"),
            "theft": sum(1 for a in MOCK_ALERTS if a["activity_type"] == "theft"),
            "trespassing": sum(1 for a in MOCK_ALERTS if a["activity_type"] == "trespassing"),
            "loitering": sum(1 for a in MOCK_ALERTS if a["activity_type"] == "loitering"),
            "unauthorized_entry": sum(1 for a in MOCK_ALERTS if a["activity_type"] == "unauthorized_entry"),
        }
    }
