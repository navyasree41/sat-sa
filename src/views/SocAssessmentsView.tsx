import React, { useState } from 'react';
import { Shield, ChevronRight, Eye } from 'lucide-react';
import { SOCSummary, SOCDetail, AssessmentPeriod } from '../types';
import { api } from '../services/api';
import { LoadingState } from '../components/LoadingAndError';
import { SocDetailModal } from '../components/SocDetailModal';

interface SocAssessmentsViewProps {
  socList: SOCSummary[];
  selectedPeriod: AssessmentPeriod;
  onSelectSocScope: (socId: string) => void;
}

export const SocAssessmentsView: React.FC<SocAssessmentsViewProps> = ({
  socList,
  selectedPeriod,
  onSelectSocScope
}) => {
  const [selectedSocDetail, setSelectedSocDetail] = useState<SOCDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const handleInspectSoc = async (socId: string) => {
    setIsLoadingDetail(true);
    try {
      const detail = await api.getSocDetail(socId, selectedPeriod);
      setSelectedSocDetail(detail);
    } catch (err) {
      console.error('Error fetching SOC detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (score >= 68) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-red-500/10 text-red-400 border-red-500/30';
  };

  const getPriorityBadge = (priority: string) => {
    if (priority.toLowerCase().includes('healthy')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (priority.toLowerCase().includes('audit') || priority.toLowerCase().includes('coverage')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-red-500/10 text-red-400 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            SOC Operational Assessments
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative evaluation of all assessed Security Operations Centers backed by operational evidence for the Last {selectedPeriod} Days.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          Evaluated Centers: <strong className="text-slate-200">{socList.length} Units</strong>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">SOC Identifier</th>
                <th className="py-3.5 px-4 text-center">Assurance Score</th>
                <th className="py-3.5 px-4">Evidence Quality</th>
                <th className="py-3.5 px-4">Investigation Quality</th>
                <th className="py-3.5 px-4">Escalation Quality</th>
                <th className="py-3.5 px-4 text-center">Supervisory Priority</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {socList.map((soc) => (
                <tr
                  key={soc.soc_id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  {/* SOC */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{soc.soc_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {soc.soc_id} &bull; {soc.analyst_count} Analysts &bull; {soc.alert_count.toLocaleString()} Alerts
                    </div>
                  </td>

                  {/* Assurance Score */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getScoreBadge(
                        soc.assurance_score
                      )}`}
                    >
                      {soc.assurance_score}/100
                    </span>
                  </td>

                  {/* Evidence Quality */}
                  <td className="py-3.5 px-4">
                    <span className="text-slate-200 font-medium">{soc.evidence_quality}</span>
                  </td>

                  {/* Investigation Quality */}
                  <td className="py-3.5 px-4">
                    <span className="text-slate-200 font-medium">{soc.investigation_quality}</span>
                  </td>

                  {/* Escalation Quality */}
                  <td className="py-3.5 px-4">
                    <span className="text-slate-200 font-medium">{soc.escalation_quality}</span>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getPriorityBadge(
                        soc.priority
                      )}`}
                    >
                      {soc.priority}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleInspectSoc(soc.soc_id)}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => onSelectSocScope(soc.soc_id)}
                        className="px-2.5 py-1 rounded-md bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-medium border border-cyan-500/30 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Scope</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSocDetail && (
        <SocDetailModal
          detail={selectedSocDetail}
          onClose={() => setSelectedSocDetail(null)}
          onScopeToSoc={(id) => {
            onSelectSocScope(id);
            setSelectedSocDetail(null);
          }}
        />
      )}

      {isLoadingDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingState message="Fetching operational records for selected SOC..." />
        </div>
      )}
    </div>
  );
};
