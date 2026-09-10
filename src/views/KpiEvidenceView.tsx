import React from 'react';
import { Scale, AlertCircle, CheckCircle2, TrendingDown, ArrowRight, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { KPIEvidenceData, KPIMetric } from '../types';

interface KpiEvidenceViewProps {
  data: KPIEvidenceData;
  selectedSoc: string;
  selectedPeriod?: string;
}

export const KpiEvidenceView: React.FC<KpiEvidenceViewProps> = ({ data, selectedSoc, selectedPeriod = '90' }) => {
  // Extract metrics list based on whether scoped to single SOC or ALL
  const metrics: KPIMetric[] = data.metrics || data.aggregate_metrics || [];

  // Chart data formatting
  const chartData = metrics.map((m) => ({
    name: m.metric_name,
    Reported: m.reported,
    'Evidence-Supported': m.evidence_supported,
    unit: m.unit,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Assurance Audit
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {selectedSoc === 'ALL' ? 'Organization-Wide Aggregate' : `Target: ${selectedSoc}`} • Last {selectedPeriod} Days
          </span>
        </div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Scale className="w-4 h-4 text-sky-400" />
          KPI vs Operational Evidence Verification
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
          Answers the central supervisory question: <em>Is the SOC performing as well as it reports?</em> Compares self-reported management metrics against empirical operational evidence reconstructed from telemetry.
        </p>
      </div>

      {/* Main Narrative Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-semibold text-slate-200 mb-0.5">
            Supervisory Observation &amp; Evidence Finding
          </div>
          <p className="text-slate-400 leading-relaxed">
            {data.summary_explanation ||
              'The reported KPI is higher than the level supported by available operational evidence.'}
          </p>
        </div>
      </div>

      {/* Side-by-Side 4 Core Metric Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const hasSignificantGap = m.gap >= 5.0;
          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-200">{m.metric_name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hasSignificantGap
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    Gap: {m.gap > 0 ? `+${m.gap}` : m.gap} {m.unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                      Reported KPI
                    </span>
                    <span className="text-xl font-extrabold text-slate-200">
                      {m.reported}
                      <span className="text-xs text-slate-500 font-normal ml-0.5">{m.unit}</span>
                    </span>
                  </div>

                  <div className="border-l border-slate-800 pl-2">
                    <span className="text-[10px] text-sky-400 font-semibold block uppercase">
                      Actual Evidence
                    </span>
                    <span className="text-xl font-extrabold text-sky-300">
                      {m.evidence_supported}
                      <span className="text-xs text-sky-500 font-normal ml-0.5">{m.unit}</span>
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {m.explanation ||
                    (hasSignificantGap
                      ? 'The reported KPI is higher than the level supported by available operational evidence.'
                      : 'Observed operational records are consistent with reported figures.')}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-500">
                <span>Direction:</span>
                <span className={hasSignificantGap ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                  {m.direction || (hasSignificantGap ? 'Discrepant' : 'Aligned')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Chart Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Optical KPI Gap Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side comparison of self-reported claims vs empirically observed operational records
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-500"></div>
              <span className="text-slate-300">Reported Claims</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-sky-500"></div>
              <span className="text-sky-300">Operational Evidence</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Bar dataKey="Reported" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Evidence-Supported" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown by SOC Table (when viewing ALL) */}
      {data.by_soc && data.by_soc.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Cross-SOC KPI Discrepancy Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">SOC</th>
                  <th className="py-3 px-4">Closure Gap</th>
                  <th className="py-3 px-4">Response Time Gap</th>
                  <th className="py-3 px-4">Escalation Gap</th>
                  <th className="py-3 px-4">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {data.by_soc.map((soc) => {
                  const closureMetric = soc.metrics.find((m) => m.metric_name === 'Closure Rate');
                  const respMetric = soc.metrics.find((m) => m.metric_name === 'Response Time');
                  const escMetric = soc.metrics.find((m) => m.metric_name === 'Escalation Rate');

                  return (
                    <tr key={soc.soc_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {soc.soc_id}
                      </td>
                      <td className="py-3 px-4">
                        {closureMetric && (
                          <div className="text-slate-300">
                            {closureMetric.reported}% rep vs <strong className="text-sky-400">{closureMetric.evidence_supported}%</strong> ev ({closureMetric.gap} pts gap)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {respMetric && (
                          <div className="text-slate-300">
                            {respMetric.reported}m rep vs <strong className="text-sky-400">{respMetric.evidence_supported}m</strong> ev ({respMetric.gap > 0 ? `+${respMetric.gap}m slower` : 'aligned'})
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {escMetric && (
                          <div className="text-slate-300">
                            {escMetric.reported}% rep vs <strong className="text-sky-400">{escMetric.evidence_supported}%</strong> ev
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            soc.gap_status === 'Significant Variance'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : soc.gap_status === 'Moderate Variance'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {soc.gap_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
