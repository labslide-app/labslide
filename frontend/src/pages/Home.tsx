import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

/* 品牌点缀：极简几何猫头剪影（非卡通，仅作 Logo 元素） */
function CatMark({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M7 12.5 V4.5 L12.6 8.6 C13.7 8.2 14.8 8 16 8 C17.2 8 18.3 8.2 19.4 8.6 L25 4.5 V12.5 C26.9 14.3 28 16.7 28 19 C28 24.2 22.6 28 16 28 C9.4 28 4 24.2 4 19 C4 16.7 5.1 14.3 7 12.5 Z" />
    </svg>
  );
}

/* 主视觉：发光网格线构成的抽象窗户，透出研讨室剪影 */
function WindowVisual() {
  const verticals = [96, 144, 192, 288, 336, 384];
  const horizontals = [92, 144, 196, 300, 352, 404, 456, 508];
  const nodes: Array<[number, number]> = [
    [240, 248],
    [144, 352],
    [336, 144],
    [384, 404],
    [96, 508],
  ];

  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      {/* 环境光晕 */}
      <div className="absolute -inset-12 rounded-full bg-[radial-gradient(closest-side,rgba(127,195,184,0.14),transparent)] blur-2xl" />

      <svg viewBox="0 0 480 600" className="relative w-full drop-shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <defs>
          <linearGradient id="frameGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6cd96" />
            <stop offset="50%" stopColor="#c9a86a" />
            <stop offset="100%" stopColor="#9d7f4c" />
          </linearGradient>
          <radialGradient id="roomGlow" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0%" stopColor="#2b4a56" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#101826" stopOpacity="0" />
          </radialGradient>
          <clipPath id="windowClip">
            <rect x="48" y="40" width="384" height="520" rx="18" />
          </clipPath>
        </defs>

        {/* 窗内：研讨室 / 图书馆抽象剪影 */}
        <g clipPath="url(#windowClip)">
          <rect x="48" y="40" width="384" height="520" fill="#101826" />
          <circle cx="240" cy="200" r="170" fill="url(#roomGlow)" />

          {/* 书架剪影（左） */}
          <g fill="#22304a">
            <rect x="84" y="336" width="14" height="118" rx="2" />
            <rect x="102" y="356" width="12" height="98" rx="2" />
            <rect x="118" y="344" width="16" height="110" rx="2" />
            <rect x="138" y="366" width="12" height="88" rx="2" />
            <rect x="154" y="350" width="14" height="104" rx="2" />
          </g>
          {/* 书架剪影（右） */}
          <g fill="#22304a">
            <rect x="316" y="348" width="14" height="106" rx="2" />
            <rect x="334" y="362" width="12" height="92" rx="2" />
            <rect x="350" y="340" width="16" height="114" rx="2" />
            <rect x="370" y="358" width="12" height="96" rx="2" />
            <rect x="386" y="346" width="14" height="108" rx="2" />
          </g>
          {/* 架板 */}
          <line x1="76" y1="456" x2="176" y2="456" stroke="#2c3c5c" strokeWidth="3" />
          <line x1="308" y1="456" x2="408" y2="456" stroke="#2c3c5c" strokeWidth="3" />
          {/* 长桌与台灯意象 */}
          <line x1="120" y1="500" x2="360" y2="500" stroke="#2c3c5c" strokeWidth="3" />
          <circle cx="240" cy="480" r="5" fill="#c9a86a" opacity="0.8" />
          <circle cx="240" cy="480" r="12" fill="#c9a86a" opacity="0.15" />
        </g>

        {/* 发光网格线 */}
        <g clipPath="url(#windowClip)">
          {verticals.map((x) => (
            <line key={`v${x}`} x1={x} y1="40" x2={x} y2="560" stroke="#c9a86a" strokeOpacity="0.13" strokeWidth="1" />
          ))}
          {horizontals.map((y) => (
            <line key={`h${y}`} x1="48" y1={y} x2="432" y2={y} stroke="#c9a86a" strokeOpacity="0.13" strokeWidth="1" />
          ))}
          {/* 点亮的青绿主线 */}
          <line x1="240" y1="40" x2="240" y2="560" stroke="#7fc3b8" strokeOpacity="0.5" strokeWidth="1.2" />
          <line x1="48" y1="248" x2="432" y2="248" stroke="#7fc3b8" strokeOpacity="0.38" strokeWidth="1" />
          {/* 交点光斑 */}
          {nodes.map(([cx, cy]) => (
            <g key={`n${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r="7" fill="#7fc3b8" opacity="0.16" />
              <circle cx={cx} cy={cy} r="2.2" fill="#9fd8cf" />
            </g>
          ))}
        </g>

        {/* 窗框 */}
        <rect x="48" y="40" width="384" height="520" rx="18" fill="none" stroke="url(#frameGold)" strokeWidth="2" />
        <line x1="240" y1="41" x2="240" y2="559" stroke="url(#frameGold)" strokeWidth="1.5" strokeOpacity="0.9" />
        <line x1="49" y1="248" x2="431" y2="248" stroke="url(#frameGold)" strokeWidth="1.5" strokeOpacity="0.9" />
      </svg>

      {/* 玻璃态浮层信息卡 */}
      <div className="absolute -right-4 top-16 rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md sm:-right-8">
        <p className="text-xs text-[#f5f2ea]/60">实时批注</p>
        <p className="mt-0.5 text-sm font-semibold text-[#f5f2ea]">第 12 页 · +3 条讨论</p>
      </div>
      <div className="absolute -left-4 bottom-20 rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md sm:-left-8">
        <p className="text-xs text-[#f5f2ea]/60">知识沉淀</p>
        <p className="mt-0.5 text-sm font-semibold text-[#9fd8cf]">本周新增 28 条批注</p>
      </div>
    </div>
  );
}

const features = [
  {
    title: "PPT 在线预览",
    desc: "上传 PPTX 保持原始排版，浏览器内直接分页查看，无需下载任何插件。",
    accent: "text-[#c9a86a]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "在线批注讨论",
    desc: "在幻灯片任意位置添加批注，团队成员实时可见，记录讨论要点与灵感。",
    accent: "text-[#7fc3b8]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M21 12a8 8 0 0 1-8 8H4l2.4-2.9A8 8 0 1 1 21 12Z" strokeLinejoin="round" />
        <path d="M8.5 10.5h7M8.5 13.5h4.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "课题组协作",
    desc: "邀请码一键加入课题组，PPT 与批注组内共享，角色权限清晰可控。",
    accent: "text-[#c9a86a]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" strokeLinecap="round" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M16.2 14.6c2.3.3 3.9 1.7 4.4 4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "知识沉淀",
    desc: "每一次批注都被结构化记录，随时间积累成团队可检索的学术智慧。",
    accent: "text-[#7fc3b8]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" strokeLinejoin="round" />
        <path d="M5 17a3 3 0 0 1 3-3h11" />
        <path d="M9.5 8.5h5M9.5 11.5h3.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Home() {
  const [health, setHealth] = useState<{ api: boolean; db: boolean } | null>(null);

  useEffect(() => {
    apiClient
      .get("/health")
      .then((res) => setHealth({ api: true, db: !!res.data?.database?.connected }))
      .catch(() => setHealth({ api: false, db: false }));
  }, []);

  return (
    <div className="relative bg-[#1a2332] text-[#f5f2ea]">
      {/* 背景氛围：渐变 + 极细网格 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_520px_at_72%_-8%,rgba(127,195,184,0.12),transparent),radial-gradient(900px_480px_at_8%_110%,rgba(201,168,106,0.08),transparent)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(245,242,234,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(245,242,234,0.6)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs tracking-widest text-[#f5f2ea]/70 backdrop-blur-sm">
              <CatMark className="h-3.5 w-3.5 text-[#c9a86a]" />
              科研协作 · 知识管理
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              打开科研之窗
              <span className="mt-2 block bg-gradient-to-r from-[#e6cd96] via-[#c9a86a] to-[#9fd8cf] bg-clip-text text-transparent">
                让讨论沉淀为知识
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#f5f2ea]/65 sm:text-lg">
              LabSlide 是面向课题组的组会 PPT 在线批注与知识沉淀平台。
              上传、预览、批注、讨论，一站完成——让每一次组会都成为团队的积累。
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-[#d8b97e] to-[#b8935a] px-7 py-3 text-sm font-semibold text-[#1a2332] shadow-lg shadow-[#c9a86a]/20 transition hover:brightness-110"
              >
                开始使用
              </Link>
              <a
                href="#features"
                className="rounded-xl border border-white/20 px-7 py-3 text-sm font-medium text-[#f5f2ea]/80 transition hover:border-white/40 hover:text-[#f5f2ea]"
              >
                了解更多
              </a>
            </div>

            {/* 服务状态 */}
            <div className="mt-10 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[#f5f2ea]/60 backdrop-blur-sm">
                <span className={`h-1.5 w-1.5 rounded-full ${health === null ? "bg-white/30" : health.api ? "bg-[#7fc3b8]" : "bg-red-400"}`} />
                API 服务{health ? (health.api ? " · 正常" : " · 异常") : ""}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[#f5f2ea]/60 backdrop-blur-sm">
                <span className={`h-1.5 w-1.5 rounded-full ${health === null ? "bg-white/30" : health.db ? "bg-[#7fc3b8]" : "bg-red-400"}`} />
                数据库{health ? (health.db ? " · 已连接" : " · 异常") : ""}
              </span>
            </div>
          </div>

          <WindowVisual />
        </div>
      </section>

      {/* 特性 */}
      <section id="features" className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">为学术场景而设计</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#f5f2ea]/55 sm:text-base">
            专注组会汇报与学术讨论的每一个环节，从预览到沉淀。
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${f.accent}`}>
                {f.icon}
              </div>
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#f5f2ea]/55">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-14 text-center backdrop-blur-md sm:px-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_220px_at_50%_0%,rgba(201,168,106,0.12),transparent)]" />
          <CatMark className="mx-auto h-6 w-6 text-[#c9a86a]/80" />
          <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">准备好打开你的科研之窗了吗？</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[#f5f2ea]/55">
            创建课题组，邀请成员，开始第一次在线组会批注。
          </p>
          <Link
            to="/login"
            className="mt-8 inline-block rounded-xl bg-gradient-to-r from-[#d8b97e] to-[#b8935a] px-8 py-3 text-sm font-semibold text-[#1a2332] shadow-lg shadow-[#c9a86a]/20 transition hover:brightness-110"
          >
            免费开始使用
          </Link>
        </div>
      </section>
    </div>
  );
}
