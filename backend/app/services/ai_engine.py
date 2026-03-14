"""AI Detection Engine - Core ML service."""
import random
import numpy as np
from datetime import datetime
from typing import Dict, Any, List
from loguru import logger


class AIDetectionEngine:
    """
    AI Detection Engine that wraps ML models for surveillance analysis.
    
    In production this would load actual YOLO/PyTorch models.
    Currently uses simulation for demo purposes.
    """

    ACTIVITY_TYPES = [
        "normal", "normal", "normal", "normal",  # weighted towards normal
        "loitering", "trespassing", "theft", "fighting",
        "crowd_violence", "unauthorized_entry", "weapon_detected"
    ]

    OBJECT_CLASSES = ["person", "vehicle", "motorcycle", "bag", "weapon", "knife"]

    SEVERITY_MAP = {
        "normal": "low",
        "loitering": "medium",
        "trespassing": "high",
        "theft": "high",
        "fighting": "critical",
        "crowd_violence": "critical",
        "unauthorized_entry": "high",
        "weapon_detected": "critical",
    }

    def __init__(self):
        self.model_loaded = False
        self.model_name = "YOLOv8n (Simulated)"
        self._try_load_model()

    def _try_load_model(self):
        """Try to load the actual YOLO model, fallback to simulation."""
        try:
            from ultralytics import YOLO
            # In production: self.model = YOLO('ai_models/yolov8n.pt')
            # For now simulate
            self.model_loaded = False  # Set to True when real model loaded
            logger.info("🤖 AI Engine ready (simulation mode)")
        except ImportError:
            logger.warning("⚠️ ultralytics not installed - using simulation mode")
            self.model_loaded = False

    def get_model_status(self) -> Dict[str, Any]:
        """Return current model status."""
        return {
            "model_name": self.model_name,
            "loaded": self.model_loaded,
            "mode": "simulation" if not self.model_loaded else "production",
            "supported_activities": self.ACTIVITY_TYPES,
            "confidence_threshold": 0.5,
            "framework": "PyTorch + Ultralytics YOLOv8",
            "device": "CPU (simulation)",
        }

    def simulate_detection(self, camera_id: str) -> Dict[str, Any]:
        """Simulate real-time detection result for a camera."""
        activity = random.choice(self.ACTIVITY_TYPES)
        is_suspicious = activity != "normal"

        objects_detected = ["person"] if is_suspicious else []
        if random.random() > 0.6:
            objects_detected.append(random.choice(["vehicle", "bag", "motorcycle"]))

        # Generate fake bounding boxes
        bboxes = []
        for _ in objects_detected:
            x1 = random.randint(50, 300)
            y1 = random.randint(50, 200)
            bboxes.append({
                "x1": x1, "y1": y1,
                "x2": x1 + random.randint(50, 100),
                "y2": y1 + random.randint(100, 200),
                "class": random.choice(self.OBJECT_CLASSES),
                "confidence": round(random.uniform(0.65, 0.99), 2)
            })

        return {
            "camera_id": camera_id,
            "activity_type": activity,
            "confidence": round(random.uniform(0.70, 0.98), 2) if is_suspicious else round(random.uniform(0.50, 0.80), 2),
            "objects_detected": objects_detected,
            "bounding_boxes": bboxes,
            "timestamp": datetime.utcnow().isoformat(),
            "is_suspicious": is_suspicious,
            "severity": self.SEVERITY_MAP.get(activity, "low"),
            "frame_id": random.randint(1000, 9999),
            "snapshot_path": f"/snapshots/{camera_id}_latest.jpg" if is_suspicious else None,
        }

    def analyze_frame(self, camera_id: str, frame_array: np.ndarray) -> Dict[str, Any]:
        """Analyze a video frame using AI model."""
        if self.model_loaded:
            # Production: results = self.model(frame_array)
            pass
        # Fallback simulation
        return self.simulate_detection(camera_id)

    def analyze_behavior(self, tracks: List[Dict]) -> str:
        """Analyze tracked movements for behavior classification."""
        if not tracks:
            return "normal"
        # Simple heuristic: if many objects or fast movement
        if len(tracks) > 5:
            return random.choice(["crowd_violence", "normal"])
        return random.choice(self.ACTIVITY_TYPES)
