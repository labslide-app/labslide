from sqlalchemy import select, func as sa_func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.models.user import User, UserRole
from app.models.group import Group, generate_invite_code
from app.core.security import get_password_hash, verify_password, create_access_token


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


def _normalize_invite_code(raw: str) -> str:
    """将任意格式的邀请码规范化为 LAB-XXXX-XXXX 格式进行匹配。"""
    cleaned = "".join(c for c in raw.upper() if c.isalnum())
    if cleaned.startswith("LAB"):
        cleaned = cleaned[3:]
    code = cleaned[:8]
    if len(code) >= 8:
        return f"LAB-{code[:4]}-{code[4:]}"
    return raw.upper().strip()


async def get_group_by_invite_code(db: AsyncSession, invite_code: str) -> Group | None:
    normalized = _normalize_invite_code(invite_code)
    result = await db.execute(
        select(Group).where(Group.invite_code == normalized)
    )
    return result.scalar_one_or_none()


async def get_group_by_id(db: AsyncSession, group_id) -> Group | None:
    result = await db.execute(select(Group).where(Group.id == group_id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, email: str, password: str, full_name: str, group_id: str | None) -> User:
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        full_name=full_name,
        role=UserRole.student,
        group_id=group_id,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    user = await get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


async def create_group(db: AsyncSession, name: str, created_by: str) -> Group:
    """创建课题组，自动生成唯一邀请码（碰撞时重试）。"""
    max_retries = 5
    for _ in range(max_retries):
        group = Group(name=name, created_by=created_by)
        db.add(group)
        try:
            await db.flush()
            await db.refresh(group)
            return group
        except IntegrityError:
            await db.rollback()
            # 邀请码碰撞，重新生成
            group.invite_code = generate_invite_code()
    raise RuntimeError("Failed to generate unique invite code after retries")


async def get_group_members(db: AsyncSession, group_id: str) -> list[User]:
    result = await db.execute(
        select(User).where(User.group_id == group_id).order_by(User.created_at)
    )
    return list(result.scalars().all())


async def count_group_members(db: AsyncSession, group_id: str) -> int:
    """统计课题组成员数量。"""
    result = await db.execute(
        select(sa_func.count()).select_from(User).where(User.group_id == group_id)
    )
    return result.scalar() or 0