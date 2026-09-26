import React from 'react';
import { AlertTriangle, RotateCcw, Home, ChevronDown } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught unhandled exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">
                Đã xảy ra sự cố không mong muốn
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Ứng dụng gặp lỗi tạm thời khi hiển thị giao diện. Đừng lo lắng, dữ liệu học tập và bài thi của bạn vẫn được lưu an toàn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all cursor-pointer text-sm"
              >
                <RotateCcw size={16} /> Tải lại trang
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer text-sm"
              >
                <Home size={16} /> Về trang chủ
              </button>
            </div>

            {/* Collapsible Error Details for debugging */}
            <div className="pt-2 border-t border-slate-100 text-left">
              <button
                onClick={this.toggleDetails}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronDown
                  size={14}
                  className={`transform transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`}
                />
                {this.state.showDetails ? 'Ẩn chi tiết kỹ thuật' : 'Xem chi tiết kỹ thuật lỗi'}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-4 bg-slate-900 rounded-xl text-left overflow-x-auto text-[11px] font-mono text-emerald-400 space-y-2 max-h-48 overflow-y-auto">
                  <p className="font-bold text-red-400">{this.state.error?.toString()}</p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-slate-400 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
