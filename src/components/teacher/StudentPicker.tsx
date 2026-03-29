import React, { useState, useEffect } from 'react';
import { Users, Search, Check, ChevronDown, GraduationCap } from 'lucide-react';
import { rosterService, StudentEntry } from '../../services/rosterService';
import { cn } from '../../utils/cn';

export type AssignTarget =
  | { type: 'class'; targetClass: string }
  | { type: 'individuals'; targetClass: string; students: string[] }
  | { type: 'all' };

interface Props {
  value: AssignTarget | null;
  onChange: (target: AssignTarget) => void;
}

export default function StudentPicker({ value, onChange }: Props) {
  const [rosters, setRosters] = useState(() => rosterService.getRosters());
  const [tab, setTab] = useState<'class' | 'individual'>('class');
  const [selectedClass, setSelectedClass] = useState('');
  const [customClass, setCustomClass] = useState('');
  const [search, setSearch] = useState('');
  const [checkedStudents, setCheckedStudents] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  // Refresh rosters when they change
  useEffect(() => {
    setRosters(rosterService.getRosters());
  }, []);

  const students: StudentEntry[] = selectedClass
    ? rosterService.getStudentsForClass(selectedClass)
    : [];

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // When clicking class in individual tab, keep students visible
  const handleClassClick = (className: string) => {
    setSelectedClass(className);
    setCheckedStudents(new Set());
    setCustomClass('');
    // If user is in individual tab, load the students for that class
  };

  const toggleStudent = (name: string) => {
    setCheckedStudents(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const isAllChecked = filtered.length > 0 && filtered.every(s => checkedStudents.has(s.name));

  const toggleAll = () => {
    if (isAllChecked) {
      setCheckedStudents(prev => {
        const next = new Set(prev);
        filtered.forEach(s => next.delete(s.name));
        return next;
      });
    } else {
      setCheckedStudents(prev => {
        const next = new Set(prev);
        filtered.forEach(s => next.add(s.name));
        return next;
      });
    }
  };

  const handleApply = () => {
    const cls = selectedClass || customClass.trim();
    if (!cls) return;
    if (tab === 'class') {
      onChange({ type: 'class', targetClass: cls });
    } else {
      if (checkedStudents.size === 0) return;
      onChange({ type: 'individuals', targetClass: cls, students: Array.from(checkedStudents) });
    }
    setOpen(false);
  };

  // Display summary
  const summary = !value ? '' :
    value.type === 'class' ? `Lớp ${value.targetClass} (cả lớp)` :
    value.type === 'individuals' ? `${value.students.length} HS được chọn — Lớp ${value.targetClass}` :
    'Tất cả học sinh';

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm font-medium transition-all',
          value
            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
        )}
      >
        <span className="flex items-center gap-2">
          <GraduationCap size={16} />
          {value ? summary : 'Chọn lớp hoặc học sinh cụ thể...'}
        </span>
        <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {[
                { key: 'class', label: 'Cả lớp' },
                { key: 'individual', label: 'Chọn HS cụ thể' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key as any)}
                  className={cn(
                    'flex-1 py-2.5 text-xs font-black uppercase tracking-wider transition-colors',
                    tab === key ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {/* Class selector */}
              {rosters.length > 0 ? (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Chọn lớp từ danh sách đã lưu</label>
                  <div className="grid grid-cols-2 gap-2">
                    {rosters.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleClassClick(r.className)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition-all',
                          selectedClass === r.className
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        )}
                      >
                        <Users size={14} />
                        {r.className}
                        <span className="ml-auto text-[10px] text-slate-400 font-medium">{r.students.length}</span>
                        {selectedClass === r.className && <Check size={12} className="text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Custom class name input */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  {rosters.length > 0 ? 'Hoặc nhập tên lớp thủ công' : 'Nhập tên lớp'}
                </label>
                <input
                  type="text"
                  value={customClass}
                  onChange={e => { setCustomClass(e.target.value); setSelectedClass(''); setCheckedStudents(new Set()); }}
                  placeholder="VD: 12A1, 12B2, all..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>

              {/* Individual student list */}
              {tab === 'individual' && students.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-1">
                      Chọn học sinh ({checkedStudents.size}/{students.length})
                    </label>
                    <button onClick={toggleAll} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800">
                      {isAllChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                  <div className="relative mb-2">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Tìm tên..." className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {filtered.map((s, i) => (
                      <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <div className={cn(
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                          checkedStudents.has(s.name) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                        )}>
                          {checkedStudents.has(s.name) && <Check size={12} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={checkedStudents.has(s.name)} onChange={() => toggleStudent(s.name)} />
                        <span className="text-sm font-medium text-slate-700">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual tab: no class selected yet */}
              {tab === 'individual' && !selectedClass && !customClass.trim() && (
                <div className="text-center py-4 text-slate-400">
                  <GraduationCap size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-500">Chọn lớp ở trên</p>
                  <p className="text-[11px] mt-0.5">để xem danh sách học sinh cụ thể</p>
                </div>
              )}

              {tab === 'individual' && selectedClass && students.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-3">
                  Lớp này chưa có danh sách HS. Hãy upload file ở tab "Danh sách lớp".
                </p>
              )}
            </div>

            {/* Apply button */}
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button
                onClick={handleApply}
                disabled={!selectedClass && !customClass.trim()}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                {tab === 'class'
                  ? `Xác nhận — Giao cho cả lớp ${selectedClass || customClass || '...'}`
                  : `Xác nhận — ${checkedStudents.size} học sinh được chọn`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
