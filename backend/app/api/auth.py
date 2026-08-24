from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegister, UserLogin, UserResponse, TokenResponse, MessageResponse,
)
from app.services.auth import (
    get_user_by_email, create_user, authenticate_user, get_group_by_invite_code,
)
from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        group_id=user.group_id,
        created_at=user.created_at,
    )


def _set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.ENV == "production",
        samesite="lax",
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, response: Response, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    group_id = None
    if data.invite_code:
        group = await get_group_by_invite_code(db, data.invite_code)
        if not group:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invite code")
        group_id = group.id

    user = await create_user(db, data.email, data.password, data.full_name, group_id)
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    _set_auth_cookie(response, access_token)
    return TokenResponse(access_token=access_token, user=_user_to_response(user))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    _set_auth_cookie(response, access_token)
    return TokenResponse(access_token=access_token, user=_user_to_response(user))


@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return MessageResponse(message="Logged out")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return _user_to_response(current_user)
