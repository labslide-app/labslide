import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";

function CreateGroup() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 创建成功后的状态
  const [created, setCreated] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post("/groups", { name: name.trim() });
      setInviteCode(response.data.invite_code);
      setCreated(true);
      await refreshUser();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response: { data: { detail: string } };
        };
        setError(axiosErr.response.data.detail || "创建失败");
      } else {
        setError("网络错误，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 回退：选中文本
      const input = document.getElementById(
        "invite-code-display"
      ) as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  // ==================== 创建成功后展示 ====================
  if (created) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          {/* 成功图标 */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            课题组创建成功！
          </h2>
          <p className="text-gray-500 mb-6">
            将以下邀请码分享给成员，他们即可加入课题组
          </p>

          {/* 邀请码展示 */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-xs text-gray-500 mb-2">邀请码</p>
            <div className="flex items-center justify-center space-x-3">
              <input
                id="invite-code-display"
                type="text"
                readOnly
                value={inviteCode}
                className="text-2xl font-mono font-bold text-primary-700 bg-white border border-gray-200 rounded-lg px-4 py-2 text-center w-56 focus:outline-none"
              />
              <button
                onClick={handleCopyCode}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                }`}
              >
                {copied ? "已复制" : "复制"}
              </button>
            </div>
          </div>

          {/* 提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-700 font-medium mb-1">
              如何邀请成员？
            </p>
            <ol className="text-sm text-blue-600 list-decimal list-inside space-y-1">
              <li>将邀请码分享给课题组成员</li>
              <li>成员在注册时填写邀请码，或在登录后通过"加入课题组"页面输入</li>
              <li>成员加入后即可参与组会、批注 PPT</li>
            </ol>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // ==================== 创建表单 ====================
  return (
    <div className="max-w-lg mx-auto mt-12 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          创建课题组
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          创建后你将自动成为课题组管理员
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              课题组名称
            </label>
            <input
              type="text"
              required
              placeholder="例如：计算机视觉课题组"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-400">
              {name.length}/200
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                创建中...
              </span>
            ) : (
              "创建课题组"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateGroup;