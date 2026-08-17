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
        <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4" />
        <p className="text-gray-500">加载课题组信息...</p>
      </div>
    );
  }

  // ==================== 错误 ====================
  if (error || !group) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">无法加载</h2>
          <p className="text-gray-500 mb-4">{error || "课题组不存在"}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setRetryCount(0);
                fetchGroupData();
              }}
              className="block w-full py-2 px-6 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              重试
            </button>
            <Link
              to="/"
              className="block w-full py-2 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="mt-2 text-primary-100">
              创建者：{group.creator_name}
            </p>
          </div>
          {isCreator && (
            <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full font-medium">
              创建者
            </span>
          )}
        </div>
      </div>

      {/* 信息卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">课题组 ID</p>
          <p className="text-sm font-mono text-gray-900 break-all">
            {group.id}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">创立时间</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(group.created_at)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">成员数量</p>
          <p className="text-sm font-medium text-gray-900">
            {group.member_count} 人
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">创建者</p>
          <p className="text-sm font-medium text-gray-900">
            {group.creator_name}
          </p>
        </div>
      </div>

      {/* 邀请码区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <p className="text-sm font-medium text-gray-700 mb-3">邀请码</p>
        {isAdmin && group.invite_code ? (
          <div className="flex items-center space-x-3">
            <input
              id="invite-code-display"
              type="text"
              readOnly
              value={group.invite_code}
              className="text-xl font-mono font-bold text-primary-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center w-56 focus:outline-none"
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
        ) : (
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-gray-400"
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
            <span className="text-sm text-gray-400">
              仅创建者和管理员可见
            </span>
          </div>
        )}
        {isAdmin && (
          <p className="mt-2 text-xs text-gray-400">
            将此邀请码分享给新成员，他们即可加入课题组
          </p>
        )}
      </div>

      {/* 成员列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            课题组成员
          </h3>
          <span className="text-xs text-gray-500">
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
                className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* 头像 */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      isMemberCreator
                        ? "bg-primary-100 text-primary-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {member.full_name?.charAt(0) || "?"}
                  </div>
                  {/* 成员信息 */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {member.full_name}
                      </p>
                      {isMemberCreator && (
                        <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded font-medium">
                          创建者
                        </span>
                      )}
                      {isSelf && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                          我
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {roleLabel(member.role, isMemberCreator)}
                </span>
              </div>
            );
          })}
          {members.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              暂无成员数据
            </p>
          )}
        </div>
      </div>

      {/* 管理操作 */}
      <div className="space-y-4 mb-8">
        {isCreator && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              管理操作
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* 转让按钮 */}
              <button
                onClick={() => setShowTransferModal(true)}
                disabled={otherMembers.length === 0}
                className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                转让课题组
              </button>

              {/* 解散按钮 */}
              <button
                onClick={() => setShowDissolveConfirm(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                解散课题组
              </button>
            </div>
          </div>
        )}

        {/* 非创建者 - 退出 */}
        {!isCreator && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  退出课题组
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  退出后需要重新通过邀请码加入
                </p>
              </div>
              <button
                onClick={handleLeave}
                disabled={actionLoading === "leave"}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
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
          className="flex-1 py-2.5 text-center border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          返回首页
        </Link>
        <Link
          to="/upload"
          className="flex-1 py-2.5 text-center bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          上传 PPT
        </Link>
      </div>

      {/* ==================== 转让弹窗 ==================== */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              转让课题组
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              选择一位成员作为新的创建者。转让后你将变为普通成员。
            </p>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {otherMembers.map((member) => (
                <label
                  key={member.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    transferTargetId === member.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="transferTarget"
                    value={member.id}
                    checked={transferTargetId === member.id}
                    onChange={(e) => setTransferTargetId(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.full_name}
                    </p>
                    <p className="text-xs text-gray-500">{member.email}</p>
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
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleTransfer}
                disabled={!transferTargetId || actionLoading === "transfer"}
                className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                {actionLoading === "transfer" ? "转让中..." : "确认转让"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 解散确认弹窗 ==================== */}
      {showDissolveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
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
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              解散课题组
            </h3>
            <p className="text-sm text-gray-500 text-center mb-2">
              此操作不可撤销。所有成员将被移出课题组。
            </p>
            <p className="text-sm font-medium text-red-600 text-center mb-6">
              请输入课题组名称确认：{group.name}
            </p>
            <input
              type="text"
              placeholder="输入课题组名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                id="dissolve-confirm-btn"
                onClick={handleDissolve}
                disabled={true}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
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