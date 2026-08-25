import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/* 极简几何猫头剪影 —— 品牌 Logo 元素 */
function CatMark({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M7 12.5 V4.5 L12.6 8.6 C13.7 8.2 14.8 8 16 8 C17.2 8 18.3 8.2 19.4 8.6 L25 4.5 V12.5 C26.9 14.3 28 16.7 28 19 C28 24.2 22.6 28 16 28 C9.4 28 4 24.2 4 19 C4 16.7 5.1 14.3 7 12.5 Z" />
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
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
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

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332] text-[#f5f2ea]">
      {/* 导航栏 - 深色玻璃质感 */}
      <header className="sticky top-0 z-50 bg-[#131a26]/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              {/* Logo - 窗户+几何猫组合 */}
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:scale-105">
                <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
                  <rect x="6" y="4" width="20" height="24" rx="2" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.08)" />
                  <line x1="16" y1="4" x2="16" y2="28" stroke="white" strokeWidth="1.5" />
                  <line x1="6" y1="16" x2="26" y2="16" stroke="white" strokeWidth="1.5" />
                  <circle cx="22" cy="23" r="2" fill="#c9a86a" />
                </svg>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold tracking-tight text-[#f5f2ea]">Lab</span>
                <span className="text-xl font-bold tracking-tight text-[#c9a86a]">Slide</span>
                <div className="ml-1.5 text-[#c9a86a]/70">
                  <CatMark className="w-4 h-4" />
                </div>
              </div>
            </Link>

            <nav className="flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === "/"
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
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
                          ? "bg-white/15 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      课题组
                    </Link>
                  )}

                  <Link
                    to="/upload"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === "/upload"
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    上传PPT
                  </Link>

                  {user.group_id && (
                    <Link
                      to="/meetings"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        location.pathname.startsWith("/meetings")
                          ? "bg-white/15 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      组会
                    </Link>
                  )}

                  {/* 用户信息下拉 */}
                  <div className="relative group ml-2">
                    <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-white/10 text-white hover:bg-white/20">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#c9a86a] text-[#1a2332]">
                        {user.full_name?.charAt(0) || user.email?.charAt(0)}
                      </div>
                      <span>{user.full_name}</span>
                      <svg
                        className="w-4 h-4 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* 下拉菜单 */}
                    <div className="absolute right-0 mt-2 w-48 bg-[#131a26] rounded-xl shadow-xl border border-white/10 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-sm font-medium text-[#f5f2ea] truncate">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-[#f5f2ea]/50 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] shadow-lg shadow-[#c9a86a]/20 hover:brightness-110"
                >
                  登录 / 注册
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 bg-[#1a2332]">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="py-8 bg-[#131a26]/80 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <AtomIcon className="w-5 h-5 text-[#c9a86a]" />
              <span className="text-sm font-medium text-[#f5f2ea]">LabSlide</span>
              <span className="text-sm text-white/50">— 让科研讨论更高效</span>
            </div>
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} 课题组组会 PPT 在线批注与知识沉淀平台
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;