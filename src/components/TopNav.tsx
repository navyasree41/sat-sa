import React from 'react';
import { Calendar, UserCheck, RefreshCw, Shield } from 'lucide-react';
import { SOCSummary, AssessmentPeriod, UserRole } from '../types';

interface TopNavProps {
  selectedSoc: string;
  onSelectSoc: (socId: string) => void;
  selectedPeriod: AssessmentPeriod;
  onSelectPeriod: (period: AssessmentPeriod) => void;
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  socList: SOCSummary[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  selectedSoc,
  onSelectSoc,
  selectedPeriod,
  onSelectPeriod,
  selectedRole,
  onSelectRole,
  socList,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Left side: Context selectors (SOC Scope & Global Assessment Period) */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* SOC Selector */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="soc-selector" className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
            SOC:
          </label>
          <select
            id="soc-selector"
            value={selectedSoc}
            onChange={(e) => onSelectSoc(e.target.value)}
            className="bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All SOCs (Cross-Organization View)</option>
            {socList.map((soc) => (
              <option key={soc.soc_id} value={soc.soc_id}>
                {soc.soc_name}
              </option>
            ))}
          </select>
        </div>

        {/* Global Assessment Period Selector (Requirement 4) */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-xs hidden md:inline">Period:</span>
          <select
            id="assessment-period-selector"
            value={selectedPeriod}
            onChange={(e) => onSelectPeriod(e.target.value as AssessmentPeriod)}
            className="bg-transparent border-0 text-xs font-semibold text-cyan-300 focus:outline-none cursor-pointer pr-1"
          >
            <option value="7" className="bg-slate-900 text-slate-200">Last 7 Days</option>
            <option value="30" className="bg-slate-900 text-slate-200">Last 30 Days</option>
            <option value="90" className="bg-slate-900 text-slate-200">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Right side: Role Switcher & Sync */}
      <div className="flex items-center gap-3">
        {/* Role Selector (Requirement 12 & 42) */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
          <UserCheck className={`w-3.5 h-3.5 ${selectedRole === 'NCIIPC Senior Supervisor' ? 'text-amber-400' : 'text-cyan-400'}`} />
          <span className="text-slate-400 text-xs hidden sm:inline">Role:</span>
          <select
            id="user-role-selector"
            value={selectedRole}
            onChange={(e) => onSelectRole(e.target.value as UserRole)}
            className={`bg-transparent border-0 text-xs font-bold focus:outline-none cursor-pointer pr-1 ${
              selectedRole === 'NCIIPC Senior Supervisor' ? 'text-amber-300' : 'text-cyan-300'
            }`}
          >
            <option value="NCIIPC Examiner" className="bg-slate-900 text-slate-200">NCIIPC Examiner</option>
            <option value="NCIIPC Senior Supervisor" className="bg-slate-900 text-slate-200">NCIIPC Senior Supervisor</option>
          </select>
        </div>

        {/* Sync with Flask backend */}
        <button
          id="refresh-data-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Re-synchronize analysis from Python Flask backend"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Single Source of Truth Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[11px] font-medium text-slate-400">
            Flask Single Source of Truth
          </span>
        </div>
      </div>
    </header>
  );
};
