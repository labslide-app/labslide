from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # 环境
    ENV: str = "development"

    # 数据库（生产环境由 Render 注入 PostgreSQL 连接串）
    DATABASE_URL: str = "sqlite+aiosqlite:///./labslide.db"

    # 持久化文件存储目录（生产环境挂载 Render Disk）
    STORAGE_DIR: str = "storage"

    # JWT
    JWT_SECRET_KEY: str = "labslide-production-secret-key-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # MinIO (仅开发环境)
    MINIO_HOST: str = "minio"
    MINIO_PORT: int = 9000
    MINIO_ROOT_USER: str = "minioadmin"
    MINIO_ROOT_PASSWORD: str = "minioadmin123"
    MINIO_BUCKET: str = "labslide-uploads"
    MINIO_SECURE: bool = False

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://labslide-app.netlify.app",
        "https://labslide.onrender.com",
    ]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()