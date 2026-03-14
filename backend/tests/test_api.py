"""Tests for the AI Security Surveillance System backend."""
import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "online"


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_demo_login():
    """Test demo login endpoint."""
    response = client.post("/api/auth/demo-login")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "user" in data
    assert data["user"]["email"] == "admin@surveillance.com"


def test_get_cameras_without_auth():
    """Test cameras endpoint returns 401 without auth."""
    response = client.get("/api/cameras/")
    assert response.status_code == 401


def test_get_cameras_with_auth():
    """Test cameras endpoint with valid auth token."""
    # Get token first
    login_resp = client.post("/api/auth/demo-login")
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/cameras/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    cameras = response.json()
    assert isinstance(cameras, list)
    assert len(cameras) > 0


def test_get_alerts_with_auth():
    """Test alerts endpoint with auth."""
    login_resp = client.post("/api/auth/demo-login")
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/alerts/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)


def test_dashboard_stats():
    """Test dashboard stats endpoint."""
    login_resp = client.post("/api/auth/demo-login")
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/dashboard/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    stats = response.json()
    assert "total_cameras" in stats
    assert "total_alerts_today" in stats


def test_simulate_detection():
    """Test AI detection simulation endpoint."""
    login_resp = client.post("/api/auth/demo-login")
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/detection/simulate/cam_001",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    result = response.json()
    assert "camera_id" in result
    assert "activity_type" in result
    assert "confidence" in result


def test_alert_stats():
    """Test alert statistics endpoint."""
    login_resp = client.post("/api/auth/demo-login")
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/alerts/stats/summary",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    stats = response.json()
    assert "total" in stats
    assert "critical" in stats


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
