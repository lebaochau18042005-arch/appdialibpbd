import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { BarChart2, TrendingUp, Table2, PieChart as PieIcon, Layers } from 'lucide-react';

/**
 * DataTableChart: Parses a GFM markdown table from the question's context field
 * and renders an interactive chart.
 * Supports: bar, line, area/miền, combined (bar+line), pie/tròn.
 * Auto-detects the intended chart type from the first line of context.
 */

// ── Types ─────────────────────────────────────────────────────────────────────
type ViewMode = 'table' | 'bar' | 'line' | 'area' | 'combined' | 'pie';

interface TableData {
  headers: string[];
  rows: string[][];
}

// ── Markdown table parser ─────────────────────────────────────────────────────
function parseMarkdownTable(md: string): TableData | null {
  const lines = md.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  if (lines.length < 3) return null;

  const parseRow = (line: string) =>
    line.replace(/^\||\|$/g, '').split('|').map(c => c.trim());

  const separatorIdx = lines.findIndex(l => {
    const inner = l.replace(/^\||\|$/g, '');
    return inner.split('|').every(cell => /^\s*:?-+:?\s*$/.test(cell));
  });
  if (separatorIdx < 1) return null;

  const headers = parseRow(lines[separatorIdx - 1]);
  const rows = lines.slice(separatorIdx + 1).map(parseRow);
  if (rows.length === 0 || headers.length < 2) return null;
  return { headers, rows };
}

// Convert table to Recharts-compatible data array
function tableToChartData(table: TableData): { name: string; [key: string]: string | number }[] {
  const { headers, rows } = table;
  return rows.map(row => {
    const obj: { name: string; [key: string]: string | number } = { name: row[0] || '' };
    headers.slice(1).forEach((h, i) => {
      const raw = (row[i + 1] || '').replace(/,/g, '').replace(/\s/g, '');
      const num = parseFloat(raw);
      obj[h] = isNaN(num) ? raw : num;
    });
    return obj;
  });
}

function hasNumericData(data: ReturnType<typeof tableToChartData>, keys: string[]): boolean {
  return keys.some(k => data.some(d => typeof d[k] === 'number'));
}

// Auto-detect chart type from the first line of context
function detectChartType(content: string): ViewMode {
  const firstLine = content.split('\n')[0].toLowerCase();
  if (/kết hợp|combined|cột.*đường|đường.*cột/.test(firstLine)) return 'combined';
  if (/miền|area/.test(firstLine)) return 'area';
  if (/tròn|pie|cơ cấu/.test(firstLine)) return 'pie';
  if (/đường|line|tốc độ|xu hướng/.test(firstLine)) return 'line';
  return 'bar'; // default
}

// ── Colors ────────────────────────────────────────────────────────────────────
const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl text-sm">
      <p className="font-bold text-slate-800 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.stroke || p.color }}>
          {p.name}: <span className="font-bold">
            {typeof p.value === 'number' ? p.value.toLocaleString('vi-VN') : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// Custom Pie label
const renderPieLabel = ({ name, percent }: any) =>
  `${name}: ${(percent * 100).toFixed(1)}%`;

// ── Main component ────────────────────────────────────────────────────────────
interface DataTableChartProps {
  content: string;
  title?: string;
}

export default function DataTableChart({ content }: DataTableChartProps) {
  const suggestedView = useMemo(() => detectChartType(content), [content]);
  const [view, setView] = useState<ViewMode>(suggestedView);

  const table = useMemo(() => parseMarkdownTable(content), [content]);
  const chartData = useMemo(() => table ? tableToChartData(table) : [], [table]);

  // For combined chart: first numeric key → bar (left Y), rest → line (right Y)
  const numericKeys = useMemo(() =>
    table ? table.headers.slice(1).filter(h => hasNumericData(chartData, [h])) : [],
    [table, chartData]
  );

  const canChart = numericKeys.length > 0 && chartData.length >= 2;

  const annotation = useMemo(() => {
    const lines = content.split('\n');
    const nonTable = lines.filter(l => !l.trim().startsWith('|') && l.trim()).join(' ');
    return nonTable.trim();
  }, [content]);

  if (!table) {
    return (
      <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{content}</p>
    );
  }

  const commonAxisProps = {
    tick: { fontSize: 11, fill: '#64748b' },
    angle: chartData.length > 5 ? -30 : 0,
    textAnchor: chartData.length > 5 ? 'end' : 'middle' as 'end' | 'middle',
    height: chartData.length > 5 ? 50 : 30,
  };
  const yTickFormatter = (v: any) => typeof v === 'number' ? v.toLocaleString('vi-VN') : v;

  const tabStyle = (active: boolean, color: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
      active ? `bg-${color}-600 text-white border-${color}-600`
             : `bg-white text-${color}-600 border-${color}-300 hover:bg-${color}-50`
    }`;

  return (
    <div className="space-y-3 w-full">
      {/* View toggle */}
      {canChart && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${view === 'table' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'}`}>
            <Table2 size={12} /> Bảng số liệu
          </button>
          <button onClick={() => setView('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${view === 'bar' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50'}`}>
            <BarChart2 size={12} /> Biểu đồ cột
          </button>
          <button onClick={() => setView('line')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${view === 'line' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50'}`}>
            <TrendingUp size={12} /> Biểu đồ đường
          </button>
          <button onClick={() => setView('area')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${view === 'area' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-sky-600 border-sky-300 hover:bg-sky-50'}`}>
            <Layers size={12} /> Biểu đồ miền
          </button>
          {numericKeys.length >= 2 && (
            <button onClick={() => setView('combined')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${view === 'combined' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-violet-600 border-violet-300 hover:bg-violet-50'}`}>
              <BarChart2 size={12} /> Kết hợp
            </button>
          )}
          {numericKeys.length === 1 && (
            <button onClick={() => setView('pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${view === 'pie' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-600 border-rose-300 hover:bg-rose-50'}`}>
              <PieIcon size={12} /> Biểu đồ tròn
            </button>
          )}
        </div>
      )}

      {/* Data Table */}
      {view === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-indigo-200 shadow-sm">
          <table className="text-sm border-collapse" style={{ minWidth: 'max-content', width: '100%' }}>
            <thead>
              <tr className="bg-indigo-600 text-white">
                {table.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 border border-indigo-500 text-center whitespace-nowrap font-bold text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-indigo-50/40'}>
                  {table.headers.map((_, ci) => (
                    <td key={ci}
                      className={`px-4 py-2 border border-indigo-100 text-center whitespace-nowrap text-sm ${ci === 0 ? 'font-semibold text-slate-700 text-left' : 'text-slate-600 tabular-nums font-medium'}`}>
                      {row[ci] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bar chart */}
      {canChart && view === 'bar' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={60} tickFormatter={yTickFormatter} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {numericKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={60} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Line chart */}
      {canChart && view === 'line' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={60} tickFormatter={yTickFormatter} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {numericKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Area / Miền chart */}
      {canChart && view === 'area' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" {...commonAxisProps} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={60} tickFormatter={yTickFormatter} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {numericKeys.map((key, i) => (
                <Area key={key} type="monotone" dataKey={key}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  fillOpacity={0.25} strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Combined / Kết hợp chart — Bar (left Y) + Line (right Y) */}
      {canChart && view === 'combined' && numericKeys.length >= 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[11px] text-slate-500 mb-2 font-medium">
            Biểu đồ kết hợp: <span className="text-indigo-600">{numericKeys[0]}</span> (cột, trục trái)
            + <span className="text-amber-600">{numericKeys.slice(1).join(', ')}</span> (đường, trục phải)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 40, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" {...commonAxisProps} />
              {/* Left Y-axis for bar */}
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} width={60} tickFormatter={yTickFormatter} />
              {/* Right Y-axis for line(s) */}
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#f59e0b' }} width={50} tickFormatter={yTickFormatter} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {/* First key → bar on left axis */}
              <Bar yAxisId="left" dataKey={numericKeys[0]} fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} maxBarSize={60} name={numericKeys[0]} />
              {/* Remaining keys → lines on right axis */}
              {numericKeys.slice(1).map((key, i) => (
                <Line yAxisId="right" key={key} type="monotone" dataKey={key}
                  stroke={CHART_COLORS[(i + 2) % CHART_COLORS.length]}
                  strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name={key} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie / Tròn chart */}
      {canChart && view === 'pie' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData.map((d, i) => ({ name: d.name, value: typeof d[numericKeys[0]] === 'number' ? d[numericKeys[0]] as number : 0 }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={renderPieLabel}
                labelLine={true}
              >
                {chartData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => typeof v === 'number' ? v.toLocaleString('vi-VN') : v} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Source annotation */}
      {annotation && (
        <p className="text-[11px] text-slate-400 italic leading-relaxed">{annotation}</p>
      )}
    </div>
  );
}
