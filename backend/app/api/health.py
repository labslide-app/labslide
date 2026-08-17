import os
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.database import get_db, check_db_connection
from app.config import get_settings
from app.schemas.user import MessageResponse

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health_check():
    """健康检查接口（含数据库和存储诊断信息）"""
    db_ok = await check_db_connection()
    db_type = "postgresql" if "postgresql" in settings.DATABASE_URL else "sqlite"

    storage_dir = Path(settings.STORAGE_DIR)
    storage_exists = storage_dir.exists()
    storage_writable = False
    if storage_exists:
        try:
            test_file = storage_dir / ".health_check_test"
            test_file.write_text("ok")
            test_file.unlink()
            storage_writable = True
        except Exception:
            pass

    return {
        "message": "LabSlide API is running",
        "database": {
            "connected": db_ok,
            "type": db_type,
        },
        "storage": {
            "path": str(storage_dir),
            "exists": storage_exists,
            "writable": storage_writable,
        },
        "env": settings.ENV,
    }


@router.get("/health/db", response_model=MessageResponse)
async def db_health_check():
    """数据库健康检查"""
    ok = await check_db_connection()
    if ok:
        return MessageResponse(message="Database connection is healthy")
    return MessageResponse(message="Database connection failed")