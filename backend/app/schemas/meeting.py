from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.presentation import PresentationListItem


class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    meeting_date: date


class MeetingResponse(BaseModel):
    id: UUID
    group_id: UUID
    title: str
    meeting_date: date
    created_by: UUID
    creator_name: str
    created_at: datetime
    presentation_count: int


class MeetingDetailResponse(MeetingResponse):
    presentations: list[PresentationListItem] = []


class MeetingDeleteResponse(BaseModel):
    message: str
