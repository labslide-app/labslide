from fastapi import APIRouter, Depends, HTTPException, status
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

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        group_id=user.group_id,
        created_at=user.created_at,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """用户注册（需要邀请码）"""
    # 检查邮箱是否已注册
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # 验证邀请码（可选，首个用户无需邀请码）
    group_id = None
    if data.invite_code:
        group = await get_group_by_invite_code(db, data.invite_code)
        if not group:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invite code")
        group_id = group.id

    # 创建用户
    user = await create_user(db, data.email, data.password, data.full_name, group_id)
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return TokenResponse(access_token=access_token, user=_user_to_response(user))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """用户登录"""
    user = await authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return TokenResponse(access_token=access_token, user=_user_to_response(user))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return _user_to_response(current_user)