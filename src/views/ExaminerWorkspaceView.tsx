import React from 'react';
import { AlertTriangle, ArrowRight, Eye, FileCheck2, ShieldCheck } from 'lucide-react';
import { InvestigationAnalysis, OverviewData, AssessmentPeriod } from '../types';
import { NavTab } from '../components/Sidebar';

interface ExaminerWorkspaceViewProps {
  overviewData: OverviewData;
  investigationData: InvestigationAnalysis;
  selectedSoc: string;
  selectedPeriod: AssessmentPeriod;
  onNavigateTab: (tab: NavTab) => void;
}

export const ExaminerWorkspaceView: React.FC<ExaminerWorkspaceViewProps> = ({
  overviewData,
  investigationData,
  selectedSoc,
  selectedPeriod,
  onNavigateTab
}) => {
  const metrics = [
    { label: 'Cases Requiring Examination', value: investigationData.summary.potential_concerns, detail: 'Multi-signal concerns', color: 'text-amber-400', icon: AlertTriangle },
    { label: 'Evidence Coverage', value: `${overviewData.evidence_coverage_pct}%`, detail: `${overviewData.total_evidence_records.toLocaleString()} evidence records`, color: 'text-cyan-400', icon: FileCheck2 },
    { label: 'KPI Alignment', value: `${overviewData.kpi_alignment_pct}%`, detail: 'Claim consistency', color: 'text-emerald-400', icon: ShieldCheck },
    { label: 'High-Risk Cases', value: investigationData.summary.high_risk_count, detail: 'Require detailed review', color: 'text-red-400', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              NCIIPC Examiner Workspace
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {selectedSoc === 'ALL' ? 'Cross-CSE assessment' : `Target: ${selectedSoc}`} • Last {selectedPeriod} Days
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Detailed Supervisory Assessment</h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
            Examine CSE SOC records, evidence quality, investigation integrity, and procedural gaps without changing source operational records.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('investigation_integrity')}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
        >
          <span>Open Case Examination</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, detail, color, icon: Icon }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium uppercase tracking-wider">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">{detail}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Findings Requiring Examination</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Risk-ranked records selected for deeper supervisory assessment.</p>
          </div>
          <button
            onClick={() => onNavigateTab('soc_assessments')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Compare CSEs</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Case</th>
                <th className="py-3 px-4">CSE SOC</th>
                <th className="py-3 px-4">Assessment Signal</th>
                <th className="py-3 px-4 text-center">Risk</th>
                <th className="py-3 px-4 text-center">Confidence</th>
                <th className="py-3 px-4 text-right">Examine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {overviewData.priority_findings.map((finding) => (
                <tr key={finding.finding_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{finding.finding_id}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{finding.soc_id}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-200 block">{finding.finding_type}</span>
                    <span className="text-[10px] text-slate-400 block max-w-xl truncate">{finding.explanation}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${finding.severity === 'Critical' ? 'text-red-400' : finding.severity === 'High' ? 'text-orange-400' : 'text-amber-400'}`}>
                      {finding.risk_score}/100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-cyan-400">{finding.confidence_pct}%</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateTab('investigation_integrity')}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 text-xs font-semibold transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review Records
                    </button>
                  </td>
                </tr>
              ))}
              {overviewData.priority_findings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No findings require examination for this scope.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => onNavigateTab('kpi_evidence')} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left hover:border-slate-600 transition-colors cursor-pointer">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">KPI vs Evidence</div>
          <p className="text-xs text-slate-400 mt-2">Validate CSE-reported performance against operational records.</p>
        </button>
        <button onClick={() => onNavigateTab('say_do')} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left hover:border-slate-600 transition-colors cursor-pointer">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Say-Do Gaps</div>
          <p className="text-xs text-slate-400 mt-2">Examine missing actions, delays, and procedural deviations.</p>
        </button>
        <button onClick={() => onNavigateTab('detection_coverage')} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left hover:border-slate-600 transition-colors cursor-pointer">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Detection Coverage</div>
          <p className="text-xs text-slate-400 mt-2">Review blind spots, outdated rules, and telemetry visibility gaps.</p>
        </button>
      </div>
    </div>
  );
};
