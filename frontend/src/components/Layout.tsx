import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">LabSlide</span>
            </Link>

            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "text-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                首页
              </Link>

              {user ? (
                <>
                  {user.group_id && (
                    <Link
                      to={`/groups/${user.group_id}`}
                      className={`text-sm font-medium transition-colors ${
                        location.pathname.startsWith("/groups/")
                          ? "text-primary-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      课题组
                    </Link>
                  )}

                  <Link
                    to="/upload"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === "/upload"
                        ? "text-primary-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    上传 PPT
                  </Link>

                  {user.group_id && (
                    <Link
                      to="/meetings"
                      className={`text-sm font-medium transition-colors ${
                        location.pathname.startsWith("/meetings")
                          ? "text-primary-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      组会
                    </Link>
                  )}

                  {/* 用户信息下拉 */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                      <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {user.full_name?.charAt(0) || user.email?.charAt(0)}
                      </div>
                      <span>{user.full_name}</span>
                      <svg
                        className="w-4 h-4"
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
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === "/login"
                      ? "text-primary-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  登录
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          LabSlide &copy; {new Date().getFullYear()} — 课题组组会 PPT
          在线批注与知识沉淀平台
        </div>
      </footer>
    </div>
  );
}

export default Layout;