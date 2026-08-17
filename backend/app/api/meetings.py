"""组会（Meeting）管理 API。"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User, UserRole
from app.models.meeting import Meeting
from app.models.presentation import Presentation
from app.schemas.meeting import (
    MeetingCreate, MeetingResponse, MeetingDetailResponse, MeetingDeleteResponse,
)
from app.schemas.presentation import PresentationListItem
from app.api.deps import get_current_user

router = APIRouter(prefix="/meetings", tags=["meetings"])


def _status_str(p: Presentation) -> str:
    return p.status.value if hasattr(p.status, "value") else str(p.status)


def _require_group(current_user: User) -> None:
    if current_user.group_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="你尚未加入任何课题组",
        )


async def _get_meeting_or_404(db: AsyncSession, meeting_id: uuid.UUID) -> Meeting:
    result = await db.execute(
        select(Meeting)
        .options(selectinload(Meeting.creator))
        .where(Meeting.id == meeting_id)
    )
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="组会不存在")
    return meeting


def _ensure_member(current_user: User, meeting: Meeting) -> None:
    if current_user.group_id is None or current_user.group_id != meeting.group_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="你不是该组会所属课题组的成员，无权操作",
        )


async def _meeting_to_response(db: AsyncSession, meeting: Meeting) -> MeetingResponse:
    count = await db.scalar(
        select(func.count()).select_from(Presentation).where(Presentation.meeting_id == meeting.id)
    )
    return MeetingResponse(
        id=meeting.id,
        group_id=meeting.group_id,
        title=meeting.title,
        meeting_date=meeting.meeting_date,
        created_by=meeting.created_by,
        creator_name=meeting.creator.full_name if meeting.creator else "未知",
        created_at=meeting.created_at,
        presentation_count=count or 0,
    )


async def _presentations_to_items(db: AsyncSession, meeting_id: uuid.UUID) -> list[PresentationListItem]:
    result = await db.execute(
        select(Presentation)
        .options(selectinload(Presentation.owner))
        .where(Presentation.meeting_id == meeting_id)
        .order_by(Presentation.created_at.desc())
    )
    return [
        PresentationListItem(
            id=p.id,
            meeting_id=p.meeting_id,
            owner_id=p.owner_id,
            owner_name=p.owner.full_name if p.owner else "未知",
            title=p.title,
            status=_status_str(p),
            created_at=p.created_at,
        )
        for p in result.scalars().all()
    ]


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    data: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """创建组会（课题组成员可创建）。"""
    _require_group(current_user)

    meeting = Meeting(
        group_id=current_user.group_id,
        title=data.title.strip(),
        meeting_date=data.meeting_date,
        created_by=current_user.id,
    )
    db.add(meeting)
    await db.flush()
    await db.refresh(meeting)

    # 重新加载带 creator 关系
    meeting = await _get_meeting_or_404(db, meeting.id)
    return await _meeting_to_response(db, meeting)


@router.get("", response_model=list[MeetingResponse])
async def list_meetings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """列出当前用户所属课题组的所有组会（按日期倒序）。"""
    _require_group(current_user)

    result = await db.execute(
        select(Meeting)
        .options(selectinload(Meeting.creator))
        .where(Meeting.group_id == current_user.group_id)
        .order_by(Meeting.meeting_date.desc(), Meeting.created_at.desc())
    )
    meetings = result.scalars().all()

    return [await _meeting_to_response(db, m) for m in meetings]


@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
async def get_meeting(
    meeting_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取组会详情（含该组会下的 PPT 列表）。"""
    meeting = await _get_meeting_or_404(db, meeting_id)
    _ensure_member(current_user, meeting)

    base = await _meeting_to_response(db, meeting)
    presentations = await _presentations_to_items(db, meeting_id)

    return MeetingDetailResponse(
        **base.model_dump(),
        presentations=presentations,
    )


@router.delete("/{meeting_id}", response_model=MeetingDeleteResponse)
async def delete_meeting(
    meeting_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """删除组会（仅创建者或管理员可操作）。"""
    meeting = await _get_meeting_or_404(db, meeting_id)
    _ensure_member(current_user, meeting)

    is_creator = meeting.created_by == current_user.id
    is_admin = current_user.role == UserRole.admin
    if not (is_creator or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="仅创建者或管理员可以删除组会",
        )

    await db.delete(meeting)
    await db.commit()

    return MeetingDeleteResponse(message="组会已删除")
