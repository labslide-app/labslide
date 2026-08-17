import uuid
from datetime import datetime, date

from sqlalchemy import String, DateTime, func, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    group_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("groups.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    meeting_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # 关系
    group = relationship("Group", back_populates="meetings")
    presentations = relationship("Presentation", back_populates="meeting")
    summaries = relationship("MeetingSummary", back_populates="meeting")
    access_code = relationship(
        "AccessCode", back_populates="meeting", uselist=False,
        primaryjoin="Meeting.id == foreign(AccessCode.meeting_id)",
        viewonly=True,
    )
    creator = relationship("User", foreign_keys=[created_by])