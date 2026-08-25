import { useState, useMemo, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";

/** 将任意输入规范化为 LAB-XXXX-XXXX 格式 */
function normalizeCode(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  // 去掉可能的前缀 LAB
  const core = cleaned.startsWith("LAB") ? cleaned.slice(3) : cleaned;
  // 取前 8 位有效字符
  const code = core.slice(0, 8);
  if (code.length >= 8) {
    return `LAB-${code.slice(0, 4)}-${code.slice(4, 8)}`;
  }
  // 不够 8 位，返回原始输入（让后端校验报错）
  return raw.trim();
}

// 标准邀请码 LAB-XXXX-XXXX 的长度（含两个连字符）
const INVITE_CODE_LENGTH = 13;

function JoinGroup() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [joinedGroupId, setJoinedGroupId] = useState<string | null>(null);

  // 实时预览规范化后的邀请码
  const preview = useMemo(() => {
    if (!inviteCode.trim()) return "";
    const normalized = normalizeCode(inviteCode);
    return normalized.length >= INVITE_CODE_LENGTH ? normalized : "";
  }, [inviteCode]);

  // 如果用户已加入课题组，直接显示提示
  const alreadyInGroup = user?.group_id != null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = inviteCode.trim();
    if (!trimmed) {
      setError("请输入邀请码");
      return;
    }

    const normalized = normalizeCode(trimmed);
    if (normalized.length < INVITE_CODE_LENGTH) {
      setError("邀请码格式不正确，需要 8 位字符（如 LAB-XXXX-XXXX）");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/groups/join", {
        invite_code: normalized,
      });
      const groupId = response.data.id;
      setJoinedGroupId(groupId);
      await refreshUser();
      // 立即跳转到课题组详情页
      navigate(`/groups/${groupId}`, { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response: { data: { detail: string }; status: number };
        };
        const detail = axiosErr.response.data.detail || "加入失败";
        if (axiosErr.response.status === 409) {
          // 已加入课题组，刷新用户信息后跳转
          await refreshUser();
          setError("你已加入课题组，正在跳转...");
          setTimeout(() => navigate("/"), 1000);
        } else {
          setError(detail);
        }
      } else {
        setError("网络错误，请检查后端服务是否正常运行");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== 已加入课题组 ====================
  if (alreadyInGroup && !joinedGroupId) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 bg-[#7fc3b8]/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#9fd8cf]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#f5f2ea] mb-2">你已在课题组中</h2>
          <p className="text-[#f5f2ea]/55 mb-6">
            每个用户只能加入一个课题组。如需更换课题组，请先退出当前课题组。
          </p>
          <div className="space-y-3">
            <Link
              to={`/groups/${user!.group_id}`}
              className="block w-full py-2.5 bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] rounded-lg font-medium shadow-lg shadow-[#c9a86a]/20 hover:brightness-110 transition-colors"
            >
              查看我的课题组
            </Link>
            <Link
              to="/"
              className="block w-full py-2.5 border border-white/20 text-[#f5f2ea]/80 rounded-lg font-medium hover:border-white/40 hover:text-[#f5f2ea] transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 加入成功（即将跳转） ====================
  if (joinedGroupId) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 bg-[#7fc3b8]/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#9fd8cf] animate-bounce"
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
          <h2 className="text-2xl font-bold text-[#f5f2ea] mb-2">加入成功！</h2>
          <p className="text-[#f5f2ea]/55 mb-6">正在跳转到课题组详情页...</p>
          <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-[#c9a86a] rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-12 px-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-md">
        <h2 className="text-2xl font-bold text-[#f5f2ea] text-center mb-2">
          加入课题组
        </h2>
        <p className="text-center text-[#f5f2ea]/55 text-sm mb-6">
          输入管理员提供的邀请码，即可加入课题组
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300 flex items-start space-x-2">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#f5f2ea]/70 mb-1">
              邀请码
            </label>
            <input
              type="text"
              required
              placeholder="直接粘贴邀请码，如 LAB-XXXX-XXXX"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-lg text-center text-lg font-mono tracking-wider text-[#f5f2ea] placeholder-white/30 focus:ring-2 focus:ring-[#c9a86a]/25 focus:border-[#c9a86a]/60 outline-none transition"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value);
                setError("");
              }}
              autoComplete="off"
              autoFocus
            />
            {/* 实时预览 */}
            {preview && (
              <div className="mt-2 flex items-center justify-center space-x-2 text-sm">
                <span className="text-[#f5f2ea]/40">识别为：</span>
                <span className="font-mono font-bold text-[#e6cd96] bg-[#c9a86a]/10 px-2 py-0.5 rounded">
                  {preview}
                </span>
              </div>
            )}
            {!preview && inviteCode.trim() && (
              <p className="mt-1 text-xs text-[#f5f2ea]/40 text-center">
                邀请码需要包含 8 位字母或数字
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] rounded-lg font-semibold shadow-lg shadow-[#c9a86a]/20 hover:brightness-110 focus:ring-2 focus:ring-[#c9a86a]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
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
                加入中...
              </span>
            ) : (
              "加入课题组"
            )}
          </button>
        </form>

        {/* 底部提示 */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-[#f5f2ea]/40 text-center">
            没有邀请码？
            <Link to="/groups/create" className="text-[#c9a86a] hover:underline ml-1">
              创建一个课题组
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default JoinGroup;