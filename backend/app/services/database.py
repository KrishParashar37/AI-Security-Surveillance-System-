"""Database connection and management using Motor (async MongoDB driver)."""
from motor.motor_asyncio import AsyncIOMotorClient
from loguru import logger
from app.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Connect to MongoDB."""
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGO_URI)
        db = client[settings.DB_NAME]
        # Ping to verify connection
        await client.admin.command("ping")
        logger.success(f"✅ Connected to MongoDB: {settings.DB_NAME}")

        # Create indexes
        await db.users.create_index("email", unique=True)
        await db.alerts.create_index([("timestamp", -1)])
        await db.cameras.create_index("camera_id", unique=True)
        await db.detection_logs.create_index([("timestamp", -1)])
    except Exception as e:
        logger.warning(f"⚠️ MongoDB not available: {e}. Running with mock data.")


async def disconnect_db():
    """Disconnect from MongoDB."""
    global client
    if client:
        client.close()
        logger.info("🔌 Disconnected from MongoDB")


def get_db():
    """Get database instance."""
    return db
