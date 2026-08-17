#!/usr/bin/env bash
set -euo pipefail

echo "=============================================="
echo "  LabSlide 一键部署脚本"
echo "=============================================="

# ---------- 1. 安装 Docker ----------
if ! command -v docker >/dev/null 2>&1; then
  echo "==> 未检测到 Docker，正在安装（首次需几分钟）..."
  curl -fsSL https://get.docker.com | sh
else
  echo "==> Docker 已安装"
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "!! 错误：未检测到 Docker Compose 插件，请先安装后重试"
  exit 1
fi

# ---------- 2. 生成/加固生产密钥 ----------
if [ ! -f .env ]; then
  echo "==> 生成生产密钥 .env"
  printf 'POSTGRES_PASSWORD=%s\n' "$(openssl rand -hex 16)" > .env
  printf 'JWT_SECRET_KEY=%s\n' "$(openssl rand -hex 32)" >> .env
else
  if grep -q '^POSTGRES_PASSWORD=labslide123$' .env; then
    echo "==> 检测到默认弱数据库密码，已替换为随机强密码"
    sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(openssl rand -hex 16)/" .env
  fi
  if grep -q '^JWT_SECRET_KEY=change-me' .env; then
    echo "==> 检测到占位 JWT 密钥，已替换为随机强密钥"
    sed -i "s/^JWT_SECRET_KEY=.*/JWT_SECRET_KEY=$(openssl rand -hex 32)/" .env
  fi
fi

# ---------- 3. 构建并启动 ----------
echo "==> 构建并启动服务（首次构建较慢）..."
docker compose up -d --build

# ---------- 4. 等待就绪 ----------
echo "==> 等待服务就绪..."
READY=0
for i in $(seq 1 60); do
  if docker compose exec -T backend curl -fsS http://localhost:8000/api/v1/health >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 2
done

if [ "$READY" -eq 0 ]; then
  echo "!! 后端未在预期时间内就绪，请运行: docker compose logs backend"
fi

# ---------- 5. 输出访问地址 ----------
PUBLIC_IP=$(curl -fsS --connect-timeout 5 https://ifconfig.me 2>/dev/null || true)
if [ -z "$PUBLIC_IP" ]; then
  PUBLIC_IP=$(curl -fsS --connect-timeout 5 https://api.ipify.org 2>/dev/null || true)
fi
[ -z "$PUBLIC_IP" ] && PUBLIC_IP="你的服务器公网IP（云控制台可见）"

echo ""
echo "=============================================="
echo "  部署完成！"
echo "  访问地址: http://${PUBLIC_IP}"
echo "=============================================="
echo "  常用命令："
echo "  查看状态: docker compose ps"
echo "  查看日志: docker compose logs -f backend"
echo "  停止服务: docker compose down"
echo "  更新重启: docker compose up -d --build"
