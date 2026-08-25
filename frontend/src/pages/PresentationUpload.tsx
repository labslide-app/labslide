import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import apiClient from "../api/client";

interface UploadState {
  phase: "idle" | "uploading" | "done" | "error";
  message: string;
  presentationId?: string;
}

interface MeetingOption {
  id: string;
  title: string;
  meeting_date: string;
}

const MAX_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_EXT = [".pptx", ".ppt"];

const PresentationUpload = () => {
  const [searchParams] = useSearchParams();
  const prefilledMeetingId = searchParams.get("meeting_id") || "";
  const [meetingId, setMeetingId] = useState(prefilledMeetingId);
  const [meetings, setMeetings] = useState<MeetingOption[]>([]);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<UploadState>({ phase: "idle", message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // 加载当前用户的组会列表，用于未预填会议时下拉选择
  useEffect(() => {
    let mounted = true;
    apiClient
      .get("/meetings")
      .then((res) => {
        if (!mounted) return;
        const list = (res.data || []) as MeetingOption[];
        setMeetings(list);
        if (prefilledMeetingId) {
          const found = list.find((m) => m.id === prefilledMeetingId);
          if (found) setMeetingTitle(found.title);
        }
      })
      .catch(() => {
        // 未加入课题组或加载失败时，保持列表为空
      });
    return () => {
      mounted = false;
    };
  }, [prefilledMeetingId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const ext = "." + selected.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      setStatus({ phase: "error", message: "仅支持 .pptx 和 .ppt 文件" });
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE) {
      setStatus({ phase: "error", message: "文件大小不能超过 100MB" });
      setFile(null);
      return;
    }
    setFile(selected);
    setStatus({ phase: "idle", message: `已选择：${selected.name}` });
  };

  const handleUpload = async () => {
    if (!file || !meetingId.trim()) {
      setStatus({ phase: "error", message: "请选择文件和组会" });
      return;
    }

    setStatus({ phase: "uploading", message: "正在上传..." });
    setUploadProgress(0);
    abortRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        `/meetings/${meetingId.trim()}/presentations`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          signal: abortRef.current.signal,
          onUploadProgress: (e) => {
            if (e.total) {
              setUploadProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        }
      );

      setUploadProgress(100);
      setStatus({
        phase: "done",
        message: "上传成功，可在线查看",
        presentationId: response.data.id,
      });
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
        setStatus({ phase: "idle", message: "已取消上传" });
        setUploadProgress(0);
        return;
      }
      const msg = err.response?.data?.detail || err.message || "上传失败，请重试";
      setStatus({ phase: "error", message: msg });
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setStatus({ phase: "idle", message: "已取消" });
    setUploadProgress(0);
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setFile(null);
    setMeetingId(prefilledMeetingId);
    setMeetingTitle("");
    setUploadProgress(0);
    setStatus({ phase: "idle", message: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isUploading = status.phase === "uploading";

  return (
    <div className="max-w-xl mx-auto mt-12 px-4">
      <h1 className="text-2xl font-bold text-[#f5f2ea] mb-8">上传 PPT</h1>

      <div className="space-y-6">
        {/* 组会选择 */}
        <div>
          <label className="block text-sm font-medium text-[#f5f2ea]/70 mb-1">组会</label>
          {prefilledMeetingId ? (
            <div className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#f5f2ea] truncate">
                    {meetingTitle || "已选择组会"}
                  </p>
                  <p className="text-xs text-[#f5f2ea]/55 font-mono break-all mt-0.5">{meetingId}</p>
                </div>
                <Link
                  to={`/meetings/${meetingId}`}
                  className="shrink-0 text-xs text-[#c9a86a] hover:text-[#e6cd96] font-medium"
                >
                  查看组会
                </Link>
              </div>
            </div>
          ) : (
            <>
              <select
                value={meetingId}
                onChange={(e) => {
                  setMeetingId(e.target.value);
                  const m = meetings.find((x) => x.id === e.target.value);
                  setMeetingTitle(m?.title || "");
                }}
                disabled={isUploading}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-sm text-[#f5f2ea] focus:ring-2 focus:ring-[#c9a86a]/25 focus:border-[#c9a86a]/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-[#131a26]">请选择组会</option>
                {meetings.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#131a26]">
                    {m.title}（{m.meeting_date}）
                  </option>
                ))}
              </select>
              {meetings.length === 0 && (
                <p className="mt-1 text-xs text-[#f5f2ea]/55">
                  暂无组会，请先在组会页面创建。
                  <Link to="/meetings" className="ml-1 text-[#c9a86a] font-medium">
                    前往创建
                  </Link>
                </p>
              )}
            </>
          )}
        </div>

        {/* 文件选择 */}
        <div>
          <label className="block text-sm font-medium text-[#f5f2ea]/70 mb-1">PPT 文件</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-white/15 rounded-lg bg-white/[0.02] hover:border-[#c9a86a]/50 transition-colors">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-[#f5f2ea]/40" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-[#f5f2ea]/70 justify-center">
                <label className="relative cursor-pointer rounded-md font-medium text-[#c9a86a] hover:text-[#e6cd96]">
                  <span>选择文件</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pptx,.ppt"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">或拖拽到此处</p>
              </div>
              <p className="text-xs text-[#f5f2ea]/55">支持 .pptx 和 .ppt，最大 100MB</p>
            </div>
          </div>
          {file && (
            <p className="mt-2 text-sm text-[#f5f2ea]/70">
              已选择：<span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          )}
        </div>

        {/* 进度条 */}
        {(isUploading || status.phase === "done") && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-[#f5f2ea]/70">
                {isUploading ? "上传进度" : "完成"}
              </span>
              <span className="text-sm font-medium text-[#f5f2ea]/70">
                {isUploading ? `${uploadProgress}%` : "100%"}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  status.phase === "done"
                    ? "bg-[#7fc3b8]"
                    : "bg-gradient-to-r from-[#d8b97e] to-[#b8935a]"
                }`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 状态消息 */}
        {status.message && (
          <div
            className={`p-4 rounded-lg text-sm ${
              status.phase === "error"
                ? "bg-red-500/10 text-red-300 border border-red-500/30"
                : status.phase === "done"
                ? "bg-[#7fc3b8]/10 text-[#9fd8cf] border border-[#7fc3b8]/30"
                : "bg-white/5 text-[#f5f2ea]/70 border border-white/10"
            }`}
          >
            <span>{status.message}</span>
            {status.presentationId && status.phase === "done" && (
              <div className="mt-2">
                <Link
                  to={`/presentations/${status.presentationId}`}
                  className="inline-block px-3 py-1.5 bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] rounded-md text-xs font-medium hover:brightness-110"
                >
                  立即查看 PPT
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 按钮 */}
        <div className="flex space-x-3">
          {!isUploading ? (
            <button
              onClick={handleUpload}
              disabled={!file || !meetingId.trim()}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#d8b97e] to-[#b8935a] text-[#1a2332] text-sm font-medium rounded-lg shadow-lg shadow-[#c9a86a]/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上传
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 px-4 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500 transition-colors"
            >
              取消
            </button>
          )}
          <button
            onClick={handleReset}
            disabled={isUploading}
            className="px-4 py-2.5 border border-white/20 text-sm font-medium rounded-lg text-[#f5f2ea]/80 hover:border-white/40 hover:text-[#f5f2ea] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentationUpload;