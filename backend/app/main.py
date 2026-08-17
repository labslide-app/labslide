from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.api import health, auth, ws, groups, presentations, meetings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理：启动时创建数据库表"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="LabSlide API",
    description="课题组组会 PPT 在线批注与知识沉淀平台",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.pages\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(groups.router, prefix="/api/v1", tags=["groups"])
app.include_router(meetings.router, prefix="/api/v1", tags=["meetings"])
app.include_router(ws.router, prefix="/ws", tags=["websocket"])
app.include_router(presentations.router, prefix="/api/v1", tags=["presentations"])

# 静态文件服务（本地存储回退时使用）
from fastapi.staticfiles import StaticFiles
import os as _os

_storage_dir = settings.STORAGE_DIR
if _os.path.isdir(_storage_dir):
    app.mount("/api/v1/static", StaticFiles(directory=_storage_dir), name="static")


@app.get("/")
async def root():
    return {"message": "LabSlide API", "version": "1.0.0", "docs": "/docs"}