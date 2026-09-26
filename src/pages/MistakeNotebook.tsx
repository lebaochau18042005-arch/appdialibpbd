import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMistakes, learningOwner } from '../services/learningStorage';
import QuizActiveCard from '../components/exam/QuizActiveCard';

export default function MistakeNotebook() {
  const { user } = useAuth();
  const entries = getMistakes(learningOwner(user?.uid));
  const [topic, setTopic] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const topics = [...new Set(entries.map(m => m.question.topic || 'Chung'))].sort();
  const visible = entries.filter(m => (showResolved || !m.resolved) && (!topic || (m.question.topic || 'Chung') === topic));
  const pending = visible.filter(m => !m.resolved);
  const params = new URLSearchParams({ mode: 'topic', review: 'mistakes', count: 'all' });
  if (topic) params.set('filter', topic);
  return <div className="max-w-3xl mx-auto pb-24 space-y-5">
    <header><h1 className="text-3xl font-bold text-slate-100">Sổ câu sai</h1>
      <p className="mt-2 text-slate-300">Lưu tối đa 200 câu gần nhất trên trình duyệt này, riêng theo tài khoản hoặc hồ sơ. Bắt đầu ghi nhận từ các bài làm mới.</p>
      <p className="mt-2 text-sm text-slate-300">Câu đúng/sai được tính là đã ôn đúng khi đúng tất cả mệnh đề. Câu bỏ trống khi nộp bài cũng được lưu.</p>
    </header>
    <div className="flex flex-wrap gap-3 items-center bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
      <label className="text-slate-300 max-w-full text-xs font-bold uppercase tracking-wider">Chủ đề
        <select aria-label="Chủ đề" value={topic} onChange={e => setTopic(e.target.value)} className="block mt-1 max-w-full bg-slate-950 text-slate-200 rounded-xl p-2.5 border border-slate-700 outline-none focus:border-cyan-400 text-sm font-normal">
          <option value="">Tất cả chủ đề</option>{topics.map(t => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-2 text-slate-300 text-sm font-medium cursor-pointer mt-auto pb-2"><input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} className="w-4 h-4 rounded text-cyan-500" />Hiện câu đã ôn đúng</label>
      {pending.length > 0 && <Link className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-[0_0_15px_rgba(0,191,255,0.3)] hover:brightness-110 transition-all text-sm ml-auto" to={`/quiz?${params}`}>Luyện lại {pending.length} câu</Link>}
    </div>
    {!visible.length && <div className="bg-slate-900/80 border border-slate-800 text-slate-300 p-6 rounded-2xl text-center space-y-3">
      <p className="text-base">{entries.length ? 'Không có câu nào cần ôn trong bộ lọc này.' : 'Chưa có câu sai. Sau khi làm bài, những câu cần ôn sẽ xuất hiện ở đây.'}</p>
      <Link to="/practice" className="inline-block text-cyan-400 hover:text-cyan-300 underline font-bold">Đến phần Luyện tập</Link>
    </div>}
    {visible.map((m, i) => <section key={m.key} className="bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/30 rounded-2xl p-5 text-slate-200 shadow-xl transition-all">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400 font-semibold">{m.question.lesson || m.question.topic || 'Chung'} · Sai {m.wrongCount} lần</p>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${m.resolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
          {m.resolved ? '✓ Đã ôn đúng' : '⚠ Cần ôn lại'}
        </span>
      </div>
      <button onClick={() => setExpanded(expanded === m.key ? null : m.key)} aria-expanded={expanded === m.key} className="text-left w-full mt-3 font-bold text-white text-base break-words">
        {i + 1}. {m.question.text}<span className="block text-xs font-bold text-cyan-400 hover:text-cyan-300 mt-2">{expanded === m.key ? '▲ Thu gọn' : '▼ Xem câu hỏi và đáp án chi tiết'}</span>
      </button>
      {expanded === m.key && <div className="mt-4 pt-4 border-t border-slate-800"><QuizActiveCard currentQuestion={m.question} currentIndex={i} isSubmitted
        mcAnswer={m.question.type === 'multiple_choice' ? m.userAnswer : null}
        tfAnswer={m.question.type === 'true_false' ? m.userAnswer || {} : {}}
        saAnswer={m.question.type === 'short_answer' ? String(m.userAnswer ?? '') : ''}
        setMcAnswer={() => {}} setTfAnswer={() => {}} setSaAnswer={() => {}}
        aiExplanation={m.question.explanation || 'Chưa có giải thích kèm theo. Hãy đối chiếu đáp án hoặc hỏi giáo viên.'}
        isAiLoading={false} isAnswerCorrect={m.resolved} /></div>}
    </section>)}
  </div>;
}
