import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    GroupCreate, GroupJoin, GroupResponse, GroupMemberResponse, MessageResponse,
    GroupDetailResponse, TransferGroupRequest,
)
from app.services.auth import (
    create_group, get_group_by_invite_code, get_group_members, get_group_by_id,
    count_group_members, get_user_by_id,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/groups", tags=["groups"])


def _group_to_response(group) -> GroupResponse:
    return GroupResponse(
        id=group.id,
        name=group.name,
        invite_code=group.invite_code,
        created_by=group.created_by,
        created_at=group.created_at,
    )


@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_new_group(
    data: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """创建课题组（创建者自动成为 admin）"""
    # 检查用户是否已有课题组
    if current_user.group_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already in a group",
        )

    group = await create_group(db, data.name, current_user.id)

    # 将创建者设为 admin 并加入课题组
    current_user.role = UserRole.admin
    current_user.group_id = group.id
    await db.flush()

    return _group_to_response(group)


@router.post("/join", response_model=GroupDetailResponse)
async def join_group(
    data: GroupJoin,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """通过邀请码加入课题组。返回课题组详情。"""
    # 用户已加入课题组
    if current_user.group_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="你已加入课题组，不能重复加入",
        )

    # 邀请码基本校验（至少要有内容）
    invite_code = data.invite_code.strip()
    if len(invite_code) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邀请码格式错误，至少需要 4 个字符",
        )

    group = await get_group_by_invite_code(db, invite_code)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邀请码无效，请检查后重试",
        )

    current_user.group_id = group.id
    await db.flush()

    # 返回课题组详情
    creator = await get_user_by_id(db, group.created_by)
    member_count = await count_group_members(db, group.id)

    return GroupDetailResponse(
        id=group.id,
        name=group.name,
        invite_code=group.invite_code if current_user.id == group.created_by else "",
        created_by=group.created_by,
        creator_name=creator.full_name if creator else "未知",
        created_at=group.created_at,
        member_count=member_count,
    )


@router.get("/my", response_model=GroupResponse)
async def get_my_group(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取当前用户所属课题组信息"""
    if current_user.group_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not in a group",
        )

    group = await get_group_by_id(db, current_user.group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    return _group_to_response(group)


@router.get("/members", response_model=list[GroupMemberResponse])
async def list_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取课题组成员列表（所有课题组成员可查看）。"""
    if current_user.group_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="你尚未加入任何课题组",
        )

    members = await get_group_members(db, current_user.group_id)
    return [
        GroupMemberResponse(
            id=m.id,
            email=m.email,
            full_name=m.full_name,
            role=m.role.value if hasattr(m.role, "value") else str(m.role),
            created_at=m.created_at,
        )
        for m in members
    ]


@router.delete("/leave", response_model=MessageResponse)
async def leave_group(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """普通成员退出课题组。"""
    if current_user.group_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="你尚未加入任何课题组",
        )

    group = await get_group_by_id(db, current_user.group_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课题组不存在")

    # 创建者不能退出，只能解散或转让
    if current_user.id == group.created_by:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="创建者不能退出课题组，请先转让或解散课题组",
        )

    current_user.group_id = None
    current_user.role = UserRole.student
    await db.flush()

    return MessageResponse(message="已退出课题组")


@router.delete("/{group_id}", response_model=MessageResponse)
async def dissolve_group(
    group_id: _uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """解散课题组（仅创建者可操作）。"""
    if current_user.group_id is None or current_user.group_id != group_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="你无权操作该课题组",
        )

    group = await get_group_by_id(db, group_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课题组不存在")

    if current_user.id != group.created_by:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅创建者可以解散课题组",
        )

    # 将所有成员移出课题组
    members = await get_group_members(db, group_id)
    for member in members:
        member.group_id = None
        member.role = UserRole.student

    await db.flush()

    # 级联删除关联的组会和 PPT
    from app.models.meeting import Meeting
    from app.models.presentation import Presentation
    from app.models.annotation import Annotation

    meetings_result = await db.execute(select(Meeting).where(Meeting.group_id == group_id))
    for meeting in meetings_result.scalars().all():
        pres_result = await db.execute(select(Presentation).where(Presentation.meeting_id == meeting.id))
        for pres in pres_result.scalars().all():
            ann_result = await db.execute(select(Annotation).where(Annotation.presentation_id == pres.id))
            for ann in ann_result.scalars().all():
                await db.delete(ann)
            await db.delete(pres)
        await db.delete(meeting)

    await db.flush()
    await db.delete(group)
    await db.commit()

    return MessageResponse(message="课题组已解散")


@router.post("/{group_id}/transfer", response_model=GroupDetailResponse)
async def transfer_group(
    group_id: _uuid.UUID,
    data: TransferGroupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """转让课题组给指定成员（仅创建者可操作）。"""
    if current_user.group_id is None or current_user.group_id != group_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="你无权操作该课题组",
        )

    group = await get_group_by_id(db, group_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课题组不存在")

    if current_user.id != group.created_by:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅创建者可以转让课题组",
        )

    if data.new_owner_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能转让给自己",
        )

    # 验证新 owner 是否在同一课题组
    new_owner = await get_user_by_id(db, data.new_owner_id)
    if not new_owner or new_owner.group_id != group_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="目标用户不在该课题组中",
        )

    # 转让：更新 created_by，提升新 owner 为 admin
    group.created_by = new_owner.id
    new_owner.role = UserRole.admin
    # 原创建者降级为普通成员
    current_user.role = UserRole.student
    await db.flush()

    # 返回更新后的课题组详情
    member_count = await count_group_members(db, group.id)
    return GroupDetailResponse(
        id=group.id,
        name=group.name,
        invite_code=group.invite_code if new_owner.id == group.created_by else "",
        created_by=group.created_by,
        creator_name=new_owner.full_name,
        created_at=group.created_at,
        member_count=member_count,
    )


@router.get("/{group_id}", response_model=GroupDetailResponse)
async def get_group_detail(
    group_id: _uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取课题组详情（需为课题组成员）。"""
    # 只有课题组成员可查看
    if current_user.group_id is None or current_user.group_id != group_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="你无权查看该课题组信息",
        )

    group = await get_group_by_id(db, group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="课题组不存在",
        )

    creator = await get_user_by_id(db, group.created_by)
    member_count = await count_group_members(db, group.id)

    # 仅创建者和管理员可见完整邀请码
    is_admin = current_user.role == UserRole.admin or current_user.id == group.created_by

    return GroupDetailResponse(
        id=group.id,
        name=group.name,
        invite_code=group.invite_code if is_admin else "",
        created_by=group.created_by,
        creator_name=creator.full_name if creator else "未知",
        created_at=group.created_at,
        member_count=member_count,
    )