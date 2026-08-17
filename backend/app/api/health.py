from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.database import get_db
from app.schemas.user import MessageResponse

router = APIRouter()


@router.get("/health", response_model=MessageResponse)
async def health_check():
    """健康检查接口"""
    return MessageResponse(message="LabSlide API is running")


@router.get("/health/db", response_model=MessageResponse)
async def db_health_check(db: AsyncSession = Depends(get_db)):
    """数据库健康检查"""
    try:
        await db.execute(text("SELECT 1"))
        return MessageResponse(message="Database connection is healthy")
    except Exception as e:
        return MessageResponse(message=f"Database connection failed: {str(e)}")