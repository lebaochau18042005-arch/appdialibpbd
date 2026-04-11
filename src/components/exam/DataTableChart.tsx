import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart2, TrendingUp, Table2 } from 'lucide-react';

/**
 * DataTableChart: Parses a GFM markdown table from the question's context field
 * and renders either a styled HTML table OR an interactive Recharts bar/line chart.
 * Table and chart are MUTUALLY EXCLUSIVE (toggle between them).
 */

// ── Markdown table parser ─────────────────────────────────────────────────────
interface TableData {
  headers: string[];
  rows: string[][];
}

function parseMarkdownTable(md: string): TableData | null {
  // Collect ALL lines that look like table rows (start with |)
  const lines = md.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  if (lines.length < 3) return null;

  const parseRow = (line: string) =>
    line.replace(/^\||\\|$/g, '').split('|').map(c => c.trim());

  // Find separator row (contains only |----|----| style)
  const separatorIdx = lines.findIndex(l =>
    /^\|[-|:\s]+\|$/.test(l) || /^(\s*[-:]+\s*\|)+\s*[-:]+\s*$/.test(l.replace(/^\|/, '').replace(/\|$/, ''))
  );
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

// Check if table has numeric columns (suitable for charting)
function hasNumericData(data: ReturnType<typeof tableToChartData>, keys: string[]): boolean {
  return keys.some(k => data.some(d => typeof d[k] === 'number'));
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
        <p key={i} style={{ color: p.fill || p.stroke }}>
          {p.name}: <span className="font-bold">
            {typeof p.value === 'number' ? p.value.toLocaleString('vi-VN') : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
interface DataTableChartProps {
  content: string;
  title?: string;
}

export default function DataTableChart({ content }: DataTableChartProps) {
  // Mutually exclusive: show table OR chart (not both)
  const [view, setView] = useState<'table' | 'bar' | 'line'>('table');

  const table = useMemo(() => {
    // Collect ALL pipe-starting lines — do NOT stop at blank lines (fixes truncation)
    return parseMarkdownTable(content);
  }, [content]);

  const chartData = useMemo(() => table ? tableToChartData(table) : [], [table]);
  const numericKeys = useMemo(() =>
    table ? table.headers.slice(1).filter(h => hasNumericData(chartData, [h])) : [],
    [table, chartData]
  );

  const canChart = numericKeys.length > 0 && chartData.length >= 2;

  // Extract non-table text (source notes)
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

  return (
    <div className="space-y-3 w-full">
      {/* View toggle — mutually exclusive */}
      {canChart && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${view === 'table' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'}`}
          >
            <Table2 size={12} /> Bảng số liệu
          </button>
          <button
            onClick={() => setView('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${view === 'bar' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50'}`}
          >
            <BarChart2 size={12} /> Biểu đồ cột
          </button>
          <button
            onClick={() => setView('line')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${view === 'line' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50'}`}
          >
            <TrendingUp size={12} /> Biểu đồ đường
          </button>
        </div>
      )}

      {/* Data Table — only when view === 'table' */}
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
                    <td
                      key={ci}
                      className={`px-4 py-2 border border-indigo-100 text-center whitespace-nowrap text-sm ${ci === 0 ? 'font-semibold text-slate-700 text-left' : 'text-slate-600 tabular-nums font-medium'}`}
                    >
                      {row[ci] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chart — only when view === 'bar' or 'line' */}
      {canChart && (view === 'bar' || view === 'line') && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <ResponsiveContainer width="100%" height={260}>
            {view === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={chartData.length > 5 ? -30 : 0}
                  textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                  height={chartData.length > 5 ? 50 : 30}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={55} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString('vi-VN') : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                {numericKeys.map((key, i) => (
                  <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={60} />
                ))}
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={chartData.length > 5 ? -30 : 0}
                  textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                  height={chartData.length > 5 ? 50 : 30}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} width={55} tickFormatter={(v) => typeof v === 'number' ? v.toLocaleString('vi-VN') : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                {numericKeys.map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            )}
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
