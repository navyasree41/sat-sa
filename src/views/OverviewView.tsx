import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Eye,
  Lock,
  Clock,
  Layers
} from 'lucide-react';
import { OverviewData, Finding, AssessmentPeriod, UserRole } from '../types';
import { NavTab } from '../components/Sidebar';
import { FindingDetailModal } from '../components/FindingDetailModal';

interface OverviewViewProps {
  data: OverviewData;
  onNavigateTab: (tab: NavTab) => void;
  selectedSoc: string;
  selectedPeriod: AssessmentPeriod;
  currentUserRole: UserRole;
  onFindingUpdated: () => void;
  onInspectInvestigation?: (investigationId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  data,
  onNavigateTab,
  selectedSoc,
  selectedPeriod,
  currentUserRole,
  onFindingUpdated,
  onInspectInvestigation
}) => {
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const getCategoryTab = (category: string): NavTab => {
    if (category.toLowerCase().includes('integrity')) return 'investigation_integrity';
    if (category.toLowerCase().includes('kpi')) return 'kpi_evidence';
    if (category.toLowerCase().includes('detection')) return 'detection_coverage';
    if (category.toLowerCase().includes('say') || category.toLowerCase().includes('procedure')) return 'say_do';
    return 'supervisory_queue';
  };

  const handleAuditFinding = (finding: Finding) => {
    setSelectedFinding(finding);
  };

  const handleAttentionAudit = (findingId?: string) => {
    if (!findingId) {
      onNavigateTab('supervisory_queue');
      return;
    }
    const found = data.priority_findings.find(f => f.finding_id === findingId);
    if (found) {
      setSelectedFinding(found);
    } else {
      onNavigateTab('supervisory_queue');
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Mission Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Supervisory Assurance Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {selectedSoc === 'ALL' ? 'Cross-SOC Operations' : `Target: ${selectedSoc}`} • Last {selectedPeriod} Days
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            SOC Assurance &amp; Threat Surveillance Analytics
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
            Independently verifies whether SOC performance, investigations, procedures, and detection coverage are supported by verifiable operational evidence.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('supervisory_queue')}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
          >
            <span>Supervisory Queue ({data.priority_findings_count})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 Core Top Metrics (Derived dynamically from underlying dataset) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Overall Assurance Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Overall Assurance</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{data.overall_assurance_score}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 100</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Assurance Posture</span>
            <span className={data.overall_assurance_score >= 80 ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
              {data.overall_assurance_score >= 80 ? 'Healthy Posture' : 'Review Required'}
            </span>
          </div>
        </div>

        {/* Metric 2: Priority Findings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Priority Findings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{data.priority_findings_count}</span>
            <span className="text-xs text-slate-400">issues active</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Completed:</span>
            <span className="text-emerald-400 font-semibold">{data.completed_findings_count || 0} locked</span>
          </div>
        </div>

        {/* Metric 3: High/Critical Impact Findings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">High / Critical Impact</span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-400">{data.high_critical_impact_count}</span>
            <span className="text-xs text-slate-400">severe items</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Integrity Risk</span>
            <span className="text-red-400 font-medium">Immediate Action</span>
          </div>
        </div>

        {/* Metric 4: Evidence Coverage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Evidence Coverage</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{data.evidence_coverage_pct}%</span>
            <span className="text-xs text-slate-400">verified cases</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Evidence Records:</span>
            <span className="text-slate-200 font-medium">{data.total_evidence_records.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 5: KPI Alignment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">KPI Alignment</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{data.kpi_alignment_pct}%</span>
            <span className="text-xs text-slate-400">claim consistency</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Operational Audited:</span>
            <span className="text-slate-200 font-medium">{data.total_investigations_analyzed.toLocaleString()} invs</span>
          </div>
        </div>
      </div>

      {/* "WHAT NEEDS ATTENTION?" SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              What Warrants Manual Review?
            </h3>
            <span className="text-xs text-slate-400">
              (Multi-signal operational discrepancies)
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {data.total_alerts_analyzed.toLocaleString()} alerts &bull; {data.total_investigations_analyzed.toLocaleString()} investigations audited
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.what_needs_attention.map((card, idx) => {
            const isCrit = card.severity === 'Critical';
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400">{card.category}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs font-semibold text-slate-300">{card.soc_name}</span>
                        {card.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                            <Lock className="w-2.5 h-2.5" /> Completed
                          </span>
                        ) : card.status === 'UNDER REVIEW' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800">
                            <Clock className="w-2.5 h-2.5" /> Under Review
                          </span>
                        ) : null}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100 mt-1">{card.title}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCrit
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-200 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-2.5">
                    {card.stat}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {card.explanation}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Confidence:</span>
                    <strong className="text-slate-200">{card.confidence_pct}%</strong>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">Risk Score:</span>
                    <strong className={isCrit ? 'text-red-400' : 'text-amber-400'}>
                      {card.risk_score}/100
                    </strong>
                  </div>
                  <button
                    onClick={() => handleAttentionAudit(card.finding_id)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                      <span>Review Evidence</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRIORITY SUPERVISORY FINDINGS TABLE (Requirement 3, 27, 28) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Priority Supervisory Findings
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Deterministic risk-ranked signals recommended for manual supervisory examination
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('supervisory_queue')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Full Supervisory Queue &rarr;</span>
          </button>
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
              {data.priority_findings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No active supervisory findings detected for this filter scope.
                  </td>
                </tr>
              ) : (
                data.priority_findings.map((f) => (
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
                      {f.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                          <Lock className="w-2.5 h-2.5" /> COMPLETED
                        </span>
                      ) : f.status === 'UNDER REVIEW' ? (
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
                        onClick={() => handleAuditFinding(f)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 text-xs font-semibold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review Evidence
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTELLIGENCE LAYER OVERVIEW CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Supervisory Assurance Methodology
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical correlation engine across {data.total_alerts_analyzed.toLocaleString()} alerts, {data.total_investigations_analyzed.toLocaleString()} investigations, and {data.total_evidence_records.toLocaleString()} evidence records
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
            Last {selectedPeriod} Days Window
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              1. Multi-Signal Evidence Validation
            </div>
            <p className="text-slate-400 leading-relaxed">
              Verifies whether analyst claims in investigation notes match verifiable operational evidence artifacts (PCAP, host logs, memory hashes).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              2. Full Event-Chain Correlation
            </div>
            <p className="text-slate-400 leading-relaxed">
              Reconstructs end-to-end event chains: Alert &rarr; Investigation &rarr; Evidence &rarr; Escalation &rarr; Closure timestamps.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-purple-400 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              3. Negative-Space Detection
            </div>
            <p className="text-slate-400 leading-relaxed">
              Detects silent gaps and procedural omissions: actions and telemetry that <em>should have occurred</em> per SOP, but are missing.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              4. Deterministic Risk Prioritization
            </div>
            <p className="text-slate-400 leading-relaxed">
              Calculates deterministic risk scores (0-100) and confidence percentages to queue high-priority findings for supervisor review.
            </p>
          </div>
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
            // keep the modal open or refresh it
            setSelectedFinding(null);
          }}
          onInspectInvestigation={onInspectInvestigation}
        />
      )}
    </div>
  );
};
