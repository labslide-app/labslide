from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.database import get_db, check_db_connection
from app.schemas.user import MessageResponse

router = APIRouter()


@router.get("/health", response_model=MessageResponse)
async def health_check():
    """健康检查接口"""
    return MessageResponse(message="LabSlide API is running")


@router.get("/health/db", response_model=MessageResponse)
async def db_health_check():
    """数据库健康检查"""
    ok = await check_db_connection()
    if ok:
        return MessageResponse(message="Database connection is healthy")
    return MessageResponse(message="Database connection failed")