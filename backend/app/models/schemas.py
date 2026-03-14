"""Pydantic models for data validation and serialization."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ─── Enums ───────────────────────────────────────────────────────────────────

class ActivityType(str, Enum):
    FIGHTING = "fighting"
    THEFT = "theft"
    TRESPASSING = "trespassing"
    LOITERING = "loitering"
    CROWD_VIOLENCE = "crowd_violence"
    UNAUTHORIZED_ENTRY = "unauthorized_entry"
    WEAPON_DETECTED = "weapon_detected"
    NORMAL = "normal"


class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class CameraStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"


# ─── User Models ─────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "viewer"
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_active: bool = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Camera Models ────────────────────────────────────────────────────────────

class CameraBase(BaseModel):
    name: str
    location: str
    stream_url: str
    camera_id: str


class CameraCreate(CameraBase):
    pass


class CameraResponse(CameraBase):
    id: str
    status: CameraStatus = CameraStatus.ACTIVE
    last_seen: Optional[datetime] = None
    alerts_today: int = 0
    thumbnail: Optional[str] = None


# ─── Detection & Alert Models ─────────────────────────────────────────────────

class DetectionResult(BaseModel):
    camera_id: str
    activity_type: ActivityType
    confidence: float = Field(ge=0.0, le=1.0)
    objects_detected: List[str] = []
    bounding_boxes: List[Dict[str, Any]] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    snapshot_path: Optional[str] = None


class AlertBase(BaseModel):
    camera_id: str
    camera_name: str
    location: str
    activity_type: ActivityType
    severity: AlertSeverity
    confidence: float
    description: str
    snapshot_url: Optional[str] = None


class AlertCreate(AlertBase):
    pass


class AlertResponse(AlertBase):
    id: str
    timestamp: datetime
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None


# ─── Dashboard Models ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_cameras: int
    active_cameras: int
    total_alerts_today: int
    critical_alerts: int
    suspicious_activities_detected: int
    system_uptime: str
    recent_alerts: List[AlertResponse]


# ─── Notification Models ──────────────────────────────────────────────────────

class NotificationRequest(BaseModel):
    alert_id: str
    channels: List[str] = ["email"]
    recipient_email: Optional[EmailStr] = None
    recipient_phone: Optional[str] = None


class FrameAnalysisRequest(BaseModel):
    camera_id: str
    frame_base64: str  # base64 encoded image frame
