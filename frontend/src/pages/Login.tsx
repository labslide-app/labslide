import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    invite_code: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register(
          formData.email,
          formData.password,
          formData.full_name,
          formData.invite_code
        );
      } else {
        await login(formData.email, formData.password);
      }
      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response: { data: { detail: string } } };
        setError(
          Array.isArray(axiosErr.response.data.detail)
            ? axiosErr.response.data.detail
                .map((d: { msg: string }) => d.msg)
                .join("; ")
            : axiosErr.response.data.detail || "操作失败"
        );
      } else {
        setError("网络错误，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-12rem)] flex items-center justify-center px-4">
      {/* 背景氛围 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(900px_480px_at_50%_-10%,rgba(201,168,106,0.10),transparent),radial-gradient(700px_400px_at_90%_110%,rgba(127,195,184,0.08),transparent)]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-bold text-[#f5f2ea] text-center mb-2">
            {isRegister ? "注册 LabSlide" : "登录 LabSlide"}
          </h2>
          <p className="text-center text-[#f5f2ea]/55 text-sm mb-6">
            {isRegister ? "加入课题组，开始协作" : "欢迎回来，请登录你的账号"}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-[#f5f2ea]/70 mb-1">
                邮箱
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-[#f5f2ea] placeholder-white/30 focus:ring-2 focus:ring-[#c9a86a]/25 focus:border-[#c9a86a]/60 outline-none transition"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* 注册时额外字段 */}
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-[#f5f2ea]/70 mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  required
                  placeholder="你的真实姓名"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-[#f5f2ea] placeholder-white/30 focus:ring-2 focus:ring-[#c9a86a]/25 focus:border-[#c9a86a]/60 outline-none transition"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>
            )}

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-[#f5f2ea]/70 mb-1">
                密码
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="至少 6 位密码"
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-[#f5f2ea] placeholder-white/30 focus:ring-2 focus:ring-[#c9a86a]/25 focus:border-[#c9a86a]/60 outline-none transition"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            {/* 注册邀请码（可选） */}
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-[#f5f2ea]/70 mb-1">
                  邀请码{" "}
                  <span className="text-[#f5f2ea]/40 font-normal">（可选）</span>
                </label>
                <input
                  type="text"
                  placeholder="输入课题组邀请码加入"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-[#f5f2ea] placeholder-white/30 focus:ring-2 focus:ring-[#c9a86a]/25 focus:border-[#c9a86a]/60 outline-none transition"
                  value={formData.invite_code}
                  onChange={(e) =>
                    setFormData({ ...formData, invite_code: e.target.value })
                  }
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] rounded-lg font-medium shadow-lg shadow-[#c9a86a]/20 hover:brightness-110 focus:ring-2 focus:ring-[#c9a86a]/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  处理中...
                </span>
              ) : isRegister ? (
                "注册"
              ) : (
                "登录"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-sm text-[#c9a86a] hover:text-[#e6cd96]"
            >
              {isRegister ? "已有账号？去登录" : "没有账号？去注册"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;