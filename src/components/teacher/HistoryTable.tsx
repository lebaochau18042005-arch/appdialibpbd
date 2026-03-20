import React from 'react';
import { History, Search, RefreshCw, ShieldCheck, MessageSquare } from 'lucide-react';
import { QuizAttempt } from '../../types';
import { cn } from '../../utils/cn';

interface HistoryTableProps {
  attempts: QuizAttempt[];
  classes: string[];
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loading: boolean;
  loadData: () => void;
  setCommentingId: (id: string) => void;
  setComment: (comment: string) => void;
  setProgress: (progress: string) => void;
}

export default function HistoryTable({
  attempts,
  classes,
  selectedClass,
  setSelectedClass,
  searchTerm,
  setSearchTerm,
  loading,
  loadData,
  setCommentingId,
  setComment,
  setProgress
}: HistoryTableProps) {
  const filteredAttempts = attempts.filter(a => {
    const matchesSearch = a.userId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         a.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (a.userName && a.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = selectedClass === 'All' || a.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <History size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">LỊCH SỬ & TIẾN BỘ</h3>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold text-slate-600"
          >
            <option value="All">Tất cả lớp</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm học sinh, đề thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          <button 
            onClick={loadData} 
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            title="Làm mới"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-24 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-slate-500 font-medium">Đang đồng bộ dữ liệu từ hệ thống...</p>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="p-24 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-slate-200" />
          </div>
          <p className="text-slate-400 font-medium">Không tìm thấy dữ liệu phù hợp.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Học sinh</th>
                <th className="px-8 py-5">Đề thi</th>
                <th className="px-8 py-5">Kết quả</th>
                <th className="px-8 py-5">Thời gian</th>
                <th className="px-8 py-5">Tiến độ</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAttempts.map((attempt) => (
                <tr key={attempt.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                        {attempt.userName?.charAt(0).toUpperCase() || attempt.userId.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{attempt.userName || attempt.userId}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Lớp: {attempt.className || 'Chưa xác định'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-medium text-slate-600">{attempt.examTitle}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{new Date(attempt.date).toLocaleString('vi-VN')}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center px-3 py-1 rounded-lg text-sm font-black",
                      attempt.score >= 8 ? "bg-emerald-50 text-emerald-600" : 
                      attempt.score >= 5 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                    )}>
                      {(attempt.score || 0).toFixed(1)}/10
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-medium text-sm">
                    {Math.floor(attempt.timeSpent / 60)}p {attempt.timeSpent % 60}s
                  </td>
                  <td className="px-8 py-6">
                    {attempt.studentProgress ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100">
                        <ShieldCheck size={12} /> {attempt.studentProgress}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">Chưa đánh giá</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => {
                        setCommentingId(attempt.id);
                        setComment(attempt.teacherComment || '');
                        setProgress(attempt.studentProgress || '');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-xs font-bold shadow-sm"
                    >
                      <MessageSquare size={14} /> NHẬN XÉT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
