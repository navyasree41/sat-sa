import React, { useState } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  Clock,
  Layers,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { InvestigationAnalysis, InvestigationRecord, AssessmentPeriod } from '../types';
import { api } from '../services/api';
import { InvestigationDetailModal } from '../components/InvestigationDetailModal';

interface InvestigationIntegrityViewProps {
  data: InvestigationAnalysis;
  selectedSoc: string;
  selectedPeriod: AssessmentPeriod;
  onFilterChange?: (severity: string, search: string) => void;
}

export const InvestigationIntegrityView: React.FC<InvestigationIntegrityViewProps> = ({
  data,
  selectedSoc,
  selectedPeriod,
  onFilterChange
}) => {
  const [selectedInv, setSelectedInv] = useState<InvestigationRecord | null>(null);
  const [correlatedChain, setCorrelatedChain] = useState<any>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleOpenAudit = async (record: InvestigationRecord) => {
    setSelectedInv(record);
    try {
      const res = await api.getInvestigationDetail(record.investigation_id);
      setCorrelatedChain(res.correlated_chain);
    } catch (err) {
      console.error('Failed to load correlation chain:', err);
    }
  };

  const handleSeverityChange = (newSev: string) => {
    setFilterSeverity(newSev);
    if (onFilterChange) {
      onFilterChange(newSev, searchQuery);
    }
  };

  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    if (onFilterChange) {
      onFilterChange(filterSeverity, newQuery);
    }
  };

  const filteredList = data.flagged_investigations.filter((inv) => {
    if (filterSeverity !== 'ALL' && inv.severity !== filterSeverity) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        inv.investigation_id.toLowerCase().includes(q) ||
        inv.alert_id.toLowerCase().includes(q) ||
        inv.soc_id.toLowerCase().includes(q) ||
        (inv.analyst_id && inv.analyst_id.toLowerCase().includes(q)) ||
        (inv.notes_snippet && inv.notes_snippet.toLowerCase().includes(q)) ||
        (inv.why_flagged && inv.why_flagged.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const severityCounts = data.severity_counts || {
    ALL: data.flagged_investigations.length,
    Critical: data.flagged_investigations.filter(i => i.severity === 'Critical').length,
    High: data.flagged_investigations.filter(i => i.severity === 'High').length,
    Medium: data.flagged_investigations.filter(i => i.severity === 'Medium').length,
    Low: data.flagged_investigations.filter(i => i.severity === 'Low').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Multi-Signal Investigation Integrity Audit
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {selectedSoc === 'ALL' ? 'All Operations' : `Target: ${selectedSoc}`} • Period: Last {selectedPeriod} Days
          </span>
        </div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-cyan-400" />
          Investigation Integrity Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
          Uses multi-signal correlation (textual template similarity &ge; 88%, rapid closure durations under 3 minutes, low evidence volume &le; 1, and shallow closure disclaimers) to verify operational integrity.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Investigations Analyzed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Investigations Analyzed</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {data.summary.analyzed_count.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800">
            Tickets analyzed in Last {selectedPeriod} Days
          </div>
        </div>

        {/* Card 2: Potential Integrity Concerns */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Potential Integrity Concerns</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {data.summary.potential_concerns}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Multi-signal flagged cases
          </div>
        </div>

        {/* Card 3: High-Risk Investigations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>High-Risk Investigations</span>
            <Clock className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-red-400">
            {data.summary.high_risk_count}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            High/Critical alerts closed in &lt;3 min
          </div>
        </div>

        {/* Card 4: Evidence-Supported Investigations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
            <span>Evidence-Supported</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {data.summary.evidence_supported_count.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Backed by corroborating artifacts
          </div>
        </div>
      </div>

      {/* Flagged Table with Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Flagged Cases Requiring Review
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {filteredList.length} Flagged
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Severity Filter Dropdown with Counts (Requirement 7 & 20) */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="investigation-severity-filter"
                value={filterSeverity}
                onChange={(e) => handleSeverityChange(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Severities ({severityCounts.ALL})</option>
                <option value="Critical">Critical Only ({severityCounts.Critical})</option>
                <option value="High">High Only ({severityCounts.High})</option>
                <option value="Medium">Medium Only ({severityCounts.Medium})</option>
                <option value="Low">Low Only ({severityCounts.Low})</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="investigation-search-input"
                type="text"
                placeholder="Filter by ID, notes, analyst..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Investigation ID</th>
                <th className="py-3 px-4">SOC / Analyst</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Evidence Count</th>
                <th className="py-3 px-4">Note Similarity</th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4 text-center">Confidence</th>
                <th className="py-3 px-4 text-right">Supervisory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No flagged investigations match the current filter criteria for {selectedSoc} in the last {selectedPeriod} days.
                  </td>
                </tr>
              ) : (
                filteredList.map((inv) => {
                  const isHighSim = inv.similarity_pct >= 88.0;
                  const isVeryFast = inv.duration_min < 3.0;

                  return (
                    <tr key={inv.investigation_id} className="hover:bg-slate-800/40 transition-colors">
                      {/* ID & Alert */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-cyan-400">{inv.investigation_id}</div>
                        <div className="text-[10px] text-slate-500">Alert: {inv.alert_id}</div>
                      </td>

                      {/* SOC */}
                      <td className="py-3 px-4 font-sans">
                        <span className="text-slate-200 font-medium">{inv.soc_id}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">{inv.analyst_id}</span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-sans">
                        <span className={isVeryFast ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {inv.duration_min} min
                        </span>
                      </td>

                      {/* Evidence Count */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          inv.evidence_count === 0
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : inv.evidence_count === 1
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {inv.evidence_count} rec ({inv.artifacts_collected || 0} art)
                        </span>
                      </td>

                      {/* Similarity */}
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold font-mono ${isHighSim ? 'text-amber-400' : 'text-slate-400'}`}>
                            {inv.similarity_pct}%
                          </span>
                          {isHighSim && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium border border-amber-500/20">
                              Template Match
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.severity === 'Critical' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                          inv.severity === 'High' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' :
                          inv.severity === 'Medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}>
                          {inv.severity}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-cyan-400">{inv.confidence_pct}%</span>
                      </td>

                      {/* Supervisory Action */}
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => handleOpenAudit(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500 text-xs font-medium transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Audit Why
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Modal */}
      {selectedInv && (
        <InvestigationDetailModal
          investigation={selectedInv}
          correlatedChain={correlatedChain}
          onClose={() => {
            setSelectedInv(null);
            setCorrelatedChain(null);
          }}
        />
      )}
    </div>
  );
};
