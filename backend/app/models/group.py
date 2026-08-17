import secrets
import string
import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def generate_invite_code() -> str:
    """生成 LAB-XXXX-XXXX 格式的唯一邀请码。"""
    alphabet = string.ascii_uppercase + string.digits
    code = "".join(secrets.choice(alphabet) for _ in range(8))
    return f"LAB-{code[:4]}-{code[4:]}"


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    invite_code: Mapped[str] = mapped_column(
        String(32), unique=True, nullable=False, default=generate_invite_code
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # 关系
    members = relationship("User", back_populates="group", foreign_keys="User.group_id")
    meetings = relationship("Meeting", back_populates="group")
    creator = relationship("User", foreign_keys=[created_by])