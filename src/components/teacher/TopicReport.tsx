import { useMemo, useState } from 'react';
import { QuizAttempt } from '../../types';
import { topicReport } from '../../utils/learning';

export default function TopicReport({ attempts }: { attempts: QuizAttempt[] }) {
  const [className, setClassName] = useState('');
  const [mode, setMode] = useState('all');
  const classes = [...new Set(attempts.map(a => a.className || 'Chưa xác định'))].sort();
  const selected = useMemo(() => attempts.filter(a => (!className || (a.className || 'Chưa xác định') === className) &&
    (mode === 'all' || (mode === 'exam' ? a.mode === 'exam' : a.mode !== 'exam'))), [attempts, className, mode]);
  const report = useMemo(() => topicReport(selected), [selected]);
  return <section className="bg-white text-slate-800 rounded-3xl border border-slate-200 p-5">
    <h3 className="text-lg font-bold">Mức độ nắm vững theo chủ đề</h3>
    <p className="text-sm text-slate-600 mt-1">Ưu tiên chủ đề có tỷ lệ đúng thấp. Mỗi lần trả lời được tính một lượt; câu đúng/sai cần đúng tất cả mệnh đề.</p>
    <div className="flex flex-wrap gap-3 my-4">
      <label className="text-sm font-semibold">Lớp<select aria-label="Lớp" className="block border border-slate-300 rounded-lg p-2 mt-1 bg-white text-slate-800" value={className} onChange={e => setClassName(e.target.value)}>
        <option value="">Tất cả lớp</option>{classes.map(c => <option key={c}>{c}</option>)}
      </select></label>
      <label className="text-sm font-semibold">Loại bài<select aria-label="Loại bài" className="block border border-slate-300 rounded-lg p-2 mt-1 bg-white text-slate-800" value={mode} onChange={e => setMode(e.target.value)}>
        <option value="all">Tất cả</option><option value="exam">Bài thi</option><option value="practice">Tự luyện</option>
      </select></label>
    </div>
    <p className="text-sm text-slate-600 mb-3">Có dữ liệu chủ đề ở {report.coveredAttempts}/{selected.length} bài làm. Bài cũ thiếu dữ liệu được bỏ qua.</p>
    {!report.rows.length ? <p className="py-6 text-slate-600">Chưa có dữ liệu phù hợp để phân tích chủ đề.</p> : <div className="overflow-x-auto">
      <table className="w-full text-sm text-left"><caption className="sr-only">Tỷ lệ trả lời đúng theo chủ đề</caption>
        <thead className="bg-slate-100"><tr>{['Chủ đề', 'Học sinh', 'Đúng / lượt trả lời', 'Tỷ lệ đúng'].map(h => <th key={h} scope="col" className="p-3 whitespace-nowrap">{h}</th>)}</tr></thead>
        <tbody>{report.rows.map(r => <tr key={r.topic} className="border-b border-slate-200">
          <th scope="row" className="p-3 font-medium min-w-44">{r.topic}</th><td className="p-3">{r.students}</td><td className="p-3">{r.correct} / {r.total}</td>
          <td className="p-3"><span className={`font-bold ${r.percentage < 50 ? 'text-rose-700' : r.percentage < 70 ? 'text-amber-800' : 'text-emerald-700'}`}>{r.percentage}%</span></td>
        </tr>)}</tbody>
      </table>
    </div>}
  </section>;
}
