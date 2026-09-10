import React, { useState } from 'react';
import { Radar, AlertTriangle, Clock, EyeOff, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';
import { DetectionCoverageData } from '../types';

interface DetectionCoverageViewProps {
  data: DetectionCoverageData;
  selectedSoc: string;
  selectedPeriod?: string;
}

export const DetectionCoverageView: React.FC<DetectionCoverageViewProps> = ({
  data,
  selectedSoc,
  selectedPeriod = '90'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mitre' | 'outdated' | 'visibility'>('mitre');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Threat Surveillance Assurance
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {selectedSoc === 'ALL' ? 'Cross-SOC Rulebase' : `Target: ${selectedSoc}`} • Last {selectedPeriod} Days
          </span>
        </div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Radar className="w-4 h-4 text-sky-400" />
          Detection Coverage &amp; Rulebase Assurance
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
          Combines MITRE ATT&amp;CK operational evidence mapping, detection rule currency audits, and potential telemetry visibility/suppression gaps into a single assurance interface.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Total Rules Assessed</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {data.summary.total_rules}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Active detection logic deployed
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Potential Coverage Gaps</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-red-400">
            {data.summary.coverage_gaps_count}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Zero historical detection evidence
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Outdated Detection Rules</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {data.summary.outdated_rules_count}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Over 180 days without update
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Potential Visibility Gaps</span>
            <EyeOff className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">
            {data.summary.visibility_gaps_count}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Critical assets with 0 triggers
          </div>
        </div>
      </div>

      {/* Internal Sub-tabs: MITRE Evidence vs Outdated Rules vs Visibility Gaps */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('mitre')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'mitre'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            MITRE ATT&amp;CK Evidence Mapping ({data.mitre_coverage.length})
          </button>
          <button
            onClick={() => setActiveSubTab('outdated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'outdated'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Outdated Rules ({data.outdated_rules.length})
          </button>
          <button
            onClick={() => setActiveSubTab('visibility')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'visibility'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Potential Visibility / Suppression Gaps ({data.suppression_gaps.length})
          </button>
        </div>

        {/* 1. MITRE ATT&CK Mapping Table */}
        {activeSubTab === 'mitre' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Technique</th>
                  <th className="py-3 px-4">Name &amp; Tactic</th>
                  <th className="py-3 px-4 text-center">Detection Evidence</th>
                  <th className="py-3 px-4 text-center">Coverage Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4">Supervisory Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {data.mitre_coverage.map((t) => {
                  const isGap = t.status === 'Potential Coverage Gap';
                  const isLimited = t.status === 'Limited Evidence';

                  return (
                    <tr key={t.technique_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-400">
                        {t.technique_id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{t.technique_name}</div>
                        <div className="text-[10px] text-slate-500">{t.tactic}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isGap
                              ? 'text-red-400'
                              : isLimited
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {t.detection_evidence}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isGap
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : isLimited
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {t.last_updated}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] leading-relaxed max-w-xs">
                        {t.explanation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Outdated Rules Table */}
        {activeSubTab === 'outdated' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Rule Identifier</th>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Technique</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recommended Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {data.outdated_rules.map((rule) => (
                  <tr key={rule.rule_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {rule.rule_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {rule.rule_name}
                      <span className="text-[10px] text-slate-500 block font-normal">{rule.rule_type}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {rule.mapped_technique}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {rule.last_updated}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      {rule.age_days} days
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {rule.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {rule.recommended_action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Potential Visibility / Suppression Gaps */}
        {activeSubTab === 'visibility' && (
          <div className="p-4 space-y-3">
            <div className="bg-purple-950/20 border border-purple-800/40 rounded-lg p-3 text-xs text-purple-300 leading-relaxed">
              <strong>Supervisory Policy &amp; Cautious Evaluation:</strong> Flags assets of high business criticality exhibiting zero alert generation throughout the assessment window. These may represent undocumented suppression filters, telemetry forwarder failure, or intentional rule tuning.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.suppression_gaps.map((gap) => (
                <div
                  key={gap.gap_id}
                  className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-200">{gap.asset_name}</div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      {gap.criticality}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Type: <strong className="text-slate-300">{gap.asset_type}</strong> • {gap.business_impact}
                  </div>

                  <div className="p-2 bg-slate-900 rounded border border-slate-800/80 text-[11px] text-slate-300">
                    "{gap.observed_pattern}"
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    {gap.cautious_explanation}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-sky-400">
                    <strong>Recommended Review:</strong> {gap.recommended_review}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
