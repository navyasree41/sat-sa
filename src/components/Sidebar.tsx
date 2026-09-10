import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  FileCheck2,
  Scale,
  GitCompare,
  Radar,
  ListTodo,
  Database
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab =
  | 'overview'
  | 'examiner_workspace'
  | 'soc_assessments'
  | 'investigation_integrity'
  | 'kpi_evidence'
  | 'say_do'
  | 'detection_coverage'
  | 'supervisory_queue';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  queueCount?: number;
  currentUserRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, queueCount = 0, currentUserRole }) => {
  const navItems = currentUserRole === 'NCIIPC Examiner' ? [
    { id: 'examiner_workspace' as NavTab, label: 'Examiner Workspace', icon: LayoutDashboard },
    { id: 'soc_assessments' as NavTab, label: 'SOC Assessments', icon: ShieldAlert },
    { id: 'investigation_integrity' as NavTab, label: 'Investigation Integrity', icon: FileCheck2 },
    { id: 'kpi_evidence' as NavTab, label: 'KPI vs Evidence', icon: Scale },
    { id: 'say_do' as NavTab, label: 'Say–Do Gap', icon: GitCompare },
    { id: 'detection_coverage' as NavTab, label: 'Detection Coverage', icon: Radar },
  ] : [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'soc_assessments' as NavTab, label: 'CSE Assessments', icon: ShieldAlert },
    { id: 'investigation_integrity' as NavTab, label: 'Investigation Integrity', icon: FileCheck2 },
    { id: 'kpi_evidence' as NavTab, label: 'KPI vs Evidence', icon: Scale },
    { id: 'say_do' as NavTab, label: 'Say–Do Gap', icon: GitCompare },
    { id: 'detection_coverage' as NavTab, label: 'Detection Coverage', icon: Radar },
    { id: 'supervisory_queue' as NavTab, label: 'Supervisory Review Queue', icon: ListTodo, badge: queueCount },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm tracking-wider">
            SA
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              SAT-SA
            </h1>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">
              SOC Assurance &amp; Threat Surveillance Analytics
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Prototype • Synthetic Data</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          Python Flask Operational Assurance Engine
        </p>
      </div>
    </aside>
  );
};
