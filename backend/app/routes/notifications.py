"""Notification routes - email, SMS alerts."""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from loguru import logger
from datetime import datetime

from app.models.schemas import NotificationRequest
from app.routes.auth import get_current_user

router = APIRouter()

# Mock notification log
NOTIFICATION_LOG = []


async def send_email_notification(alert_id: str, recipient: str, alert_info: dict):
    """Background task to send email notification."""
    logger.info(f"📧 [MOCK] Sending email to {recipient} for alert {alert_id}")
    # In production: use smtplib or sendgrid/mailgun API
    NOTIFICATION_LOG.append({
        "type": "email",
        "recipient": recipient,
        "alert_id": alert_id,
        "status": "sent",
        "timestamp": datetime.utcnow().isoformat()
    })


async def send_sms_notification(alert_id: str, phone: str, message: str):
    """Background task to send SMS notification via Twilio."""
    logger.info(f"📱 [MOCK] Sending SMS to {phone} for alert {alert_id}")
    # In production: use twilio.rest.Client
    NOTIFICATION_LOG.append({
        "type": "sms",
        "recipient": phone,
        "alert_id": alert_id,
        "status": "sent",
        "timestamp": datetime.utcnow().isoformat()
    })


@router.post("/send")
async def send_notification(
    request: NotificationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Send notification for a specific alert."""
    alert_info = {"alert_id": request.alert_id, "severity": "high"}

    tasks_queued = []
    if "email" in request.channels and request.recipient_email:
        background_tasks.add_task(
            send_email_notification,
            request.alert_id, request.recipient_email, alert_info
        )
        tasks_queued.append("email")

    if "sms" in request.channels and request.recipient_phone:
        background_tasks.add_task(
            send_sms_notification,
            request.alert_id, request.recipient_phone,
            f"ALERT: Suspicious activity detected! Alert ID: {request.alert_id}"
        )
        tasks_queued.append("sms")

    return {
        "message": "Notifications queued",
        "channels": tasks_queued,
        "alert_id": request.alert_id
    }


@router.get("/log")
async def get_notification_log(current_user: dict = Depends(get_current_user)):
    """Get notification history."""
    return {
        "total": len(NOTIFICATION_LOG),
        "log": sorted(NOTIFICATION_LOG, key=lambda x: x["timestamp"], reverse=True)[:50]
    }


@router.post("/test")
async def test_notification(
    channel: str = "email",
    recipient: str = "test@example.com",
    current_user: dict = Depends(get_current_user)
):
    """Send a test notification."""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    logger.info(f"🧪 Test {channel} notification sent to {recipient}")
    return {"message": f"Test {channel} notification sent to {recipient}", "status": "ok"}
