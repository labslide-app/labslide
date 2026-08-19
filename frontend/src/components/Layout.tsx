import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// 罗小黑风格思考猫 - SVG组件
function ThinkingCat() {
  return (
    <svg
      viewBox="0 0 120 100"
      className="w-10 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 身体 - 黑色圆润身体 */}
      <ellipse cx="60" cy="75" rx="35" ry="22" fill="#1e293b" />
      {/* 头部 */}
      <ellipse cx="60" cy="50" rx="28" ry="26" fill="#1e293b" />
      {/* 左耳 */}
      <path d="M35 32 L28 8 L48 25 Z" fill="#1e293b" />
      <path d="M36 28 L32 14 L44 24 Z" fill="#475569" />
      {/* 右耳 */}
      <path d="M85 32 L92 8 L72 25 Z" fill="#1e293b" />
      <path d="M84 28 L88 14 L76 24 Z" fill="#475569" />
      {/* 眼睛 - 大而圆，发呆思考状 */}
      <ellipse cx="48" cy="48" rx="7" ry="8" fill="white" />
      <ellipse cx="72" cy="48" rx="7" ry="8" fill="white" />
      <ellipse cx="49" cy="49" rx="4" ry="5" fill="#0ea5e9" />
      <ellipse cx="73" cy="49" rx="4" ry="5" fill="#0ea5e9" />
      <circle cx="50" cy="47" r="1.5" fill="white" />
      <circle cx="74" cy="47" r="1.5" fill="white" />
      {/* 鼻子 */}
      <ellipse cx="60" cy="56" rx="3" ry="2" fill="#f472b6" />
      {/* 嘴巴 - 微微张嘴思考 */}
      <path
        d="M57 60 Q60 64 63 60"
        stroke="#475569"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* 尾巴 */}
      <path
        d="M95 72 Q110 60 105 45 Q102 38 98 40"
        stroke="#1e293b"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* 思考泡泡 */}
      <circle cx="100" cy="28" r="8" fill="white" opacity="0.9" />
      <circle cx="108" cy="18" r="6" fill="white" opacity="0.9" />
      <circle cx="114" cy="10" r="4" fill="white" opacity="0.9" />
      <text x="96" y="32" fontSize="10" fill="#0ea5e9" fontWeight="bold">
        ?
      </text>
    </svg>
  );
}

// 原子结构图标
function AtomIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        transform="rotate(120 12 12)"
      />
    </svg>
  );
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 - 天蓝色玻璃质感 */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isHome
            ? "bg-sky-400/80 backdrop-blur-md border-b border-sky-300/50"
            : "bg-white/90 backdrop-blur-md shadow-sm border-b border-sky-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              {/* Logo - 窗户+实验瓶组合 */}
              <div
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                  isHome
                    ? "bg-white/30 backdrop-blur-sm border border-white/50"
                    : "bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-200"
                }`}
              >
                <svg
                  viewBox="0 0 32 32"
                  className="w-6 h-6"
                  fill="none"
                >
                  {/* 窗户轮廓 */}
                  <rect
                    x="6"
                    y="4"
                    width="20"
                    height="24"
                    rx="2"
                    stroke={isHome ? "white" : "white"}
                    strokeWidth="2"
                    fill={isHome ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.3)"}
                  />
                  <line
                    x1="16"
                    y1="4"
                    x2="16"
                    y2="28"
                    stroke={isHome ? "white" : "white"}
                    strokeWidth="1.5"
                  />
                  <line
                    x1="6"
                    y1="16"
                    x2="26"
                    y2="16"
                    stroke={isHome ? "white" : "white"}
                    strokeWidth="1.5"
                  />
                  {/* 小实验元素在右下角 */}
                  <circle
                    cx="22"
                    cy="23"
                    r="2"
                    fill={isHome ? "#fbbf24" : "#fbbf24"}
                  />
                </svg>
              </div>
              <div className="flex items-center">
                <span
                  className={`text-xl font-bold tracking-tight ${
                    isHome ? "text-white" : "text-slate-800"
                  }`}
                >
                  Lab
                </span>
                <span
                  className={`text-xl font-bold tracking-tight ${
                    isHome ? "text-sky-100" : "text-sky-600"
                  }`}
                >
                  Slide
                </span>
                <div className="ml-1 mt-1">
                  <ThinkingCat />
                </div>
              </div>
            </Link>

            <nav className="flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === "/"
                    ? isHome
                      ? "bg-white/25 text-white"
                      : "bg-sky-50 text-sky-700"
                    : isHome
                    ? "text-white/80 hover:bg-white/15 hover:text-white"
                    : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                }`}
              >
                首页
              </Link>

              {user ? (
                <>
                  {user.group_id && (
                    <Link
                      to={`/groups/${user.group_id}`}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        location.pathname.startsWith("/groups/")
                          ? isHome
                            ? "bg-white/25 text-white"
                            : "bg-sky-50 text-sky-700"
                          : isHome
                          ? "text-white/80 hover:bg-white/15 hover:text-white"
                          : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                      }`}
                    >
                      课题组
                    </Link>
                  )}

                  <Link
                    to="/upload"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === "/upload"
                        ? isHome
                          ? "bg-white/25 text-white"
                          : "bg-sky-50 text-sky-700"
                        : isHome
                        ? "text-white/80 hover:bg-white/15 hover:text-white"
                        : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                    }`}
                  >
                    上传PPT
                  </Link>

                  {user.group_id && (
                    <Link
                      to="/meetings"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        location.pathname.startsWith("/meetings")
                          ? isHome
                            ? "bg-white/25 text-white"
                            : "bg-sky-50 text-sky-700"
                          : isHome
                          ? "text-white/80 hover:bg-white/15 hover:text-white"
                          : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                      }`}
                    >
                      组会
                    </Link>
                  )}

                  {/* 用户信息下拉 */}
                  <div className="relative group ml-2">
                    <button
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isHome
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isHome
                            ? "bg-white text-sky-600"
                            : "bg-sky-500 text-white"
                        }`}
                      >
                        {user.full_name?.charAt(0) || user.email?.charAt(0)}
                      </div>
                      <span>{user.full_name}</span>
                      <svg
                        className="w-4 h-4 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* 下拉菜单 */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-sky-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-lg mx-1"
                        style={{ width: "calc(100% - 8px)" }}
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === "/login"
                      ? isHome
                        ? "bg-white text-sky-600 shadow-lg"
                        : "bg-sky-500 text-white shadow-lg shadow-sky-200"
                      : isHome
                      ? "bg-white/25 text-white hover:bg-white/40 border border-white/40"
                      : "bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-200"
                  }`}
                >
                  登录 / 注册
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className={`flex-1 ${isHome ? "" : "bg-slate-50"}`}>
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer
        className={`py-8 transition-all duration-500 ${
          isHome
            ? "bg-sky-900/40 backdrop-blur-sm border-t border-sky-300/30"
            : "bg-white border-t border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <AtomIcon
                className={`w-5 h-5 ${isHome ? "text-sky-300" : "text-sky-500"}`}
              />
              <span
                className={`text-sm font-medium ${
                  isHome ? "text-sky-100" : "text-slate-700"
                }`}
              >
                LabSlide
              </span>
              <span
                className={`text-sm ${
                  isHome ? "text-sky-300/70" : "text-slate-400"
                }`}
              >
                — 让科研讨论更高效
              </span>
            </div>
            <p
              className={`text-sm ${
                isHome ? "text-sky-200/60" : "text-slate-400"
              }`}
            >
              &copy; {new Date().getFullYear()} 课题组组会 PPT 在线批注与知识沉淀平台
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
