from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AnnotationCreate(BaseModel):
    page_number: int = Field(..., ge=1)
    content: str = Field(..., min_length=1, max_length=2000)


class AnnotationResponse(BaseModel):
    id: UUID
    presentation_id: UUID
    page_number: int
    user_id: UUID
    user_name: str
    content: str
    created_at: datetime


class PresentationResponse(BaseModel):
    id: UUID
    meeting_id: UUID
    owner_id: UUID
    owner_name: str
    title: str
    status: str
    created_at: datetime
    annotations: list[AnnotationResponse] = []


class PresentationListItem(BaseModel):
    id: UUID
    meeting_id: UUID
    owner_id: UUID
    owner_name: str
    title: str
    status: str
    created_at: datetime


class PresentationUploadResponse(BaseModel):
    id: UUID
    meeting_id: UUID
    owner_id: UUID
    title: str
    status: str
    message: str = "PPT 已上传，可直接查看"
