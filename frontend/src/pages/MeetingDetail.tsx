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
      return { text: "转换中", cls: "bg-blue-100 text-blue-700" };
    case "ready":
      return { text: "可查看", cls: "bg-green-100 text-green-700" };
    case "partial":
      return { text: "部分完成", cls: "bg-yellow-100 text-yellow-700" };
    case "failed":
      return { text: "转换失败", cls: "bg-red-100 text-red-700" };
    default:
      return { text: s, cls: "bg-gray-100 text-gray-700" };
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
        <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4" />
        <p className="text-gray-500">加载组会...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">无法加载</h2>
          <p className="text-gray-500 mb-6">{error || "组会不存在"}</p>
          <Link
            to="/meetings"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
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
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            <p className="mt-2 text-primary-100 text-sm">
              {meeting.meeting_date} · 创建者 {meeting.creator_name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to="/meetings"
              className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-xs font-medium hover:bg-white/30"
            >
              返回列表
            </Link>
          </div>
        </div>
      </div>

      {/* Meeting ID */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 mb-1">会议 ID（上传 PPT 时选择该组会）</p>
          <p className="text-sm font-mono text-gray-800 break-all">{meeting.id}</p>
        </div>
        <button
          onClick={copyMeetingId}
          className="shrink-0 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>

      {/* 上传 + 删除 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to={`/upload?meeting_id=${meeting.id}`}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>上传 PPT</span>
        </Link>
        {canDelete && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
          >
            删除组会
          </button>
        )}
      </div>

      {/* PPT 列表 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">PPT 列表</h2>
        <span className="text-sm text-gray-500">共 {meeting.presentations.length} 个</span>
      </div>

      {meeting.presentations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400">还没有上传 PPT，点击「上传 PPT」开始</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {meeting.presentations.map((p) => {
            const s = statusLabel(p.status);
            return (
              <Link
                key={p.id}
                to={`/presentations/${p.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 truncate flex-1">{p.title}</h3>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${s.cls}`}>
                    {s.text}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  上传者：{p.owner_name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
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
