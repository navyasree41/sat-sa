import React from 'react';
import { X, ShieldCheck, FileCheck2, Scale, Radar, AlertTriangle, ArrowRight } from 'lucide-react';
import { SOCDetail } from '../types';

interface SocDetailModalProps {
  detail: SOCDetail;
  onClose: () => void;
  onScopeToSoc: (socId: string) => void;
}

export const SocDetailModal: React.FC<SocDetailModalProps> = ({ detail, onClose, onScopeToSoc }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono">
                {detail.soc_id}
              </span>
              <span className="text-xs text-slate-400">
                {detail.analyst_count} Assigned Analysts • {detail.assessment_period}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {detail.soc_name} — Assurance Profile
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onScopeToSoc(detail.soc_id)}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Filter Workspace to this SOC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Overall Assurance
              </span>
              <div className="text-2xl font-extrabold text-white">
                {detail.overall_assurance_score} <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Evidence Coverage
              </span>
              <div className="text-2xl font-extrabold text-sky-400">
                {detail.evidence_coverage.evidence_coverage_pct}%
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Avg Note Similarity
              </span>
              <div className="text-2xl font-extrabold text-amber-400">
                {detail.investigation_integrity.average_similarity_pct}%
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Detection Coverage
              </span>
              <div className="text-2xl font-extrabold text-emerald-400">
                {detail.detection_coverage.total_rules} <span className="text-xs text-slate-500">rules</span>
              </div>
            </div>
          </div>

          {/* KPI Alignment Discrepancy Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-3.5 h-3.5 text-sky-400" />
                Reported KPIs vs Evidence-Supported Actuals
              </h4>
              <span className="text-xs font-medium text-slate-400">
                Status: <strong className="text-slate-200">{detail.kpi_alignment.gap_status}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {detail.kpi_alignment.metrics.map((m, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <div className="text-slate-400 font-medium mb-1">{m.metric_name}</div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Reported</span>
                      <strong className="text-slate-200">{m.reported}{m.unit}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Evidence</span>
                      <strong className="text-sky-300">{m.evidence_supported}{m.unit}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Gap</span>
                      <strong className={m.gap >= 5 ? 'text-amber-400' : 'text-slate-400'}>
                        {m.gap > 0 ? `+${m.gap}` : m.gap}{m.unit}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-3 italic">
              {detail.kpi_alignment.summary_explanation}
            </p>
          </div>

          {/* Main Supervisory Findings for this SOC */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Prioritized Supervisory Findings ({detail.main_findings.length})
            </h4>

            <div className="space-y-2.5">
              {detail.main_findings.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500">{f.finding_id}</span>
                      <strong className="text-slate-100">{f.finding_type}</strong>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          f.severity === 'Critical'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed max-w-2xl">{f.explanation}</p>
                    <p className="text-sky-400 text-[11px]">
                      <strong>Recommendation:</strong> {f.recommendation}
                    </p>
                  </div>

                  <div className="shrink-0 text-right md:pl-4 md:border-l md:border-slate-800">
                    <div className="text-[10px] text-slate-400">Risk Score</div>
                    <div className="text-lg font-extrabold text-amber-400">{f.risk_score}/100</div>
                    <div className="text-[10px] text-slate-500">Conf: {f.confidence_pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>All values derived dynamically from Python Flask operational records.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
