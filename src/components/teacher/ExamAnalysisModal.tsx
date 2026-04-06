import React from 'react';
import { motion } from 'motion/react';
import { X, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Exam, Question } from '../../types';

interface ExamAnalysisModalProps {
  exam: Exam;
  onClose: () => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ExamAnalysisModal({ exam, onClose }: ExamAnalysisModalProps) {
  const questions = exam.questions ?? [];

  // Type distribution
  const typeCounts = {
    'Trắc nghiệm': questions.filter(q => q.type === 'multiple_choice').length,
    'Đúng/Sai': questions.filter(q => q.type === 'true_false').length,
    'Trả lời ngắn': questions.filter(q => q.type === 'short_answer').length,
  };
  const typeData = Object.entries(typeCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Cognitive level distribution
  const levelCounts: Record<string, number> = {};
  questions.forEach(q => {
    const lv = (q as any).cognitiveLevel ?? 'Không xác định';
    levelCounts[lv] = (levelCounts[lv] ?? 0) + 1;
  });
  const levelData = Object.entries(levelCounts).map(([name, value]) => ({ name, value }));

  // Topic distribution
  const topicCounts: Record<string, number> = {};
  questions.forEach(q => {
    const t = q.topic ?? 'Khác';
    topicCounts[t] = (topicCounts[t] ?? 0) + 1;
  });
  const topicData = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, value }));

  const stats = [
    { label: 'Tổng câu hỏi', value: questions.length, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Trắc nghiệm', value: typeCounts['Trắc nghiệm'], color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Đúng/Sai', value: typeCounts['Đúng/Sai'], color: 'bg-amber-50 text-amber-700' },
    { label: 'Trả lời ngắn', value: typeCounts['Trả lời ngắn'], color: 'bg-purple-50 text-purple-700' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 shadow-lg text-sm">
          <p className="font-bold text-slate-700">{label ?? payload[0]?.name}</p>
          <p className="font-black text-indigo-600">{payload[0]?.value} câu</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[90] p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">PHÂN TÍCH ĐỀ THI</h3>
              <p className="text-xs text-slate-400 font-medium">{exam.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className={`p-4 rounded-2xl ${s.color} text-center`}>
                <div className="text-3xl font-black">{s.value}</div>
                <div className="text-xs font-bold mt-1 opacity-70">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type Pie */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Phân loại câu hỏi</h4>
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {typeData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">Không có dữ liệu</div>
              )}
            </div>

            {/* Cognitive Level Bar */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Cấp độ nhận thức</h4>
              {levelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={levelData} barCategoryGap="30%">
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {levelData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">Không có dữ liệu</div>
              )}
            </div>
          </div>

          {/* Topic Distribution */}
          {topicData.length > 0 && (
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Phân bố chủ đề ({topicData.length} chủ đề)</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topicData} layout="vertical" barCategoryGap="20%">
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Questions list summary */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Danh sách câu hỏi</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-slate-100">
                  <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{q.text}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {q.type === 'multiple_choice' ? 'TN' : q.type === 'true_false' ? 'Đ/S' : 'TLN'}
                      </span>
                      {(q as any).cognitiveLevel && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          {(q as any).cognitiveLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
