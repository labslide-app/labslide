import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";

interface Meeting {
  id: string;
  group_id: string;
  title: string;
  meeting_date: string;
  created_by: string;
  creator_name: string;
  created_at: string;
  presentation_count: number;
}

function MeetingList() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 创建表单
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [creating, setCreating] = useState(false);

  const fetchMeetings = () => {
    setLoading(true);
    setError("");
    apiClient
      .get("/meetings")
      .then((res) => setMeetings(res.data || []))
      .catch((err) => {
        const msg = err.response?.data?.detail || "加载组会列表失败";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await apiClient.post("/meetings", {
        title: title.trim(),
        meeting_date: meetingDate,
      });
      setTitle("");
      setShowCreate(false);
      fetchMeetings();
    } catch (err: any) {
      alert(err.response?.data?.detail || "创建组会失败");
    } finally {
      setCreating(false);
    }
  };

  // 未加入课题组
  if (user && !user.group_id) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">尚未加入课题组</h2>
          <p className="text-gray-500 mb-6">加入课题组后才能创建和管理组会。</p>
          <div className="space-y-3">
            <Link
              to="/groups/join"
              className="block w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              加入课题组
            </Link>
            <Link
              to="/groups/create"
              className="block w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              创建课题组
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">组会</h1>
          <p className="mt-1 text-sm text-gray-500">管理课题组的组会，上传并查看 PPT</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          {showCreate ? "取消" : "创建组会"}
        </button>
      </div>

      {/* 创建表单 */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900">创建组会</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">组会标题</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：第 3 周组会"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              type="date"
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {creating ? "创建中..." : "创建"}
          </button>
        </form>
      )}

      {/* 错误 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500">加载组会...</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400">还没有组会，点击右上角「创建组会」开始</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <Link
              key={m.id}
              to={`/meetings/${m.id}`}
              className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div>
                <h3 className="font-medium text-gray-900">{m.title}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {m.meeting_date} · 创建者 {m.creator_name}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium">
                  {m.presentation_count} 个 PPT
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MeetingList;
