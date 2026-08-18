"""PPT 上传、查看与批注 API。

无服务端转换：上传仅保存原始文件，查看时由浏览器端解包渲染。
批注直接挂在「PPT + 页码」上，课题组成员可互相查看与批注。
"""
import logging
import re
import uuid
from pathlib import Path

from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File,
)
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User, UserRole
from app.models.meeting import Meeting
from app.models.presentation import Presentation, PresentationStatus
from app.models.annotation import Annotation
from app.schemas.presentation import (
    PresentationResponse,
    PresentationListItem,
    PresentationUploadResponse,
    AnnotationCreate,
    AnnotationResponse,
)
from app.api.deps import get_current_user
from app.services.storage_service import upload_bytes, read_file

logger = logging.getLogger(__name__)
router = APIRouter(tags=["presentations"])

ALLOWED_EXTENSIONS = {".pptx", ".ppt"}
ALLOWED_MIME_TYPES = {
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint",
    "application/octet-stream",
}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
DB_FILE_MAX = 50 * 1024 * 1024     # 50MB 以内存入数据库保证持久化


def _status_str(pres: Presentation) -> str:
    return pres.status.value if hasattr(pres.status, "value") else str(pres.status)


async def _get_meeting_or_404(db: AsyncSession, meeting_id: uuid.UUID) -> Meeting:
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="组会不存在")
    return meeting


def _ensure_group_member(current_user: User, meeting: Meeting) -> None:
    if current_user.group_id is None or current_user.group_id != meeting.group_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="你不是该组会所属课题组的成员，无权操作",
        )


async def _get_presentation_or_404(db: AsyncSession, presentation_id: uuid.UUID) -> Presentation:
    result = await db.execute(
        select(Presentation)
        .options(
            selectinload(Presentation.meeting),
            selectinload(Presentation.owner),
            selectinload(Presentation.annotations).selectinload(Annotation.user),
        )
        .where(Presentation.id == presentation_id)
    )
    presentation = result.scalar_one_or_none()
    if not presentation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PPT 不存在")
    return presentation


def _sanitize_filename(filename: str) -> str:
    name = Path(filename).name
    stem, ext = Path(name).stem, Path(name).suffix
    stem = re.sub(r"[^A-Za-z0-9._-]", "_", stem) or "file"
    return f"{stem}{ext}"


async def _read_limited(file: UploadFile, limit: int) -> bytes:
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > limit:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"文件大小超过限制（{limit // 1024 // 1024}MB）",
            )
        chunks.append(chunk)
    return b"".join(chunks)


def _annotation_to_response(ann: Annotation) -> AnnotationResponse:
    return AnnotationResponse(
        id=ann.id,
        presentation_id=ann.presentation_id,
        page_number=ann.page_number,
        user_id=ann.user_id,
        user_name=ann.user.full_name if ann.user else "未知",
        content=ann.content,
        created_at=ann.created_at,
    )


# ==================== 上传 ====================

@router.post(
    "/meetings/{meeting_id}/presentations",
    response_model=PresentationUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_presentation(
    meeting_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """上传 PPT/PPTX 到指定组会（不转换，仅保存原始文件）。"""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="文件名不能为空")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="仅支持 .pptx 和 .ppt 文件")

    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"不支持的文件类型：{file.content_type}")

    meeting = await _get_meeting_or_404(db, meeting_id)
    _ensure_group_member(current_user, meeting)

    content = await _read_limited(file, MAX_FILE_SIZE)

    presentation_id = uuid.uuid4()
    title = Path(file.filename).stem
    object_name = f"presentations/{presentation_id}/original/{_sanitize_filename(file.filename)}"

    # 先上传文件到存储，再写数据库记录
    await upload_bytes(content, object_name, content_type=file.content_type)

    presentation = Presentation(
        id=presentation_id,
        meeting_id=meeting_id,
        owner_id=current_user.id,
        title=title,
        file_path=object_name,
        status=PresentationStatus.ready,
        file_data=content if len(content) <= DB_FILE_MAX else None,
        file_size=len(content),
    )
    db.add(presentation)
    await db.commit()
    await db.refresh(presentation)

    return PresentationUploadResponse(
        id=presentation.id,
        meeting_id=meeting_id,
        owner_id=current_user.id,
        title=title,
        status="ready",
    )


# ==================== 会议下的 PPT 列表 ====================

@router.get("/meetings/{meeting_id}/presentations", response_model=list[PresentationListItem])
async def list_meeting_presentations(
    meeting_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    meeting = await _get_meeting_or_404(db, meeting_id)
    _ensure_group_member(current_user, meeting)

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


# ==================== 详情（含批注） ====================

@router.get("/presentations/{presentation_id}", response_model=PresentationResponse)
async def get_presentation(
    presentation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    presentation = await _get_presentation_or_404(db, presentation_id)
    _ensure_group_member(current_user, presentation.meeting)

    annotations = sorted(presentation.annotations, key=lambda a: (a.page_number, a.created_at))
    return PresentationResponse(
        id=presentation.id,
        meeting_id=presentation.meeting_id,
        owner_id=presentation.owner_id,
        owner_name=presentation.owner.full_name if presentation.owner else "未知",
        title=presentation.title,
        status=_status_str(presentation),
        created_at=presentation.created_at,
        annotations=[_annotation_to_response(a) for a in annotations],
    )


# ==================== 原始文件（浏览器端渲染用） ====================

@router.get("/presentations/{presentation_id}/file")
async def get_presentation_file(
    presentation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    presentation = await _get_presentation_or_404(db, presentation_id)
    _ensure_group_member(current_user, presentation.meeting)

    # 优先从数据库读取（持久化存储），回退到文件系统
    stmt = select(Presentation.file_data).where(Presentation.id == presentation_id)
    result = await db.execute(stmt)
    data = result.scalar_one_or_none()

    if data is None:
        data = await read_file(presentation.file_path)

    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="原始文件不存在")

    ext = Path(presentation.file_path).suffix.lower()
    media_type = (
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        if ext == ".pptx"
        else "application/vnd.ms-powerpoint"
    )
    return Response(content=data, media_type=media_type)


# ==================== 批注 ====================

@router.get("/presentations/{presentation_id}/annotations", response_model=list[AnnotationResponse])
async def list_annotations(
    presentation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    presentation = await _get_presentation_or_404(db, presentation_id)
    _ensure_group_member(current_user, presentation.meeting)

    annotations = sorted(presentation.annotations, key=lambda a: (a.page_number, a.created_at))
    return [_annotation_to_response(a) for a in annotations]


@router.post(
    "/presentations/{presentation_id}/annotations",
    response_model=AnnotationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_annotation(
    presentation_id: uuid.UUID,
    data: AnnotationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    presentation = await _get_presentation_or_404(db, presentation_id)
    _ensure_group_member(current_user, presentation.meeting)

    annotation = Annotation(
        presentation_id=presentation_id,
        page_number=data.page_number,
        user_id=current_user.id,
        content=data.content.strip(),
    )
    db.add(annotation)
    await db.commit()
    await db.refresh(annotation)

    # 重新加载带 user 关系的批注
    result = await db.execute(
        select(Annotation).options(selectinload(Annotation.user)).where(Annotation.id == annotation.id)
    )
    annotation = result.scalar_one()
    return _annotation_to_response(annotation)


@router.delete("/annotations/{annotation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_annotation(
    annotation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Annotation)
        .options(selectinload(Annotation.presentation).selectinload(Presentation.meeting))
        .where(Annotation.id == annotation_id)
    )
    annotation = result.scalar_one_or_none()
    if not annotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="批注不存在")

    _ensure_group_member(current_user, annotation.presentation.meeting)

    if annotation.user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="仅可删除自己的批注")

    await db.delete(annotation)
    await db.commit()
