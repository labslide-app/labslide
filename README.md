# LabSlide — 课题组组会 PPT 在线批注与知识沉淀平台

LabSlide 是一个面向科研课题组场景的全栈 Web 应用，用于组会 PPT 汇报后的在线批注、讨论与知识沉淀。

## 在线体验

| 环境 | 地址 |
|------|------|
| 前端 | [labslide.pages.dev](https://labslide.pages.dev) |
| 后端 API | [labslide.onrender.com](https://labslide.onrender.com/api/v1/health) |

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18 + TypeScript + Vite + Tailwind CSS + React Router |
| **后端** | Python FastAPI + SQLAlchemy 2.0 (async) + Pydantic |
| **数据库** | PostgreSQL 16 |
| **文件存储** | MinIO (开发) / 阿里云 OSS (生产，预留) |
| **认证** | JWT (python-jose) |
| **实时通知** | WebSocket (FastAPI) |
| **部署** | Cloudflare Pages (前端) + Render (后端) / Docker Compose (本地) |

## 本地部署（Docker）

### 前置要求

- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- 端口 `80`, `5432`, `6379`, `9000`, `9001` 未被占用

### Docker 一键启动

```bash
# 1. 克隆项目
git clone https://github.com/labslide-app/labslide.git && cd labslide

# 2. 复制环境变量
cp .env.example .env

# 3. 启动所有服务
docker compose up -d --build

# 4. 初始化数据库表
docker compose exec backend alembic upgrade head
```

启动后访问：

| 服务 | 地址 |
|------|------|
| 前端页面 | http://localhost |
| 后端 API 文档 | http://localhost:8000/docs |
| 健康检查 | http://localhost:8000/api/v1/health |
| MinIO 控制台 | http://localhost:9001 |

## 项目结构

```
LabSlide/
├── docker-compose.yml          # 容器编排
├── .env.example                # 环境变量模板
├── README.md
├── nginx/
│   └── nginx.conf              # Nginx 反向代理配置
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini             # 数据库迁移配置
│   ├── alembic/                # 迁移脚本
│   └── app/
│       ├── main.py             # FastAPI 入口
│       ├── config.py           # 配置管理
│       ├── database.py         # 数据库连接
│       ├── api/                # API 路由
│       ├── models/             # SQLAlchemy 模型
│       ├── schemas/            # Pydantic 模式
│       ├── services/           # 业务逻辑
│       └── core/               # 安全 / 工具
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/                # API 客户端
        ├── components/         # 通用组件
        └── pages/              # 页面
```

## 核心功能规划

- **PPT 上传与预览**：支持上传 PPT/PDF 文件，在线预览
- **在线批注**：在幻灯片上添加文本批注、标记
- **讨论线程**：每页 PPT 关联讨论区
- **知识沉淀**：批注内容可导出为结构化笔记
- **用户认证**：JWT 登录 / 注册
- **实时通知**：WebSocket 推送新批注、回复通知

## License

MIT