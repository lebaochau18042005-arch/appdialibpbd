import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Wifi, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { liveExamService, LiveStudentStatus } from '../../services/liveExamService';

const LABEL_COLORS: Record<string, string> = {
  correct: 'bg-emerald-500 text-white',
  wrong: 'bg-red-500 text-white',
  unanswered: 'bg-slate-100 text-slate-400',
};

function AnswerCell({ ans }: { ans?: { selectedLabel: string; isCorrect: boolean } }) {
  if (!ans) return (
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-300 font-bold mx-auto">
      —
    </div>
  );
  return (
    <div className={cn(
      'w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black mx-auto transition-all duration-300',
      ans.isCorrect ? LABEL_COLORS.correct : LABEL_COLORS.wrong
    )}>
      {ans.selectedLabel}
    </div>
  );
}

interface Props {
  examId: string;
  totalQuestions?: number;
}

export default function LiveExamMonitor({ examId, totalQuestions = 28 }: Props) {
  const [students, setStudents] = useState<LiveStudentStatus[]>([]);
  const [connected, setConnected] = useState(false);
  const qCount = Math.min(totalQuestions, 28);
  const qNums = Array.from({ length: qCount }, (_, i) => i);

  useEffect(() => {
    if (!examId) return;
    setConnected(true);
    const unsub = liveExamService.subscribeToLiveSessions(examId, setStudents);
    return () => { unsub(); setConnected(false); };
  }, [examId]);

  const onlineCount = students.filter(s => !s.isFinished).length;
  const finishedCount = students.filter(s => s.isFinished).length;

  if (!examId) return (
    <div className="p-8 text-center text-slate-400 text-sm">Chưa chọn đề để theo dõi</div>
  );

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Đang thi', value: onlineCount, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Đã nộp', value: finishedCount, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Tổng', value: students.length, color: 'text-slate-700 bg-slate-50' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-2xl p-3 text-center', s.color)}>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-emerald-500 inline-block"/>Đúng</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-500 inline-block"/>Sai</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-slate-100 inline-block"/>Chưa trả lời</span>
        {connected && <span className="ml-auto flex items-center gap-1 text-emerald-600"><Wifi size={11}/>LIVE</span>}
      </div>

      {students.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-10 text-center">
          <Users size={36} className="mx-auto text-slate-200 mb-2" />
          <p className="text-slate-400 text-sm">Chưa có học sinh nào vào thi</p>
          <p className="text-slate-300 text-xs mt-1">Khi học sinh mở đề, tên sẽ xuất hiện ở đây</p>
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-slate-100">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="sticky left-0 bg-slate-50 px-3 py-2 text-left font-black text-slate-600 min-w-[140px] border-r border-slate-100">
                  Học sinh
                </th>
                <th className="px-2 py-2 text-center font-black text-slate-500 min-w-[60px] border-r border-slate-100">
                  Điểm
                </th>
                {qNums.map(i => (
                  <th key={i} className="px-1 py-2 text-center font-black text-slate-400 w-9">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student, si) => (
                <motion.tr
                  key={student.sessionKey}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.03 }}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Student name + status */}
                  <td className="sticky left-0 bg-white hover:bg-slate-50/80 px-3 py-2 border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        student.isFinished ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'
                      )} />
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-[100px]">{student.name}</p>
                        <p className="text-[10px] text-slate-400">{student.className}</p>
                      </div>
                    </div>
                  </td>
                  {/* Score */}
                  <td className="px-2 py-2 text-center border-r border-slate-100">
                    <span className={cn(
                      'font-black text-sm',
                      student.score >= 8 ? 'text-emerald-600' : student.score >= 5 ? 'text-amber-600' : 'text-red-500'
                    )}>
                      {student.score.toFixed(1)}
                    </span>
                    <div className="text-[9px] text-slate-400">{student.progress}/{qCount}</div>
                  </td>
                  {/* Answer cells */}
                  {qNums.map(i => (
                    <td key={i} className="px-0.5 py-1.5">
                      <AnswerCell ans={student.answers[i]} />
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Clear button */}
      {students.length > 0 && (
        <button
          onClick={() => liveExamService.clearSession(examId)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} /> Xóa phiên thi này
        </button>
      )}
    </div>
  );
}
