import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { learningOwner, readDraft } from '../services/learningStorage';

export default function LearningTools() {
  const { user } = useAuth();
  const owner = learningOwner(user?.uid);
  const drafts = (['quiz', 'exam'] as const).map(kind => readDraft(owner, kind)).filter(Boolean);
  return <section aria-label="Góc ôn tập" className="mb-5 rounded-2xl border border-sky-800 bg-slate-900 p-4 text-slate-100 space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-bold">Góc ôn tập của bạn</h2><p className="text-sm text-slate-300">Xem lại và luyện những câu chưa nắm vững.</p></div>
      <Link to="/mistakes" className="rounded-xl bg-sky-700 hover:bg-sky-600 px-4 py-2 font-bold text-white">Sổ câu sai</Link>
    </div>
    {drafts.map(d => d && <Link key={d.route} to={d.route} className="block border-t border-slate-700 pt-3 text-sky-200 underline underline-offset-4">
      Tiếp tục: {d.title} · Câu {d.state.currentIndex + 1}/{d.state.questions.length}
    </Link>)}
    {drafts.length > 0 && <p className="text-xs text-slate-300">Bản nháp lưu trên trình duyệt này. Đồng hồ vẫn chạy khi rời trang; bài hết giờ sẽ được kết thúc khi mở lại.</p>}
  </section>;
}

export function DraftStatus({ restored, error }: { restored: boolean; error: string }) {
  return <p role="status" className={`mb-4 rounded-xl p-3 text-sm ${error ? 'bg-amber-50 text-amber-900' : 'bg-slate-900 text-slate-200 border border-slate-700'}`}>
    {error || `${restored ? 'Đã khôi phục bài đang làm. ' : ''}Tự lưu trên trình duyệt này. Thời gian vẫn tiếp tục khi rời trang.`}
  </p>;
}
