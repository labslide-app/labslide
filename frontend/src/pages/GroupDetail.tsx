import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";

interface GroupDetail {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  creator_name: string;
  created_at: string;
  member_count: number;
}

interface Member {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const cardCls =
  "rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md";

function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 操作状态
  const [actionLoading, setActionLoading] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState("");
  const [showDissolveConfirm, setShowDissolveConfirm] = useState(false);

  const fetchGroupData = useCallback(() => {
    if (!groupId) return;
    setLoading(true);
    setError("");

    Promise.all([
      apiClient.get(`/groups/${groupId}`),
      apiClient.get("/groups/members"),
    ])
      .then(([groupRes, membersRes]) => {
        setGroup(groupRes.data);
        setMembers(membersRes.data || []);
      })
      .catch((err) => {
        const msg = err.response?.data?.detail || "加载课题组信息失败";
        setError(msg);
        // 如果是 403 权限错误，可能用户刚加入但 token 未刷新
        if (err.response?.status === 403 && retryCount < 2) {
          setRetryCount((c) => c + 1);
          // 刷新用户信息后重试
          refreshUser().then(() => {
            setTimeout(() => fetchGroupData(), 500);
          });
        }
      })
      .finally(() => setLoading(false));
  }, [groupId, retryCount, refreshUser]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleLeave = async () => {
    if (!confirm("确定要退出课题组吗？退出后需要重新通过邀请码加入。")) return;
    setActionLoading("leave");
    try {
      await apiClient.delete("/groups/leave");
      await refreshUser();
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.detail || "退出失败";
      alert(msg);
    } finally {
      setActionLoading("");
    }
  };

  const handleDissolve = async () => {
    setActionLoading("dissolve");
    try {
      await apiClient.delete(`/groups/${groupId}`);
      await refreshUser();
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.detail || "解散失败";
      alert(msg);
    } finally {
      setActionLoading("");
      setShowDissolveConfirm(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferTargetId) return;
    setActionLoading("transfer");
    try {
      const res = await apiClient.post(`/groups/${groupId}/transfer`, {
        new_owner_id: transferTargetId,
      });
      setGroup(res.data);
      await refreshUser();
      setShowTransferModal(false);
      setTransferTargetId("");
      // 刷新数据
      fetchGroupData();
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.detail || "转让失败";
      alert(msg);
    } finally {
      setActionLoading("");
    }
  };

  const handleCopyCode = async () => {
    if (!group?.invite_code) return;
    try {
      await navigator.clipboard.writeText(group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const roleLabel = (role: string, isCreator: boolean) => {
    if (isCreator) return "创建者";
    if (role === "admin") return "管理员";
    return "成员";
  };

  // ==================== 加载中 ====================
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-white/20 border-t-[#c9a86a] rounded-full mx-auto mb-4" />
        <p className="text-[#f5f2ea]/55">加载课题组信息...</p>
      </div>
    );
  }

  // ==================== 错误 ====================
  if (error || !group) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#f5f2ea] mb-2">无法加载</h2>
          <p className="text-[#f5f2ea]/55 mb-4">{error || "课题组不存在"}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setRetryCount(0);
                fetchGroupData();
              }}
              className="block w-full py-2 px-6 bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] rounded-lg font-medium shadow-lg shadow-[#c9a86a]/20 hover:brightness-110 transition-colors"
            >
              重试
            </button>
            <Link
              to="/"
              className="block w-full py-2 px-6 border border-white/20 text-[#f5f2ea]/80 rounded-lg font-medium hover:border-white/40 hover:text-[#f5f2ea] transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === group.created_by;
  const isAdmin = isCreator || user?.role === "admin";
  const otherMembers = members.filter((m) => m.id !== user?.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* 顶部标题栏 */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 mb-8 backdrop-blur-md">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_15%_0%,rgba(201,168,106,0.14),transparent)]" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f5f2ea]">{group.name}</h1>
            <p className="mt-2 text-[#f5f2ea]/55">
              创建者：{group.creator_name}
            </p>
          </div>
          {isCreator && (
            <span className="px-3 py-1 bg-[#c9a86a]/20 text-[#e6cd96] text-xs rounded-full font-medium border border-[#c9a86a]/30">
              创建者
            </span>
          )}
        </div>
      </div>

      {/* 信息卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
        <div className={`${cardCls} p-5`}>
          <p className="text-xs text-[#f5f2ea]/55 mb-1">课题组 ID</p>
          <p className="text-sm font-mono text-[#f5f2ea] break-all">
            {group.id}
          </p>
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="text-xs text-[#f5f2ea]/55 mb-1">创立时间</p>
          <p className="text-sm font-medium text-[#f5f2ea]">
            {formatDate(group.created_at)}
          </p>
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="text-xs text-[#f5f2ea]/55 mb-1">成员数量</p>
          <p className="text-sm font-medium text-[#f5f2ea]">
            {group.member_count} 人
          </p>
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="text-xs text-[#f5f2ea]/55 mb-1">创建者</p>
          <p className="text-sm font-medium text-[#f5f2ea]">
            {group.creator_name}
          </p>
        </div>
      </div>

      {/* 邀请码区域 */}
      <div className={`${cardCls} p-6 mb-8`}>
        <p className="text-sm font-medium text-[#f5f2ea]/70 mb-3">邀请码</p>
        {isAdmin && group.invite_code ? (
          <div className="flex items-center space-x-3">
            <input
              id="invite-code-display"
              type="text"
              readOnly
              value={group.invite_code}
              className="text-xl font-mono font-bold text-[#e6cd96] bg-white/5 border border-white/15 rounded-lg px-4 py-2 text-center w-56 focus:outline-none"
            />
            <button
              onClick={handleCopyCode}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? "bg-[#7fc3b8]/15 text-[#9fd8cf]"
                  : "bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] hover:brightness-110"
              }`}
            >
              {copied ? "已复制" : "复制"}
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-[#f5f2ea]/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
            <span className="text-sm text-[#f5f2ea]/40">
              仅创建者和管理员可见
            </span>
          </div>
        )}
        {isAdmin && (
          <p className="mt-2 text-xs text-[#f5f2ea]/40">
            将此邀请码分享给新成员，他们即可加入课题组
          </p>
        )}
      </div>

      {/* 成员列表 */}
      <div className={`${cardCls} p-6 mb-8`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#f5f2ea]">
            课题组成员
          </h3>
          <span className="text-xs text-[#f5f2ea]/55">
            共 {members.length} 人
          </span>
        </div>
        <div className="space-y-1">
          {members.map((member) => {
            const isMemberCreator = member.id === group.created_by;
            const isSelf = member.id === user?.id;
            return (
              <div
                key={member.id}
                className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* 头像 */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      isMemberCreator
                        ? "bg-[#c9a86a]/15 text-[#e6cd96]"
                        : "bg-white/10 text-[#f5f2ea]/70"
                    }`}
                  >
                    {member.full_name?.charAt(0) || "?"}
                  </div>
                  {/* 成员信息 */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-[#f5f2ea]">
                        {member.full_name}
                      </p>
                      {isMemberCreator && (
                        <span className="px-1.5 py-0.5 bg-[#c9a86a]/15 text-[#e6cd96] text-xs rounded font-medium">
                          创建者
                        </span>
                      )}
                      {isSelf && (
                        <span className="px-1.5 py-0.5 bg-[#7fc3b8]/15 text-[#9fd8cf] text-xs rounded font-medium">
                          我
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#f5f2ea]/55">{member.email}</p>
                  </div>
                </div>
                <span className="text-xs text-[#f5f2ea]/40">
                  {roleLabel(member.role, isMemberCreator)}
                </span>
              </div>
            );
          })}
          {members.length === 0 && (
            <p className="text-center text-sm text-[#f5f2ea]/40 py-6">
              暂无成员数据
            </p>
          )}
        </div>
      </div>

      {/* 管理操作 */}
      <div className="space-y-4 mb-8">
        {isCreator && (
          <div className={`${cardCls} p-5`}>
            <h3 className="text-sm font-semibold text-[#f5f2ea] mb-4">
              管理操作
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* 转让按钮 */}
              <button
                onClick={() => setShowTransferModal(true)}
                disabled={otherMembers.length === 0}
                className="px-4 py-2 border border-[#c9a86a]/40 text-[#e6cd96] rounded-lg text-sm font-medium hover:bg-[#c9a86a]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                转让课题组
              </button>

              {/* 解散按钮 */}
              <button
                onClick={() => setShowDissolveConfirm(true)}
                className="px-4 py-2 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors"
              >
                解散课题组
              </button>
            </div>
          </div>
        )}

        {/* 非创建者 - 退出 */}
        {!isCreator && (
          <div className={`${cardCls} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#f5f2ea]">
                  退出课题组
                </h3>
                <p className="text-xs text-[#f5f2ea]/55 mt-1">
                  退出后需要重新通过邀请码加入
                </p>
              </div>
              <button
                onClick={handleLeave}
                disabled={actionLoading === "leave"}
                className="px-4 py-2 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {actionLoading === "leave" ? "退出中..." : "退出课题组"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 导航 */}
      <div className="flex space-x-3">
        <Link
          to="/"
          className="flex-1 py-2.5 text-center border border-white/20 text-[#f5f2ea]/80 rounded-lg font-medium hover:border-white/40 hover:text-[#f5f2ea] transition-colors"
        >
          返回首页
        </Link>
        <Link
          to="/upload"
          className="flex-1 py-2.5 text-center bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] rounded-lg font-medium shadow-lg shadow-[#c9a86a]/20 hover:brightness-110 transition-colors"
        >
          上传 PPT
        </Link>
      </div>

      {/* ==================== 转让弹窗 ==================== */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#131a26] border border-white/10 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[#f5f2ea] mb-2">
              转让课题组
            </h3>
            <p className="text-sm text-[#f5f2ea]/55 mb-4">
              选择一位成员作为新的创建者。转让后你将变为普通成员。
            </p>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {otherMembers.map((member) => (
                <label
                  key={member.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    transferTargetId === member.id
                      ? "border-[#c9a86a]/60 bg-[#c9a86a]/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="transferTarget"
                    value={member.id}
                    checked={transferTargetId === member.id}
                    onChange={(e) => setTransferTargetId(e.target.value)}
                    className="text-[#c9a86a] focus:ring-[#c9a86a]/40"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#f5f2ea]">
                      {member.full_name}
                    </p>
                    <p className="text-xs text-[#f5f2ea]/55">{member.email}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferTargetId("");
                }}
                className="flex-1 py-2 border border-white/20 rounded-lg text-sm font-medium text-[#f5f2ea]/80 hover:border-white/40 hover:text-[#f5f2ea]"
              >
                取消
              </button>
              <button
                onClick={handleTransfer}
                disabled={!transferTargetId || actionLoading === "transfer"}
                className="flex-1 py-2 bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50"
              >
                {actionLoading === "transfer" ? "转让中..." : "确认转让"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 解散确认弹窗 ==================== */}
      {showDissolveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#131a26] border border-white/10 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="w-12 h-12 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#f5f2ea] text-center mb-2">
              解散课题组
            </h3>
            <p className="text-sm text-[#f5f2ea]/55 text-center mb-2">
              此操作不可撤销。所有成员将被移出课题组。
            </p>
            <p className="text-sm font-medium text-red-300 text-center mb-6">
              请输入课题组名称确认：{group.name}
            </p>
            <input
              type="text"
              placeholder="输入课题组名称"
              className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-center text-[#f5f2ea] placeholder-white/30 mb-4 focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 outline-none"
              onChange={(e) => {
                const btn = document.getElementById(
                  "dissolve-confirm-btn"
                ) as HTMLButtonElement;
                if (btn) {
                  btn.disabled = e.target.value !== group.name;
                }
              }}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDissolveConfirm(false)}
                className="flex-1 py-2 border border-white/20 rounded-lg text-sm font-medium text-[#f5f2ea]/80 hover:border-white/40 hover:text-[#f5f2ea]"
              >
                取消
              </button>
              <button
                id="dissolve-confirm-btn"
                onClick={handleDissolve}
                disabled={true}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 disabled:opacity-50"
              >
                {actionLoading === "dissolve" ? "解散中..." : "确认解散"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetailPage;