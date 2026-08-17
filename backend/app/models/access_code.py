import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, func, ForeignKey, Enum, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AccessRole(str, PyEnum):
    viewer = "viewer"
    member = "member"
    admin = "admin"


class AccessCode(Base):
    __tablename__ = "access_codes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id"), nullable=False
    )
    code_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    role: Mapped[AccessRole] = mapped_column(
        Enum(AccessRole, name="access_role"), default=AccessRole.viewer, nullable=False
    )
    max_visits: Mapped[int | None] = mapped_column(Integer, nullable=True)
    visit_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # 关系
    meeting = relationship("Meeting", backref="access_code", foreign_keys=[meeting_id], uselist=False)