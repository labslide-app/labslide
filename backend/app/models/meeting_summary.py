import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, func, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SummaryGenerator(str, PyEnum):
    ai = "ai"
    human = "human"


class MeetingSummary(Base):
    __tablename__ = "meeting_summaries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    generated_by: Mapped[SummaryGenerator] = mapped_column(
        Enum(SummaryGenerator, name="summary_generator"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # 关系
    meeting = relationship("Meeting", backref="summaries")