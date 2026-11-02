import React, { Component, type ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitleEn?: string;
  fallbackTitleAr?: string;
  onReset?: () => void;
  sectionName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('🛡️ [ROSTRO KYC ERROR BOUNDARY CAUGHT EXCEPTION]:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const {
        fallbackTitleEn = 'An unexpected render error occurred in this view',
        fallbackTitleAr = 'حدث خطأ غير متوقع أثناء عرض هذه الواجهة',
        sectionName = 'Component',
      } = this.props;

      return (
        <div
          role="alert"
          className="m-4 p-5 rounded-[22px] border border-rose-500/40 bg-[#16181f] text-zinc-100 shadow-2xl space-y-4 max-w-xl mx-auto"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-start flex-1 min-w-0">
              <h3 className="text-sm font-bold text-rose-300">
                {fallbackTitleEn}
              </h3>
              <p className="text-xs text-rose-200/80 font-arabic">
                {fallbackTitleAr}
              </p>
              <div className="text-[10px] font-mono text-zinc-400 mt-1">
                Module: {sectionName}
              </div>
            </div>
          </div>

          {this.state.error && (
            <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] text-xs font-mono text-rose-300/90 overflow-x-auto select-all max-h-32">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] hover:from-[#059669] hover:to-[#065f46] text-white shadow-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة · Retry & Recover</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
