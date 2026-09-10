import React from 'react';
import { RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading SOC assessment data...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[360px] p-8 text-center">
    <div className="relative mb-4">
      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
        <ShieldCheck className="w-6 h-6 text-sky-400 animate-pulse" />
      </div>
      <RefreshCw className="w-5 h-5 text-sky-500 animate-spin absolute -top-1 -right-1" />
    </div>
    <p className="text-sm font-medium text-slate-200">{message}</p>
    <p className="text-xs text-slate-500 mt-1">Fetching operational evidence from Flask analytics backend</p>
  </div>
);

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[360px] p-8 text-center max-w-lg mx-auto">
    <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800/80 flex items-center justify-center mb-4 text-red-400">
      <AlertTriangle className="w-6 h-6" />
    </div>
    <h3 className="text-base font-semibold text-slate-100 mb-1">Unable to connect to the analytics backend</h3>
    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
      {error || "Please make sure the Python Flask server is running and accessible."}
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-colors cursor-pointer"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      Retry Connection
    </button>
  </div>
);
