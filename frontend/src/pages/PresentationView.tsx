import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import { parsePptx, type SlideContent } from "../utils/pptx";

interface AnnotationItem {
  id: string;
  presentation_id: string;
  page_number: number;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface PresentationDetail {
  id: string;
  meeting_id: string;
  owner_id: string;
  owner_name: string;
  title: string;
  status: string;
  created_at: string;
  annotations: AnnotationItem[];
}

function PresentationView() {
  const { presentationId } = useParams<{ presentationId: string }>();
  const { user } = useAuth();
  const [presentation, setPresentation] = useState<PresentationDetail | null>(null);
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parseError, setParseError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newAnnotation, setNewAnnotation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAnnotations = useCallback(async () => {
    if (!presentationId) return;
    try {
      const res = await apiClient.get(`/presentations/${presentationId}/annotations`);
      setAnnotations(res.data || []);
    } catch {
      // 忽略批注加载失败
    }
  }, [presentationId]);

  const fetchPresentation = useCallback(async () => {
    if (!presentationId) return;
    setLoading(true);
    setError("");
    setParseError("");
    try {
      const [detailRes, fileRes] = await Promise.all([
        apiClient.get(`/presentations/${presentationId}`),
        apiClient.get(`/presentations/${presentationId}/file`, {
          responseType: "arraybuffer",
        }),
      ]);
      setPresentation(detailRes.data);
      setAnnotations(detailRes.data.annotations || []);
      try {
        const parsed = await parsePptx(fileRes.data as ArrayBuffer);
        setSlides(parsed);
        if (parsed.length === 0) {
          setParseError("未能解析出幻灯片内容（可能不是有效的 .pptx 文件）");
        }
      } catch {
        setParseError("无法在线预览：旧版 .ppt 或损坏的文件，请另存为 .pptx 后重新上传");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "加载 PPT 失败");
    } finally {
      setLoading(false);
    }
  }, [presentationId]);

  useEffect(() => {
    fetchPresentation();
  }, [fetchPresentation]);

  const submitAnnotation = async () => {
    const content = newAnnotation.trim();
    if (!content || !presentationId) return;
    const page = slides.length > 0 ? slides[currentSlide].pageNumber : null;
    if (!page) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/presentations/${presentationId}/annotations`, {
        page_number: page,
        content,
      });
      setNewAnnotation("");
      await loadAnnotations();
    } catch (err: any) {
      alert(err.response?.data?.detail || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAnnotation = async (annId: string) => {
    if (!window.confirm("删除这条批注？")) return;
    try {
      await apiClient.delete(`/annotations/${annId}`);
      await loadAnnotations();
    } catch (err: any) {
      alert(err.response?.data?.detail || "删除失败");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4" />
        <p className="text-gray-500">加载 PPT...</p>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">无法加载</h2>
          <p className="text-gray-500 mb-6">{error || "PPT 不存在"}</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={fetchPresentation}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              重试
            </button>
            <Link
              to="/"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPage = slides.length > 0 ? slides[currentSlide].pageNumber : null;
  const slideAnnotations = currentPage
    ? annotations.filter((a) => a.page_number === currentPage)
    : [];
  const canDelete = (ann: AnnotationItem) =>
    user?.id === ann.user_id || user?.role === "admin";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 标题栏 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{presentation.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            上传者：{presentation.owner_name} ·{" "}
            {new Date(presentation.created_at).toLocaleString("zh-CN")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            可查看
          </span>
          <Link
            to="/"
            className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
          >
            返回
          </Link>
        </div>
      </div>

      {/* 预览失败提示 */}
      {parseError && slides.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">{parseError}</p>
          <p className="text-xs text-yellow-600 mt-1">
            仍可在下方查看他人批注，但无法逐页预览该文件。
          </p>
        </div>
      )}

      {/* 幻灯片 */}
      {slides.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                第 {currentSlide + 1} / {slides.length} 页
              </span>
              <span className="text-xs text-gray-400">浏览器端预览</span>
            </div>
            <div className="p-6 space-y-4 min-h-[300px]">
              {slides[currentSlide].images.length > 0 && (
                <div className="space-y-3">
                  {slides[currentSlide].images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`第 ${slides[currentSlide].pageNumber} 页图片 ${i + 1}`}
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}
              {slides[currentSlide].texts.length > 0 && (
                <div className="space-y-2">
                  {slides[currentSlide].texts.map((t, i) => (
                    <p key={i} className="text-sm text-gray-800 whitespace-pre-wrap">
                      {t}
                    </p>
                  ))}
                </div>
              )}
              {slides[currentSlide].images.length === 0 &&
                slides[currentSlide].texts.length === 0 && (
                  <p className="text-gray-400 text-sm">（本页无可显示内容）</p>
                )}
            </div>
          </div>

          {/* 页码导航 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
              disabled={currentSlide === 0}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            <div className="flex flex-wrap gap-1 justify-center">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                    idx === currentSlide
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s.pageNumber}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide((s) => Math.min(slides.length - 1, s + 1))}
              disabled={currentSlide === slides.length - 1}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </>
      )}

      {/* 批注区 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            批注{currentPage ? `（第 ${currentPage} 页）` : ""}
          </h2>
          <span className="text-sm text-gray-500">{slideAnnotations.length} 条</span>
        </div>

        {/* 批注输入 */}
        <div className="mb-5">
          <textarea
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            placeholder={
              slides.length > 0 ? "对该页写批注..." : "写批注（不区分页码）..."
            }
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={submitAnnotation}
              disabled={submitting || !newAnnotation.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? "提交中..." : "添加批注"}
            </button>
          </div>
        </div>

        {/* 批注列表 */}
        {slideAnnotations.length === 0 ? (
          <p className="text-sm text-gray-400">暂无批注</p>
        ) : (
          <ul className="space-y-3">
            {slideAnnotations.map((ann) => (
              <li key={ann.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                      {ann.user_name.charAt(0)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{ann.user_name}</span>
                    {user?.id === ann.user_id && (
                      <span className="text-xs text-primary-600">（我）</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(ann.created_at).toLocaleString("zh-CN")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                {canDelete(ann) && (
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => deleteAnnotation(ann.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PresentationView;
