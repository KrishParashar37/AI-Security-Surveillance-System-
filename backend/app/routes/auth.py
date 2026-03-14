"""Authentication routes - login, register, token management."""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from loguru import logger
import uuid

from app.models.schemas import UserCreate, UserLogin, UserResponse, Token
from app.services.database import get_db
from app.config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Mock users for demo (when DB is unavailable)
MOCK_USERS = {
    "admin@surveillance.com": {
        "id": "usr_001",
        "email": "admin@surveillance.com",
        "name": "Admin User",
        "role": "admin",
        "phone": "+1234567890",
        "password_hash": pwd_context.hash("admin123"),
        "created_at": datetime(2024, 1, 1),
        "is_active": True,
    }
}


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.JWT_EXPIRY_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return {"email": email, "role": payload.get("role", "viewer")}
    except JWTError:
        raise credentials_exception


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user: UserCreate):
    """Register a new user."""
    db = get_db()
    if db is None:
        # Mock registration
        if user.email in MOCK_USERS:
            raise HTTPException(status_code=400, detail="Email already registered")
        new_user = {
            "id": f"usr_{uuid.uuid4().hex[:6]}",
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "phone": user.phone,
            "created_at": datetime.utcnow(),
            "is_active": True,
        }
        MOCK_USERS[user.email] = new_user
        return UserResponse(**new_user)

    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = {
        "id": f"usr_{uuid.uuid4().hex[:6]}",
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "phone": user.phone,
        "password_hash": pwd_context.hash(user.password),
        "created_at": datetime.utcnow(),
        "is_active": True,
    }
    await db.users.insert_one(new_user)
    return UserResponse(**{k: v for k, v in new_user.items() if k != "password_hash"})


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with email/password. Auto-creates user if not exists for easy development."""
    db = get_db()
    user_data = None

    if db is None:
        user_data = MOCK_USERS.get(form_data.username)
    else:
        user_data = await db.users.find_one({"email": form_data.username})

    # If user doesn't exist, create them on the fly (Auto-Registration)
    if not user_data:
        logger.info(f"🆕 Creation on login: {form_data.username}")
        user_data = {
            "id": f"usr_{uuid.uuid4().hex[:6]}",
            "email": form_data.username,
            "name": form_data.username.split('@')[0].capitalize(),
            "role": "admin" if "admin" in form_data.username or not MOCK_USERS else "viewer",
            "phone": "",
            "password_hash": pwd_context.hash(form_data.password),
            "created_at": datetime.utcnow(),
            "is_active": True,
        }
        if db is not None:
            await db.users.insert_one(user_data)
        else:
            MOCK_USERS[form_data.username] = user_data
    
    # If user exists, but password doesn't match (and it wasn't just created)
    elif not pwd_context.verify(form_data.password, user_data.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user_data["email"], "role": user_data["role"]})
    user_resp = UserResponse(
        id=user_data["id"], email=user_data["email"], name=user_data["name"],
        role=user_data["role"], phone=user_data.get("phone"),
        created_at=user_data["created_at"], is_active=user_data.get("is_active", True)
    )
    logger.info(f"✅ Login Successful: {user_data['email']}")
    return Token(access_token=token, user=user_resp)


@router.post("/demo-login", response_model=Token)
async def demo_login():
    """Login with demo credentials (no password required)."""
    user_data = MOCK_USERS["admin@surveillance.com"]
    token = create_access_token({"sub": user_data["email"], "role": user_data["role"]})
    user_resp = UserResponse(
        id=user_data["id"], email=user_data["email"], name=user_data["name"],
        role=user_data["role"], phone=user_data.get("phone"),
        created_at=user_data["created_at"], is_active=True
    )
    return Token(access_token=token, user=user_resp)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current logged in user."""
    db = get_db()
    email = current_user["email"]
    if db is None:
        user_data = MOCK_USERS.get(email)
    else:
        user_data = await db.users.find_one({"email": email})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**{k: v for k, v in user_data.items() if k != "password_hash"})
