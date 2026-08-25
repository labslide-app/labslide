import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";

interface PresentationItem {
  id: string;
  owner_id: string;
  owner_name: string;
  title: string;
  status: string;
  error_message?: string;
  created_at: string;
}

interface MeetingDetail {
  id: string;
  group_id: string;
  title: string;
  meeting_date: string;
  created_by: string;
  creator_name: string;
  created_at: string;
  presentation_count: number;
  presentations: PresentationItem[];
}

function statusLabel(s: string) {
  switch (s) {
    case "processing":
      return { text: "转换中", cls: "bg-sky-400/15 text-sky-300" };
    case "ready":
      return { text: "可查看", cls: "bg-[#7fc3b8]/15 text-[#9fd8cf]" };
    case "partial":
      return { text: "部分完成", cls: "bg-amber-500/15 text-amber-300" };
    case "failed":
      return { text: "转换失败", cls: "bg-red-500/15 text-red-300" };
    default:
      return { text: s, cls: "bg-white/10 text-[#f5f2ea]/70" };
  }
}

function MeetingDetailPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchMeeting = useCallback(() => {
    if (!meetingId) return;
    setLoading(true);
    setError("");
    apiClient
      .get(`/meetings/${meetingId}`)
      .then((res) => setMeeting(res.data))
      .catch((err) => setError(err.response?.data?.detail || "加载组会失败"))
      .finally(() => setLoading(false));
  }, [meetingId]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  const copyMeetingId = async () => {
    if (!meeting) return;
    try {
      await navigator.clipboard.writeText(meeting.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时的降级处理
      window.prompt("请手动复制会议 ID：", meeting.id);
    }
  };

  const handleDelete = async () => {
    if (!meeting || !confirm(`确定删除组会「${meeting.title}」吗？该组会下的 PPT 也会被删除。`)) return;
    try {
      await apiClient.delete(`/meetings/${meeting.id}`);
      navigate("/meetings", { replace: true });
    } catch (err: any) {
      alert(err.response?.data?.detail || "删除失败");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-white/20 border-t-[#c9a86a] rounded-full mx-auto mb-4" />
        <p className="text-[#f5f2ea]/55">加载组会...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-[#f5f2ea] mb-2">无法加载</h2>
          <p className="text-[#f5f2ea]/55 mb-6">{error || "组会不存在"}</p>
          <Link
            to="/meetings"
            className="inline-block px-6 py-2 bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] rounded-lg font-medium shadow-lg shadow-[#c9a86a]/20 hover:brightness-110"
          >
            返回组会列表
          </Link>
        </div>
      </div>
    );
  }

  const canDelete = user?.id === meeting.created_by || user?.role === "admin";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 标题栏 */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-8 mb-8 backdrop-blur-md">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_15%_0%,rgba(201,168,106,0.14),transparent)]" />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f5f2ea]">{meeting.title}</h1>
            <p className="mt-2 text-[#f5f2ea]/55 text-sm">
              {meeting.meeting_date} · 创建者 {meeting.creator_name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to="/meetings"
              className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs font-medium hover:bg-white/20"
            >
              返回列表
            </Link>
          </div>
        </div>
      </div>

      {/* Meeting ID */}
      <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="min-w-0">
          <p className="text-xs text-[#f5f2ea]/55 mb-1">会议 ID（上传 PPT 时选择该组会）</p>
          <p className="text-sm font-mono text-[#f5f2ea]/80 break-all">{meeting.id}</p>
        </div>
        <button
          onClick={copyMeetingId}
          className="shrink-0 px-4 py-2 border border-white/20 text-[#f5f2ea]/80 rounded-lg text-sm font-medium hover:border-white/40 hover:text-[#f5f2ea]"
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>

      {/* 上传 + 删除 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to={`/upload?meeting_id=${meeting.id}`}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] rounded-lg text-sm font-medium shadow-lg shadow-[#c9a86a]/20 hover:brightness-110"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>上传 PPT</span>
        </Link>
        {canDelete && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/10"
          >
            删除组会
          </button>
        )}
      </div>

      {/* PPT 列表 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#f5f2ea]">PPT 列表</h2>
        <span className="text-sm text-[#f5f2ea]/55">共 {meeting.presentations.length} 个</span>
      </div>

      {meeting.presentations.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-white/10 bg-white/[0.04]">
          <p className="text-[#f5f2ea]/40">还没有上传 PPT，点击「上传 PPT」开始</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {meeting.presentations.map((p) => {
            const s = statusLabel(p.status);
            return (
              <Link
                key={p.id}
                to={`/presentations/${p.id}`}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-5 hover:border-[#c9a86a]/40 hover:bg-white/[0.07] transition-all backdrop-blur-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-[#f5f2ea] truncate flex-1">{p.title}</h3>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${s.cls}`}>
                    {s.text}
                  </span>
                </div>
                <p className="text-xs text-[#f5f2ea]/55">
                  上传者：{p.owner_name}
                </p>
                <p className="text-xs text-[#f5f2ea]/40 mt-1">
                  {new Date(p.created_at).toLocaleString("zh-CN")}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MeetingDetailPage;