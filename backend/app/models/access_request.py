import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, func, ForeignKey, Enum, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RequestType(str, PyEnum):
    download_full = "download_full"
    download_slide = "download_slide"
    copy_content = "copy_content"


class RequestStatus(str, PyEnum):
    pending = "pending"
    approved_by_owner = "approved_by_owner"
    approved_by_admin = "approved_by_admin"
    rejected = "rejected"
    expired = "expired"


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    presentation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("presentations.id"), nullable=False
    )
    requester_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    request_type: Mapped[RequestType] = mapped_column(
        Enum(RequestType, name="request_type"), nullable=False
    )
    scope: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    reason: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status"), default=RequestStatus.pending, nullable=False
    )
    watermark: Mapped[bool] = mapped_column(Boolean, default=True)
    granted_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # 关系
    presentation = relationship("Presentation", back_populates="access_requests")
    requester = relationship("User", back_populates="access_requests_made", foreign_keys=[requester_id])
    owner = relationship("User", back_populates="access_requests_received", foreign_keys=[owner_id])