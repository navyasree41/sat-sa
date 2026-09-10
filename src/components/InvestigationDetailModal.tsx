import React from 'react';
import { X, FileText, Clock, Hash, ShieldAlert, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { InvestigationRecord } from '../types';

interface InvestigationDetailModalProps {
  investigation: InvestigationRecord;
  correlatedChain?: any;
  onClose: () => void;
}

export const InvestigationDetailModal: React.FC<InvestigationDetailModalProps> = ({
  investigation,
  correlatedChain,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded">
                {investigation.investigation_id}
              </span>
              <span className="text-xs text-slate-400">
                Alert: <strong className="font-mono text-slate-300">{investigation.alert_id}</strong> • SOC: {investigation.soc_id}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Investigation Integrity Audit &amp; Correlated Event Trace
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* "WHY WAS THIS FLAGGED?" Banner */}
          <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                Why Was This Flagged for Supervisory Review?
              </h4>
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {investigation.why_flagged}
            </p>
            <div className="mt-3 pt-2.5 border-t border-amber-900/40 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
              <span>Duration: <strong className="text-slate-200">{investigation.duration_min} min</strong></span>
              <span>Evidence Records: <strong className="text-slate-200">{investigation.evidence_count}</strong></span>
              <span>Artifacts Archived: <strong className="text-slate-200">{investigation.artifacts_collected}</strong></span>
              <span>Note Similarity: <strong className="text-amber-300">{investigation.similarity_pct}%</strong></span>
              <span>Confidence: <strong className="text-slate-200">{investigation.confidence_pct}%</strong></span>
            </div>
          </div>

          {/* Investigation Notes Snippet */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Recorded Analyst Investigation Notes
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Analyst ID: {investigation.analyst_id}
              </span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed">
              "{investigation.notes_snippet}"
            </div>
          </div>

          {/* Correlated Event Trace */}
          {correlatedChain && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Correlated Event Chain (Alert &rarr; Investigation &rarr; Evidence &rarr; Escalation)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  Strength: {correlatedChain.evidence_strength}
                </span>
              </div>

              {/* Alert & Asset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Originating Alert</div>
                  <div className="text-slate-200 font-semibold mt-0.5">{correlatedChain.alert?.alert_type || 'Unknown Rule'}</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    Severity: <strong className="text-slate-200">{correlatedChain.alert?.severity}</strong> • Status: {correlatedChain.alert?.status}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Affected Asset</div>
                  <div className="text-slate-200 font-semibold mt-0.5">{correlatedChain.asset?.asset_name || correlatedChain.alert?.asset_id}</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    Criticality: <strong className="text-slate-200">{correlatedChain.asset?.criticality}</strong> • {correlatedChain.asset?.business_impact}
                  </div>
                </div>
              </div>

              {/* Attached Evidence Records */}
              <div>
                <div className="text-slate-400 text-[11px] font-semibold mb-2">
                  Verified Operational Evidence Records ({correlatedChain.evidence_records?.length || 0})
                </div>
                {correlatedChain.evidence_records && correlatedChain.evidence_records.length > 0 ? (
                  <div className="space-y-1.5">
                    {correlatedChain.evidence_records.map((ev: any, i: number) => (
                      <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800/80 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-slate-200 font-medium text-[11px]">{ev.evidence_type}</div>
                          <div className="text-slate-500 text-[10px]">{ev.source} • {ev.created_at}</div>
                        </div>
                        <div className="text-right font-mono text-[10px] text-slate-400">
                          Hash: {ev.hash}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded text-red-300 text-[11px]">
                    No supporting operational evidence records were captured in the evidence repository for this case.
                  </div>
                )}
              </div>

              {/* Escalation Trace */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <div className="text-slate-500 text-[10px] uppercase font-bold">CSIRT Escalation Record</div>
                {correlatedChain.escalation ? (
                  <div className="text-slate-200 mt-0.5">
                    Incident ID: <strong className="font-mono text-sky-400">{correlatedChain.escalation.incident_id}</strong> • Target: {correlatedChain.escalation.escalation_target} • Status: <span className="font-medium text-amber-300">{correlatedChain.escalation.status}</span>
                  </div>
                ) : (
                  <div className="text-slate-400 mt-0.5 italic">
                    No escalation record exists in operational logs.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Human-in-the-loop notice */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-slate-300">Human Supervisory Principle:</strong> SAT-SA flags anomalous patterns based strictly on operational records. Flagging does not imply intentional misconduct; review source case notes before taking administrative action.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Audit Card
          </button>
        </div>
      </div>
    </div>
  );
};
