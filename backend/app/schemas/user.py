from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ==================== 通用 ====================
class MessageResponse(BaseModel):
    message: str


# ==================== 认证 ====================
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=100)
    invite_code: str = Field(default="", max_length=64)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    group_id: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==================== 课题组 ====================
class GroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)


class GroupJoin(BaseModel):
    invite_code: str = Field(..., min_length=1, max_length=64)


class GroupResponse(BaseModel):
    id: UUID
    name: str
    invite_code: str
    created_by: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupMemberResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupDetailResponse(BaseModel):
    """课题组详情（含成员数、创建者姓名、邀请码权限控制）"""
    id: UUID
    name: str
    invite_code: str  # 仅 admin 可见完整码，普通成员为空
    created_by: UUID
    creator_name: str
    created_at: datetime
    member_count: int

    model_config = {"from_attributes": True}


class TransferGroupRequest(BaseModel):
    """转让课题组请求"""
    new_owner_id: UUID