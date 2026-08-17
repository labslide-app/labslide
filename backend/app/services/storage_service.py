import logging
import shutil
import socket
import time
from pathlib import Path
from datetime import timedelta

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

STORAGE_DIR = Path("storage")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# MinIO 客户端（惰性初始化，连接失败时回退本地存储）
_minio_client = None
_minio_last_check = 0.0
_minio_last_ok = False


def _minio_reachable() -> bool:
    """快速探测 MinIO 端口是否可达（1 秒超时，带短缓存避免每次请求都探测）。"""
    global _minio_last_check, _minio_last_ok
    now = time.monotonic()
    if now - _minio_last_check < 5.0:
        return _minio_last_ok
    _minio_last_check = now
    try:
        s = socket.create_connection((settings.MINIO_HOST, settings.MINIO_PORT), timeout=1.0)
        s.close()
        _minio_last_ok = True
    except Exception:
        _minio_last_ok = False
    return _minio_last_ok


def _get_minio_client():
    """获取或创建 MinIO 客户端（不可达或连接失败时返回 None）。"""
    global _minio_client
    if _minio_client is not None:
        return _minio_client

    # 先用 socket 快速探测端口，避免 MinIO 未启动时 bucket_exists 长时间阻塞
    if not _minio_reachable():
        logger.warning("MinIO 不可达（%s:%s），回退到本地存储", settings.MINIO_HOST, settings.MINIO_PORT)
        return None

    try:
        from minio import Minio
        client = Minio(
            f"{settings.MINIO_HOST}:{settings.MINIO_PORT}",
            access_key=settings.MINIO_ROOT_USER,
            secret_key=settings.MINIO_ROOT_PASSWORD,
            secure=settings.MINIO_SECURE,
        )
        if not client.bucket_exists(settings.MINIO_BUCKET):
            client.make_bucket(settings.MINIO_BUCKET)
        _minio_client = client
        return _minio_client
    except Exception as e:
        logger.warning(f"MinIO connection failed, falling back to local storage: {e}")
        _minio_client = None
        return None


async def upload_file(file_path: str, object_name: str) -> str:
    """上传本地文件到 MinIO（或本地存储），返回 object_name。

    返回的 object_name 即文件在存储中的唯一路径，后续通过
    get_file_url() 生成访问 URL。
    """
    client = _get_minio_client()
    if client is not None:
        try:
            client.fput_object(settings.MINIO_BUCKET, object_name, file_path)
            return object_name
        except Exception as e:
            logger.error(f"MinIO upload failed for {object_name}: {e}")

    # 回退到本地存储
    dest = STORAGE_DIR / object_name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(file_path, str(dest))
    return object_name


async def upload_bytes(data: bytes, object_name: str, content_type: str | None = None) -> str:
    """上传字节内容到 MinIO（或本地存储），返回 object_name。"""
    import io

    client = _get_minio_client()
    if client is not None:
        try:
            client.put_object(
                settings.MINIO_BUCKET,
                object_name,
                io.BytesIO(data),
                length=len(data),
                content_type=content_type or "application/octet-stream",
            )
            return object_name
        except Exception as e:
            logger.error(f"MinIO upload failed for {object_name}: {e}")

    # 回退到本地存储
    dest = STORAGE_DIR / object_name
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return object_name


async def read_file(object_name: str) -> bytes | None:
    """读取文件内容（MinIO 或本地存储），不存在时返回 None。"""
    if not object_name:
        return None

    client = _get_minio_client()
    if client is not None:
        try:
            resp = client.get_object(settings.MINIO_BUCKET, object_name)
            try:
                return resp.read()
            finally:
                resp.close()
                resp.release_conn()
        except Exception:
            pass

    local_path = STORAGE_DIR / object_name
    if local_path.exists():
        return local_path.read_bytes()
    return None


async def get_file_url(object_name: str, expires_minutes: int = 10) -> str:
    """获取文件访问 URL。

    - MinIO：返回带过期时间的预签名 URL（默认 10 分钟）。
    - 本地回退：返回应用内静态路径。
    """
    if not object_name:
        return ""

    client = _get_minio_client()
    if client is not None:
        try:
            return client.presigned_get_object(
                settings.MINIO_BUCKET,
                object_name,
                expires=timedelta(minutes=expires_minutes),
            )
        except Exception as e:
            logger.error(f"Failed to presign {object_name}: {e}")

    return f"/api/v1/static/{object_name}"


async def delete_file(object_name: str) -> bool:
    """删除文件。"""
    if not object_name:
        return False

    client = _get_minio_client()
    if client is not None:
        try:
            client.remove_object(settings.MINIO_BUCKET, object_name)
            return True
        except Exception:
            pass

    local_path = STORAGE_DIR / object_name
    if local_path.exists():
        local_path.unlink()
        return True
    return False
