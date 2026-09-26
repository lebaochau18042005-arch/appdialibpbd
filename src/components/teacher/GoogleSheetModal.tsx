import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  ExternalLink,
  Download,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Save,
  Radio,
  FileText
} from 'lucide-react';
import { googleSheetService, GOOGLE_APPS_SCRIPT_TEMPLATE } from '../../services/googleSheetService';
import { QuizAttempt } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  attempts?: QuizAttempt[];
  teacherEmail?: string;
}

export default function GoogleSheetModal({ isOpen, onClose, attempts = [], teacherEmail }: Props) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Testing connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Batch sync state
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  const [batchResult, setBatchResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Script copy state
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    googleSheetService.getConfig(teacherEmail).then(cfg => {
      setWebhookUrl(cfg.webhookUrl || '');
      setSheetUrl(cfg.sheetUrl || '');
      setAutoSync(cfg.autoSync ?? true);
      setTestResult(null);
      setBatchResult(null);
    });
  }, [isOpen, teacherEmail]);

  if (!isOpen) return null;

  const handleSave = async () => {
    await googleSheetService.saveConfig(webhookUrl, sheetUrl, autoSync, teacherEmail);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      setTestResult({ success: false, msg: 'Vui lòng nhập Webhook URL trước khi kiểm tra!' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const ok = await googleSheetService.testConnection(webhookUrl.trim());
    setIsTesting(false);
    if (ok) {
      setTestResult({
        success: true,
        msg: 'Kiểm tra thành công! Đã gửi 1 dòng dữ liệu mẫu lên Google Sheet của bạn. Hãy mở file Google Sheet để kiểm tra.'
      });
      // Tự động lưu URL hợp lệ
      handleSave();
    } else {
      setTestResult({
        success: false,
        msg: 'Không thể kết nối với Webhook URL. Hãy kiểm tra lại link Web App và quyền truy cập (Anyone).'
      });
    }
  };

  const handleBatchSync = async () => {
    if (!webhookUrl.trim()) {
      alert('Vui lòng cấu hình Webhook URL trước khi đồng bộ!');
      return;
    }
    if (attempts.length === 0) {
      alert('Không có dữ liệu bài thi nào để đồng bộ!');
      return;
    }

    setIsBatchSyncing(true);
    setBatchResult(null);
    const ok = await googleSheetService.syncBatchAttempts(attempts, teacherEmail);
    setIsBatchSyncing(false);

    if (ok) {
      setBatchResult({
        success: true,
        msg: `Đã đồng bộ thành công toàn bộ ${attempts.length} bài làm của học sinh lên Google Sheet!`
      });
    } else {
      setBatchResult({
        success: false,
        msg: 'Đồng bộ thất bại. Vui lòng kiểm tra lại Webhook URL và đường truyền mạng.'
      });
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleExportCSV = () => {
    googleSheetService.exportAttemptsToCSV(attempts);
  };

  const isConnected = !!webhookUrl.trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">Đồng Bộ Điểm Vào Google Sheet</h2>
                {isConnected ? (
                  <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 text-[10px] font-black rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" /> Đã kết nối
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-white/20 text-white/90 text-[10px] font-bold rounded-full">
                    Chưa cài đặt
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Tự động lưu điểm, thời gian làm bài &amp; số lần rời tab của học sinh thời gian thực
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace Teacher Indicator */}
        {teacherEmail && (
          <div className="px-6 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <span>👤 Bảng tính của Thầy/Cô:</span>
              <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-lg font-mono text-[11px] shadow-sm">
                {teacherEmail}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-black bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
              ✓ Không gian riêng biệt
            </span>
          </div>
        )}

        {/* Body (scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !webhookUrl.trim()}
              className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl border border-indigo-200/80 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isTesting ? <RefreshCw size={16} className="animate-spin text-indigo-600" /> : <Send size={16} className="text-indigo-600" />}
              <span>Kiểm tra kết nối</span>
            </button>

            <button
              onClick={handleBatchSync}
              disabled={isBatchSyncing || !webhookUrl.trim() || attempts.length === 0}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200/80 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              title="Đồng bộ toàn bộ danh sách kết quả bài thi hiện có lên Sheet"
            >
              {isBatchSyncing ? <RefreshCw size={16} className="animate-spin text-emerald-600" /> : <RefreshCw size={16} className="text-emerald-600" />}
              <span>Đồng bộ {attempts.length} bài cũ</span>
            </button>

            {sheetUrl.trim() ? (
              <a
                href={sheetUrl.trim()}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-2xl border border-teal-200/80 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <ExternalLink size={16} className="text-teal-600" />
                <span>Mở Google Sheet</span>
              </a>
            ) : (
              <button
                disabled
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 opacity-60"
              >
                <ExternalLink size={16} />
                <span>Mở Google Sheet</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl border border-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all"
              title="Tải về file CSV tương thích với Excel và Google Sheets"
            >
              <Download size={16} className="text-slate-600" />
              <span>Xuất file CSV</span>
            </button>
          </div>

          {/* Test or Batch Status Messages */}
          <AnimatePresence>
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 border',
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                )}
              >
                {testResult.success ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />}
                <span>{testResult.msg}</span>
              </motion.div>
            )}

            {batchResult && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 border',
                  batchResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                )}
              >
                {batchResult.success ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />}
                <span>{batchResult.msg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inputs Section */}
          <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100">
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Google Apps Script Webhook URL <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal lowercase">(dạng https://script.google.com/macros/s/.../exec)</span>
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-xs text-slate-700"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Link Webhook nhận kết quả từ Google Apps Script (Xem hướng dẫn 5 bước bên dưới để tạo link này trong 1 phút).
              </p>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Link Bảng Tính Google Sheet (Tùy chọn)</span>
                <span className="text-[10px] text-slate-400 font-normal lowercase">(dạng https://docs.google.com/spreadsheets/d/...)</span>
              </label>
              <input
                type="url"
                value={sheetUrl}
                onChange={e => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-700"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Dán link này để có thể bấm nút "Mở Google Sheet" xem bảng điểm trực tiếp bất cứ lúc nào.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={e => setAutoSync(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Tự động đồng bộ ngay khi học sinh nộp bài</span>
              </label>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {savedSuccess ? <Check size={14} /> : <Save size={14} />}
                <span>{savedSuccess ? 'Đã lưu cấu hình!' : 'Lưu cấu hình'}</span>
              </button>
            </div>
          </div>

          {/* Setup Guide Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowGuide(v => !v)}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2 font-black text-slate-800 text-xs uppercase tracking-wider">
                <HelpCircle size={16} className="text-emerald-600" />
                <span>Hướng dẫn cài đặt Google Apps Script (5 bước trong 1 phút)</span>
              </div>
              {showGuide ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            <AnimatePresence>
              {showGuide && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-slate-100 bg-white"
                >
                  <div className="p-4 sm:p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
                    <ol className="space-y-3 list-decimal list-inside font-medium">
                      <li>
                        <strong>Bước 1:</strong> Truy cập Google Drive, tạo một file <strong>Google Trang tính (Google Sheets)</strong> mới và đặt tên (VD: <em>Điểm Thi Địa Lí 12</em>).
                      </li>
                      <li>
                        <strong>Bước 2:</strong> Trên menu trên cùng của Google Sheet, chọn <strong>Tiện ích mở rộng (Extensions) ➔ Apps Script</strong>.
                      </li>
                      <li>
                        <strong>Bước 3:</strong> Xóa toàn bộ mã mặc định trong Apps Script, sau đó sao chép đoạn mã dưới đây và dán vào, rồi nhấn <strong>Lưu (Ctrl + S)</strong>:
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={handleCopyScript}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            <span>{copied ? 'Đã sao chép mã!' : 'Sao chép mã Apps Script'}</span>
                          </button>
                          <span className="text-[11px] text-slate-400">(Mã đã tối ưu tự tạo tiêu đề, chống xung đột ghi)</span>
                        </div>
                      </li>
                      <li>
                        <strong>Bước 4:</strong> Nhấn nút <strong>Triển khai (Deploy) ➔ Tùy chọn triển khai mới (New deployment)</strong>:
                        <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-600">
                          <li>Chọn loại: <strong>Ứng dụng web (Web app)</strong>.</li>
                          <li>Thực thi dưới dạng (Execute as): <strong>Tôi (Tài khoản Google của bạn)</strong>.</li>
                          <li>Ai có quyền truy cập (Who has access): chọn <strong>Bất kỳ ai (Anyone)</strong>.</li>
                          <li>Nhấn <strong>Triển khai (Deploy)</strong> và cấp quyền nếu Google yêu cầu.</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Bước 5:</strong> Sao chép <strong>URL ứng dụng web (Web app URL)</strong> nhận được, dán vào ô <em>Webhook URL</em> ở trên và nhấn <strong>Lưu cấu hình</strong>.
                      </li>
                    </ol>

                    {/* Collapsible script preview */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <FileText size={12} /> Mã nguồn Apps Script:
                        </span>
                        <button
                          onClick={handleCopyScript}
                          className="text-[11px] text-indigo-600 hover:underline font-bold flex items-center gap-1"
                        >
                          <Copy size={11} /> {copied ? 'Đã sao chép' : 'Sao chép mã'}
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[10px] font-mono overflow-x-auto max-h-48 scrollbar-thin">
                        {GOOGLE_APPS_SCRIPT_TEMPLATE}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400">
            Dữ liệu được bảo mật trực tiếp trên Google Drive của giáo viên.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
}
