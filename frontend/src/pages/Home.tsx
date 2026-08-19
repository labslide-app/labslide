import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";

// ============ 装饰SVG组件 ============

// 罗小黑风格思考猫 - 主形象（坐在窗台上）
function ThinkingCatMascot() {
  return (
    <svg
      viewBox="0 0 200 180"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 思考泡泡 */}
      <g className="animate-thinking-bubble">
        <circle cx="160" cy="30" r="18" fill="white" opacity="0.95" />
        <circle cx="178" cy="18" r="12" fill="white" opacity="0.9" />
        <circle cx="190" cy="8" r="8" fill="white" opacity="0.85" />
        <text x="152" y="37" fontSize="16" fill="#0ea5e9" fontWeight="bold">
          ?
        </text>
      </g>

      {/* 身体 - 坐在窗台上 */}
      <ellipse cx="80" cy="145" rx="50" ry="30" fill="#1e293b" />
      {/* 脚 */}
      <ellipse cx="50" cy="168" rx="18" ry="10" fill="#1e293b" />
      <ellipse cx="110" cy="168" rx="18" ry="10" fill="#1e293b" />
      {/* 脚掌垫 */}
      <ellipse cx="50" cy="166" rx="10" ry="5" fill="#334155" />
      <ellipse cx="110" cy="166" rx="10" ry="5" fill="#334155" />

      {/* 头部 */}
      <ellipse cx="80" cy="95" rx="42" ry="38" fill="#1e293b" />
      {/* 左耳 */}
      <path d="M45 70 L32 30 L62 58 Z" fill="#1e293b" />
      <path d="M47 65 L40 42 L57 57 Z" fill="#475569" />
      {/* 右耳 */}
      <path d="M115 70 L128 30 L98 58 Z" fill="#1e293b" />
      <path d="M113 65 L120 42 L103 57 Z" fill="#475569" />

      {/* 眼睛 - 大大圆圆的发呆眼 */}
      <ellipse cx="62" cy="92" rx="12" ry="14" fill="white" />
      <ellipse cx="98" cy="92" rx="12" ry="14" fill="white" />
      <ellipse cx="64" cy="94" rx="7" ry="9" fill="#0ea5e9" />
      <ellipse cx="100" cy="94" rx="7" ry="9" fill="#0ea5e9" />
      <ellipse cx="66" cy="96" rx="4" ry="6" fill="#0369a1" />
      <ellipse cx="102" cy="96" rx="4" ry="6" fill="#0369a1" />
      <circle cx="67" cy="90" r="3" fill="white" />
      <circle cx="103" cy="90" r="3" fill="white" />

      {/* 鼻子 */}
      <ellipse cx="80" cy="108" rx="5" ry="3.5" fill="#f472b6" />
      {/* 嘴巴 - 微微张开思考 */}
      <path
        d="M74 115 Q80 122 86 115"
        stroke="#475569"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* 腮红 */}
      <ellipse cx="48" cy="105" rx="8" ry="5" fill="#f472b6" opacity="0.3" />
      <ellipse cx="112" cy="105" rx="8" ry="5" fill="#f472b6" opacity="0.3" />

      {/* 胡须 */}
      <line x1="38" y1="100" x2="15" y2="95" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="38" y1="108" x2="12" y2="110" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="122" y1="100" x2="145" y2="95" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="122" y1="108" x2="148" y2="110" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />

      {/* 尾巴 - 卷曲思考状 */}
      <path
        d="M125 140 Q155 130 160 105 Q162 85 148 80 Q138 77 135 88"
        stroke="#1e293b"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      {/* 尾巴尖 */}
      <circle cx="140" cy="82" r="8" fill="#1e293b" />

      {/* 一只爪子托着下巴 - 思考姿势 */}
      <ellipse cx="58" cy="128" rx="14" ry="10" fill="#1e293b" />
      <ellipse cx="58" cy="126" rx="8" ry="5" fill="#334155" />
    </svg>
  );
}

// 云朵
function Cloud({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`absolute ${className}`} style={style}>
      <svg viewBox="0 0 100 50" className="w-full h-full" fill="white">
        <ellipse cx="30" cy="35" rx="25" ry="15" opacity="0.8" />
        <ellipse cx="55" cy="28" rx="30" ry="20" opacity="0.9" />
        <ellipse cx="75" cy="35" rx="22" ry="14" opacity="0.8" />
        <ellipse cx="45" cy="35" rx="20" ry="12" opacity="0.7" />
      </svg>
    </div>
  );
}

// 烧杯 - 理工科实验元素
function Beaker({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 80"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {/* 烧杯身 */}
      <path d="M15 10 L15 60 Q15 75 30 75 Q45 75 45 60 L45 10" strokeLinecap="round" />
      {/* 杯口 */}
      <line x1="10" y1="10" x2="50" y2="10" strokeLinecap="round" />
      {/* 刻度线 */}
      <line x1="15" y1="25" x2="22" y2="25" />
      <line x1="15" y1="40" x2="22" y2="40" />
      <line x1="15" y1="55" x2="22" y2="55" />
      {/* 液体 */}
      <path
        d="M18 45 Q25 40 30 45 Q35 50 42 45 L42 60 Q42 70 30 70 Q18 70 18 60 Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* 气泡 */}
      <circle cx="25" cy="55" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="35" cy="50" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// 显微镜
function Microscope({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 90"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {/* 目镜 */}
      <path d="M35 5 L35 20" strokeLinecap="round" />
      <ellipse cx="35" cy="5" rx="8" ry="4" fill="currentColor" opacity="0.3" />
      {/* 镜筒 */}
      <rect x="30" y="18" width="10" height="25" rx="2" />
      {/* 物镜 */}
      <rect x="28" y="40" width="14" height="8" rx="2" />
      {/* 载物台 */}
      <rect x="15" y="50" width="40" height="5" rx="1" />
      {/* 调焦旋钮 */}
      <circle cx="55" cy="35" r="6" />
      <circle cx="55" cy="35" r="3" fill="currentColor" opacity="0.3" />
      {/* 支架臂 */}
      <path d="M40 25 L60 25 L60 55" strokeLinecap="round" />
      {/* 底座 */}
      <path d="M20 55 L20 75 L50 75 L50 55" />
      <ellipse cx="35" cy="80" rx="25" ry="5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

// 原子结构
function Atom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="40" cy="40" r="6" fill="currentColor" />
      <ellipse cx="40" cy="40" rx="35" ry="14" />
      <ellipse cx="40" cy="40" rx="35" ry="14" transform="rotate(60 40 40)" />
      <ellipse cx="40" cy="40" rx="35" ry="14" transform="rotate(120 40 40)" />
      {/* 电子 */}
      <circle cx="75" cy="40" r="3" fill="currentColor" />
      <circle cx="22" cy="58" r="3" fill="currentColor" />
      <circle cx="22" cy="22" r="3" fill="currentColor" />
    </svg>
  );
}

// DNA双螺旋
function DNA({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 100" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 5 Q30 25 10 50 Q30 75 10 95" strokeLinecap="round" />
      <path d="M30 5 Q10 25 30 50 Q10 75 30 95" strokeLinecap="round" />
      {/* 横档 */}
      <line x1="10" y1="15" x2="30" y2="15" />
      <line x1="30" y1="30" x2="10" y2="30" />
      <line x1="10" y1="45" x2="30" y2="45" />
      <line x1="30" y1="60" x2="10" y2="60" />
      <line x1="10" y1="75" x2="30" y2="75" />
    </svg>
  );
}

// 数学公式 π ∫ √ 等
function MathFormula({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 50" className={className} fill="currentColor">
      <text x="5" y="35" fontSize="28" fontFamily="serif" fontStyle="italic">
        E=mc²
      </text>
    </svg>
  );
}

// 烧瓶/锥形瓶
function Flask({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 70" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      {/* 瓶口 */}
      <rect x="20" y="5" width="10" height="10" />
      {/* 锥形瓶身 */}
      <path d="M20 15 L10 55 Q10 65 25 65 Q40 65 40 55 L30 15" strokeLinejoin="round" />
      {/* 液体 */}
      <path
        d="M14 50 Q25 45 36 50 L37 55 Q37 62 25 62 Q13 62 13 55 Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* 气泡 */}
      <circle cx="22" cy="55" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="28" cy="52" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// 齿轮
function Gear({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor">
      <path
        d="M30 0 L33 10 L42 5 L40 15 L50 18 L43 26 L53 30 L43 34 L50 42 L40 45 L42 55 L33 50 L30 60 L27 50 L18 55 L20 45 L10 42 L17 34 L7 30 L17 26 L10 18 L20 15 L18 5 L27 10 Z"
        opacity="0.8"
      />
      <circle cx="30" cy="30" r="12" fill="white" />
      <circle cx="30" cy="30" r="8" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// ============ 主页面组件 ============

function Home() {
  const { user, loading } = useAuth();
  const [healthStatus, setHealthStatus] = useState<string>("正在检查...");
  const [dbStatus, setDbStatus] = useState<string>("正在检查...");

  useEffect(() => {
    if (loading) return;
    apiClient
      .get("/health")
      .then((res) => setHealthStatus(res.data.message))
      .catch(() => setHealthStatus("连接失败"));
    apiClient
      .get("/health/db")
      .then((res) => setDbStatus(res.data.message))
      .catch(() => setDbStatus("连接失败"));
  }, [loading]);

  // ==================== 已登录用户 - 蓝色风格仪表盘 ====================
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* 欢迎横幅 - 窗中风景风格 */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-sky-400 to-sky-300 p-8 mb-8 shadow-xl shadow-sky-200">
            {/* 装饰元素 */}
            <div className="absolute top-4 right-8 opacity-20">
              <Atom className="w-20 h-20 text-white" />
            </div>
            <div className="absolute bottom-2 right-20 opacity-15">
              <Beaker className="w-12 h-16 text-white" />
            </div>
            <Cloud
              className="w-32 h-16 top-2 left-10 opacity-40"
              style={{ animation: "cloudMove 30s linear infinite" }}
            />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  欢迎回来，{user.full_name}
                </h1>
                <p className="text-sky-100">
                  {user.group_id
                    ? "你已加入课题组，开始探索知识的海洋吧"
                    : "你还没有加入课题组，请先创建或加入一个课题组"}
                </p>
              </div>
              <div className="hidden md:block w-24 h-20 opacity-80">
                <ThinkingCatMascot />
              </div>
            </div>
          </div>

          {/* 用户信息卡片 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5 hover:shadow-lg hover:shadow-sky-100/50 transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">账号</p>
                  <p className="text-sm font-medium text-slate-800">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">角色</p>
                  <p className="text-sm font-medium text-slate-800">
                    {user.role === "admin" ? "管理员" : "成员"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5 hover:shadow-lg hover:shadow-sky-100/50 transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-navy-100 rounded-xl flex items-center justify-center">
                  <Atom className="w-5 h-5 text-navy-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">课题组</p>
                  <p className="text-sm font-medium text-slate-800">
                    {user.group_id ? "已加入" : "未加入"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5 hover:shadow-lg hover:shadow-sky-100/50 transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">注册时间</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(user.created_at).toLocaleDateString("zh-CN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-sky-500 rounded-full"></span>
              快捷操作
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/upload"
                className="group flex items-center space-x-4 bg-white rounded-2xl shadow-sm border border-sky-100 p-5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-sky-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-800">上传 PPT</p>
                  <p className="text-sm text-slate-500">上传 PPTX 文件到组会</p>
                </div>
              </Link>

              <Link
                to="/meetings"
                className="group flex items-center space-x-4 bg-white rounded-2xl shadow-sm border border-sky-100 p-5 hover:border-navy-300 hover:shadow-lg hover:shadow-navy-100/30 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-navy-400 to-navy-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-navy-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-800">组会</p>
                  <p className="text-sm text-slate-500">查看和管理组会 PPT</p>
                </div>
              </Link>

              {user.group_id ? (
                <Link
                  to={`/groups/${user.group_id}`}
                  className="group flex items-center space-x-4 bg-white rounded-2xl shadow-sm border border-sky-100 p-5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-sky-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">课题组详情</p>
                    <p className="text-sm text-slate-500">查看成员与信息</p>
                  </div>
                </Link>
              ) : (
                <>
                  <Link
                    to="/groups/create"
                    className="group flex items-center space-x-4 bg-white rounded-2xl shadow-sm border border-sky-100 p-5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">创建课题组</p>
                      <p className="text-sm text-slate-500">创建新课题组并邀请成员</p>
                    </div>
                  </Link>
                </>
              )}
            </div>

            {!user.group_id && (
              <div className="mt-4">
                <Link
                  to="/groups/join"
                  className="inline-flex items-center space-x-3 bg-white rounded-2xl shadow-sm border border-sky-100 p-5 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all w-full sm:w-auto"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">加入课题组</p>
                    <p className="text-sm text-slate-500">通过邀请码加入已有课题组</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* 系统状态 */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-sky-500 rounded-full"></span>
              系统状态
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">API 服务状态</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      healthStatus.includes("running")
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${healthStatus.includes("running") ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                    {healthStatus.includes("running") ? "运行正常" : "连接异常"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{healthStatus}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">数据库状态</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      dbStatus.includes("healthy")
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${dbStatus.includes("healthy") ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                    {dbStatus.includes("healthy") ? "运行正常" : "连接异常"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{dbStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 未登录用户 - 窗户风格着陆页 ====================
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 天空渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-300 to-sky-400" />

      {/* 漂浮云朵 */}
      <Cloud
        className="w-40 h-20"
        style={{
          top: "8%",
          left: "-5%",
          animation: "cloudMove 45s linear infinite",
        }}
      />
      <Cloud
        className="w-32 h-16"
        style={{
          top: "15%",
          left: "20%",
          animation: "cloudMove 55s linear infinite",
          animationDelay: "-20s",
          opacity: 0.6,
        }}
      />
      <Cloud
        className="w-48 h-24"
        style={{
          top: "5%",
          right: "10%",
          animation: "cloudMove 60s linear infinite",
          animationDelay: "-35s",
        }}
      />
      <Cloud
        className="w-28 h-14"
        style={{
          top: "22%",
          right: "25%",
          animation: "cloudMove 50s linear infinite",
          animationDelay: "-10s",
          opacity: 0.5,
        }}
      />

      {/* 理工科实验元素装饰 - 深蓝色 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 左上角区域 */}
        <Beaker className="absolute top-20 left-8 w-12 h-16 text-navy-800 lab-element rotate-12" />
        <Atom className="absolute top-32 left-24 w-16 h-16 text-navy-700 lab-element" />
        <MathFormula className="absolute top-48 left-6 w-24 h-12 text-navy-800 lab-element" />

        {/* 右上角区域 */}
        <Microscope className="absolute top-24 right-12 w-14 h-16 text-navy-800 lab-element -rotate-6" />
        <DNA className="absolute top-52 right-6 w-8 h-20 text-navy-700 lab-element rotate-12" />
        <Gear className="absolute top-16 right-40 w-10 h-10 text-navy-600 lab-element animate-spin" style={{ animationDuration: "20s" }} />

        {/* 左下角区域 */}
        <Flask className="absolute bottom-32 left-12 w-10 h-14 text-navy-700 lab-element -rotate-12" />
        <Gear className="absolute bottom-48 left-32 w-8 h-8 text-navy-600 lab-element animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />

        {/* 右下角区域 */}
        <Beaker className="absolute bottom-28 right-16 w-10 h-14 text-navy-800 lab-element rotate-6" />
        <Atom className="absolute bottom-52 right-36 w-12 h-12 text-navy-700 lab-element" />

        {/* 中间散布 */}
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-navy-400 rounded-full lab-element animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-navy-500 rounded-full lab-element animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-navy-400 rounded-full lab-element animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* 窗户把手装饰 - 左右两侧 */}
      <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <div className="w-3 h-20 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full shadow-lg border border-slate-300/50" />
      </div>
      <div className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <div className="w-3 h-20 bg-gradient-to-l from-slate-300 to-slate-200 rounded-full shadow-lg border border-slate-300/50" />
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* ============ 大窗户 Hero 区域 ============ */}
          <div className="relative mt-4">
            {/* 窗户框架 */}
            <div className="window-frame rounded-[2rem] p-4 sm:p-6 md:p-8">
              {/* 窗框边缘装饰 */}
              <div className="absolute top-4 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-slate-300/50 to-transparent rounded-full" />
              <div className="absolute bottom-4 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-slate-300/50 to-transparent rounded-full" />

              {/* 窗户竖框条 - 十字分隔 */}
              <div className="absolute left-1/2 top-6 bottom-6 w-3 window-mullion-v rounded-full -translate-x-1/2 z-10 hidden md:block" />
              {/* 窗户横框条 */}
              <div className="absolute top-1/2 left-6 right-6 h-3 window-mullion rounded-full -translate-y-1/2 z-10 hidden md:block" />

              {/* 窗格 - 4格玻璃 */}
              <div className="grid md:grid-cols-2 gap-0 relative z-0">
                {/* 左上格 - 标题文字 */}
                <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-center">
                  {/* 小窗把手 */}
                  <div className="hidden md:flex absolute right-2 md:right-auto md:left-4 top-1/2 w-4 h-8 bg-slate-300 rounded-md -translate-y-1/2 z-20 items-center justify-center">
                    <div className="w-1 h-4 bg-slate-400 rounded-full" />
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {/* 标签 */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/80 text-sm text-navy-700 font-medium">
                      <Atom className="w-4 h-4" />
                      <span>科研协作 · 知识沉淀</span>
                    </div>

                    {/* 主标题 */}
                    <div>
                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                        <span className="text-navy-800">Lab</span>
                        <span className="text-sky-600">Slide</span>
                      </h1>
                      <p className="mt-3 text-lg sm:text-xl text-navy-700 font-medium">
                        打开科研之窗
                      </p>
                      <p className="mt-2 text-base text-navy-600/80 leading-relaxed">
                        课题组组会 PPT 在线批注平台
                        <br />
                        让每一次讨论都成为知识的积淀
                      </p>
                    </div>

                    {/* 按钮 */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Link
                        to="/login"
                        className="group inline-flex items-center justify-center px-7 py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl shadow-lg shadow-sky-300/50 hover:shadow-xl hover:shadow-sky-400/50 hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <span>开始使用</span>
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center px-7 py-3.5 bg-white/70 backdrop-blur-sm text-navy-700 font-semibold rounded-xl border border-white/80 hover:bg-white/90 hover:shadow-md transition-all duration-200"
                      >
                        了解更多
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 右上格 - 卡通猫在窗台上 */}
                <div className="p-4 sm:p-6 md:p-8 flex items-end justify-center relative min-h-[240px] md:min-h-[320px]">
                  {/* 窗台上的猫 */}
                  <div className="relative w-full max-w-[220px] animate-float-slow">
                    <ThinkingCatMascot />
                  </div>
                </div>

                {/* 左下格 - 功能介绍1 */}
                <div className="p-4 sm:p-5 md:p-6 border-t md:border-t-0 md:border-r border-slate-200/50">
                  <div className="glass-panel rounded-2xl p-5 h-full hover:scale-[1.02] transition-transform duration-300">
                    <div className="w-11 h-11 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-sky-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-navy-800 mb-1">PPT 在线预览</h3>
                    <p className="text-sm text-navy-600/70 leading-relaxed">
                      支持 PPTX 文件上传，保持原始排版，浏览器内直接分页查看
                    </p>
                  </div>
                </div>

                {/* 右下格 - 功能介绍2 */}
                <div className="p-4 sm:p-5 md:p-6 border-t border-slate-200/50">
                  <div className="glass-panel rounded-2xl p-5 h-full hover:scale-[1.02] transition-transform duration-300">
                    <div className="w-11 h-11 bg-gradient-to-br from-navy-500 to-navy-700 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-navy-200">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-navy-800 mb-1">在线批注讨论</h3>
                    <p className="text-sm text-navy-600/70 leading-relaxed">
                      在幻灯片上添加批注，团队成员可见，记录讨论要点与灵感
                    </p>
                  </div>
                </div>
              </div>

              {/* 窗台 */}
              <div className="absolute -bottom-2 left-8 right-8 h-4 bg-gradient-to-b from-slate-200 to-slate-300 rounded-b-2xl shadow-inner" />
              <div className="absolute -bottom-4 left-12 right-12 h-2 bg-slate-400/30 rounded-b-xl blur-sm" />
            </div>

            {/* 窗户的外发光效果 */}
            <div className="absolute -inset-4 bg-sky-300/20 rounded-[3rem] blur-2xl -z-10" />
          </div>

          {/* ============ 功能卡片区域 ============ */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                ),
                title: "课题组协作",
                desc: "邀请码加入课题组，成员之间共享PPT与批注",
              },
              {
                icon: (
                  <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center">
                    <Beaker className="w-6 h-8 text-navy-600" />
                  </div>
                ),
                title: "科研专用",
                desc: "为学术场景设计，专注组会汇报与学术讨论",
              },
              {
                icon: (
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                ),
                title: "知识沉淀",
                desc: "每次批注都被记录，积累团队的学术智慧",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-panel rounded-2xl p-5 hover:bg-white/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {feature.icon}
                <h3 className="mt-3 text-base font-bold text-navy-800">{feature.title}</h3>
                <p className="mt-1 text-sm text-navy-600/70 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* ============ 系统状态 ============ */}
          <div className="mt-8 mb-4">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    healthStatus.includes("running")
                      ? "bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse"
                      : "bg-red-400"
                  }`}
                />
                <span className="text-navy-700/70">API 服务</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    dbStatus.includes("healthy")
                      ? "bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse"
                      : "bg-red-400"
                  }`}
                />
                <span className="text-navy-700/70">数据库</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
