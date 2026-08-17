import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  const { user, loading } = useAuth();
  const [healthStatus, setHealthStatus] = useState<string>("正在检查...");
  const [dbStatus, setDbStatus] = useState<string>("正在检查...");

  useEffect(() => {
    // 确保认证状态加载完成后才检查
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

  // ==================== 已登录用户 - 仪表盘 ====================
  if (user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 欢迎横幅 */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-2xl font-bold">
            欢迎回来，{user.full_name}
          </h1>
          <p className="mt-2 text-primary-100">
            {user.group_id
              ? "你已加入课题组，可以开始上传和批注 PPT"
              : "你还没有加入课题组，请先创建或加入一个课题组"}
          </p>
        </div>

        {/* 用户信息卡片 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">账号</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">角色</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.role === "admin" ? "管理员" : "成员"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">课题组</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.group_id ? "已加入" : "未加入"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">注册时间</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString("zh-CN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            快捷操作
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/upload"
              className="flex items-center space-x-4 bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">上传 PPT</p>
                <p className="text-sm text-gray-500">
                  上传 PPTX 文件到组会，自动转换
                </p>
              </div>
            </Link>

            <Link
              to="/meetings"
              className="flex items-center space-x-4 bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">组会</p>
                <p className="text-sm text-gray-500">
                  查看和管理组会，浏览组会 PPT
                </p>
              </div>
            </Link>

            {user.group_id ? (
              <Link
                to={`/groups/${user.group_id}`}
                className="flex items-center space-x-4 bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">课题组详情</p>
                  <p className="text-sm text-gray-500">
                    查看课题组信息与成员
                  </p>
                </div>
              </Link>
            ) : (
              <>
                <Link
                  to="/groups/create"
                  className="flex items-center space-x-4 bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">创建课题组</p>
                    <p className="text-sm text-gray-500">
                      创建一个新的课题组并邀请成员
                    </p>
                  </div>
                </Link>

                <Link
                  to="/groups/join"
                  className="flex items-center space-x-4 bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">加入课题组</p>
                    <p className="text-sm text-gray-500">
                      通过邀请码加入已有课题组
                    </p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 系统状态 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            系统状态
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  API 服务状态
                </p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    healthStatus.includes("running")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {healthStatus.includes("running") ? "正常" : "异常"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{healthStatus}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">数据库状态</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    dbStatus.includes("healthy")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {dbStatus.includes("healthy") ? "正常" : "异常"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{dbStatus}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 未登录用户 - 着陆页 ====================
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero 区域 */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          LabSlide
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          课题组组会 PPT 在线批注与知识沉淀平台
        </p>
        <p className="mt-2 text-gray-500">
          上传 PPT，在线批注，团队讨论，知识沉淀
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            开始使用
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            了解更多
          </Link>
        </div>
      </div>

      {/* 系统状态卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            API 服务状态
          </h3>
          <p
            className={`text-sm ${
              healthStatus.includes("running")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {healthStatus}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            数据库状态
          </h3>
          <p
            className={`text-sm ${
              dbStatus.includes("healthy")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {dbStatus}
          </p>
        </div>
      </div>

      {/* 功能预告 */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {[
          { title: "PPT 上传与预览", desc: "支持上传 PPTX 文件，在线分页预览" },
          { title: "在线批注", desc: "在幻灯片上添加文本批注与标记" },
          { title: "知识沉淀", desc: "批注内容可导出为结构化笔记" },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-500">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;