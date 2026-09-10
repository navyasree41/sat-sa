import React from 'react';
import { GitCompare, AlertTriangle, ArrowDown, Clock, ShieldX, HelpCircle, CheckCircle2 } from 'lucide-react';
import { SayDoData } from '../types';

interface SayDoGapViewProps {
  data: SayDoData;
  selectedSoc: string;
  selectedPeriod?: string;
}

export const SayDoGapView: React.FC<SayDoGapViewProps> = ({ data, selectedSoc, selectedPeriod = '90' }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Negative-Space Intelligence
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {selectedSoc === 'ALL' ? 'Cross-SOC Procedures' : `Target: ${selectedSoc}`} • Last {selectedPeriod} Days
          </span>
        </div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-sky-400" />
          Say–Do Procedural Gap Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
          Compares expected SOC operating procedures against empirical operational reality. Pinpoints negative-space gaps: <em>what should have happened per policy, but did not?</em>
        </p>
      </div>

      {/* 3 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Potential Missed Escalations</span>
            <ShieldX className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-red-400">
            {data.summary.potential_missed_escalations}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Critical alerts closed with 0 CSIRT tickets
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Procedure SLA Delays</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {data.summary.procedure_delays}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Escalations exceeding 15-minute threshold
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Missing Evidence Procedures</span>
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-sky-400">
            {data.summary.missing_evidence_procedures}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Critical cases closed with zero artifacts
          </div>
        </div>
      </div>

      {/* Negative-Space Pipeline Concept */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Negative-Space Analytical Framework
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 w-full text-center">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
              1. EXPECTED
            </span>
            <span className="text-slate-200 font-medium mt-0.5 block">
              Policy &amp; SLA Requirements
            </span>
          </div>
          <ArrowDown className="w-4 h-4 text-slate-500 sm:-rotate-90 shrink-0" />
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 w-full text-center">
            <span className="font-bold text-sky-400 uppercase tracking-wider text-[10px] block">
              2. OBSERVED
            </span>
            <span className="text-slate-200 font-medium mt-0.5 block">
              Operational Event Records
            </span>
          </div>
          <ArrowDown className="w-4 h-4 text-slate-500 sm:-rotate-90 shrink-0" />
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 w-full text-center">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block">
              3. GAP (Action Missing)
            </span>
            <span className="text-amber-200 font-medium mt-0.5 block">
              Supervisory Review Trigger
            </span>
          </div>
        </div>
      </div>

      {/* Gaps List / Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Identified Procedure Deviations &amp; Missing Actions ({data.gaps.length})
          </h3>
          <span className="text-xs text-slate-400">
            Evaluated against standard SOC operational SLAs
          </span>
        </div>

        <div className="space-y-3">
          {data.gaps.map((gap) => {
            const isMissed = gap.status === 'Potential Missed Escalation';

            return (
              <div
                key={gap.gap_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 text-xs"
              >
                {/* Header line */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">{gap.gap_id}</span>
                    <span className="font-semibold text-slate-200">{gap.procedure_category}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-slate-400">{gap.soc_id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-slate-400">Alert: {gap.alert_id}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isMissed
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {gap.status}
                  </span>
                </div>

                {/* Expected vs Observed vs Gap Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  {/* Expected */}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                      Expected Action (Procedure)
                    </span>
                    <p className="text-slate-300 font-medium leading-relaxed">
                      {gap.expected_action}
                    </p>
                  </div>

                  {/* Observed */}
                  <div className="md:border-l md:border-slate-800 md:pl-3">
                    <span className="text-[10px] text-sky-400 uppercase font-bold block mb-1">
                      Observed Action (Evidence)
                    </span>
                    <p className="text-sky-200 font-medium leading-relaxed">
                      {gap.observed_action}
                    </p>
                  </div>

                  {/* Gap Difference */}
                  <div className="md:border-l md:border-slate-800 md:pl-3">
                    <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
                      Difference / Gap
                    </span>
                    <p className="text-amber-200 font-medium leading-relaxed">
                      {gap.gap_difference}
                    </p>
                  </div>
                </div>

                {/* Footer line */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
                  <div className="text-slate-400">
                    Business Impact: <strong className="text-slate-200">{gap.impact}</strong>
                  </div>
                  <div className="text-sky-400 font-medium">
                    Recommendation: <span className="text-slate-300">{gap.recommendation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
