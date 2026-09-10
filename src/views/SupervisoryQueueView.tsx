import React, { useState } from 'react';
import {
  ListTodo,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  Filter,
  Search,
  Eye,
  RotateCcw,
  Check,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { SupervisoryQueueData, Finding, AssessmentPeriod, UserRole } from '../types';
import { FindingDetailModal } from '../components/FindingDetailModal';

interface SupervisoryQueueViewProps {
  data: SupervisoryQueueData;
  selectedSoc: string;
  selectedPeriod: AssessmentPeriod;
  currentUserRole: UserRole;
  onFindingUpdated: () => void;
  onInspectInvestigation?: (investigationId: string) => void;
}

export const SupervisoryQueueView: React.FC<SupervisoryQueueViewProps> = ({
  data,
  selectedSoc,
  selectedPeriod,
  currentUserRole,
  onFindingUpdated,
  onInspectInvestigation
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const activeFindings = (data.active_findings || data.queue || []).filter((f) => {
    if (filterSeverity !== 'ALL' && f.severity !== filterSeverity) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        f.finding_id.toLowerCase().includes(q) ||
        f.finding_type.toLowerCase().includes(q) ||
        f.soc_id.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q) ||
        (f.impact && f.impact.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const completedFindings = (data.completed_findings || []).filter((f) => {
    if (filterSeverity !== 'ALL' && f.severity !== filterSeverity) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        f.finding_id.toLowerCase().includes(q) ||
        f.finding_type.toLowerCase().includes(q) ||
        f.soc_id.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Supervisory Governance &amp; Action Queue
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {selectedSoc === 'ALL' ? 'Cross-SOC Operations' : `Target: ${selectedSoc}`} • Period: Last {selectedPeriod} Days • Active Role: <strong className="text-white">{currentUserRole}</strong>
          </span>
        </div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-cyan-400" />
          Risk-Prioritized Supervisory Review Queue
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
          Provides deterministic risk rankings and an audit trail for supervisory interventions. NCIIPC Examiners may submit reviews; NCIIPC Senior Supervisors possess authorization to approve completion or reopen cases.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium mb-1">Active Queue</div>
          <div className="text-2xl font-extrabold text-amber-400">
            {data.total_active ?? activeFindings.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Open or Under Review</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium mb-1">High &amp; Critical Impact</div>
          <div className="text-2xl font-extrabold text-red-400">
            {data.high_priority_count ?? activeFindings.filter(f => f.severity === 'Critical' || f.severity === 'High').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Requires immediate supervisory review</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium mb-1">Completed &amp; Locked</div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {data.total_completed ?? completedFindings.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Senior Supervisor sign-off recorded</div>
        </div>
      </div>

      {/* Global Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Filter Queue:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search finding ID, type, SOC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* SECTION 1: Active Findings Requiring Review (Requirement 11, 36) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Active Findings Requiring Review
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {activeFindings.length} Active
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Open &amp; Under Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Finding ID / Scope</th>
                <th className="py-3 px-4">Finding Type</th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Confidence</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Supervisory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
              {activeFindings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No active supervisory findings match your filters. All items may be resolved or under other scopes.
                  </td>
                </tr>
              ) : (
                activeFindings.map((f) => (
                  <tr key={f.finding_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      #{f.priority_rank}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-cyan-400">{f.finding_id}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{f.soc_id} &bull; {f.evidence_count} evidence records</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="font-medium text-slate-200 block">{f.finding_type}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-xs">{f.explanation}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.severity === 'Critical' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                        f.severity === 'High' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' :
                        f.severity === 'Medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-red-400">{f.risk_score}</span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-cyan-400">{f.confidence_pct}%</span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {f.status === 'UNDER REVIEW' ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-full">
                          <Clock className="w-2.5 h-2.5" /> UNDER REVIEW
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-blue-300 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded-full">
                          OPEN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedFinding(f)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 text-xs font-semibold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Audit Why
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Completed Findings (Requirement 11, 38) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              Completed Findings &amp; Historical Sign-Offs
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {completedFindings.length} Completed
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Read-only / Audit Trail Protected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Finding ID</th>
                <th className="py-3 px-4">SOC</th>
                <th className="py-3 px-4">Finding Type</th>
                <th className="py-3 px-4">Completed By</th>
                <th className="py-3 px-4">Completed Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
              {completedFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No findings have been marked COMPLETED yet. Use "Audit Why" above to review and sign off on active findings.
                  </td>
                </tr>
              ) : (
                completedFindings.map((f) => (
                  <tr key={f.finding_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-300">
                      {f.finding_id}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      {f.soc_id}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="font-medium text-slate-300 block">{f.finding_type}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-xs">{f.explanation}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">
                      {f.completed_by || 'NCIIPC Senior Supervisor'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {f.completed_at || 'Recorded in log'}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                        <Lock className="w-2.5 h-2.5" /> COMPLETED
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedFinding(f)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500 text-xs font-semibold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Audit Record
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finding Detail Modal */}
      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
          currentUserRole={currentUserRole}
          onFindingUpdated={() => {
            onFindingUpdated();
            setSelectedFinding(null);
          }}
          onInspectInvestigation={onInspectInvestigation}
        />
      )}
    </div>
  );
};
