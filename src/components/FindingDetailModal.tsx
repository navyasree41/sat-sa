import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Clock,
  FileText,
  AlertTriangle,
  ArrowRight,
  History,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Finding, UserRole } from '../types';
import { api } from '../services/api';

interface FindingDetailModalProps {
  finding: Finding | null;
  onClose: () => void;
  currentUserRole: UserRole;
  onFindingUpdated: () => void;
  onInspectInvestigation?: (investigationId: string) => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({
  finding,
  onClose,
  currentUserRole,
  onFindingUpdated,
  onInspectInvestigation
}) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!finding) return null;

  const isCompleted = finding.status === 'COMPLETED';
  const isUnderReview = finding.status === 'UNDER REVIEW';
  const isSeniorSupervisor = currentUserRole === 'NCIIPC Senior Supervisor';

  const handleStartReview = () => {
    setIsReviewing(true);
    setReviewNotes(finding.review_notes || '');
    setRecommendation(finding.recommendation_note || finding.recommendation || '');
    setErrorMessage(null);
  };

  const refreshAfterAction = () => {
    queueMicrotask(onFindingUpdated);
  };

  const handleSubmitReview = async () => {
    if (!reviewNotes.trim()) {
      setErrorMessage('Please provide supervisor review notes before submitting.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await api.reviewFinding(finding.finding_id, currentUserRole, reviewNotes, recommendation);
      setIsReviewing(false);
      refreshAfterAction();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmComplete = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await api.completeFinding(finding.finding_id, currentUserRole, completionNotes);
      setShowCompleteConfirm(false);
      refreshAfterAction();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete finding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopen = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await api.reopenFinding(finding.finding_id, currentUserRole, 'Reopened by Senior Supervisor for re-evaluation');
      refreshAfterAction();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reopen finding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#12151c] border border-slate-700/80 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between bg-slate-900/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-cyan-400 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                {finding.finding_id}
              </span>
              <span className="font-mono text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                {finding.soc_id}
              </span>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />
                  COMPLETED & LOCKED
                </span>
              ) : isUnderReview ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-300 bg-amber-950/70 border border-amber-800/80 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  UNDER REVIEW
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-blue-300 bg-blue-950/70 border border-blue-800/80 px-2.5 py-0.5 rounded-full">
                  <ShieldAlert className="w-3 h-3" />
                  OPEN
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {finding.finding_type}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 divide-y divide-slate-800/60">
          {/* Key Metrics Bar */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-0.5">Severity</span>
              <span className={`font-bold ${
                finding.severity === 'Critical' ? 'text-red-400' :
                finding.severity === 'High' ? 'text-orange-400' :
                finding.severity === 'Medium' ? 'text-amber-400' : 'text-blue-400'
              }`}>
                {finding.severity}
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-0.5">Risk Score</span>
              <span className="text-lg font-mono font-bold text-red-400">
                {finding.risk_score}<span className="text-xs text-slate-500">/100</span>
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-0.5">Confidence</span>
              <span className="text-lg font-mono font-bold text-cyan-400">
                {finding.confidence_pct}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block mb-0.5">Evidence Records</span>
              <span className="text-lg font-mono font-bold text-slate-200">
                {finding.evidence_count}
              </span>
            </div>
          </div>

          {/* Section 1: What Happened? */}
          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              What Happened?
            </h3>
            <p className="text-slate-200 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
              {finding.what_happened || finding.explanation}
            </p>
          </div>

          {/* Section 2: Why Was It Flagged? */}
          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              Why Was This Flagged?
            </h3>
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80 space-y-2">
              <p className="text-slate-200">{finding.why_flagged || finding.explanation}</p>
              {finding.confidence_factors && finding.confidence_factors.length > 0 && (
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-1">
                  {finding.confidence_factors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Section 3: Evidence & Correlated Records */}
          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Correlated Operational Evidence
            </h3>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Related Investigation</span>
                {finding.related_investigation ? (
                  <button
                    onClick={() => onInspectInvestigation && onInspectInvestigation(finding.related_investigation!)}
                    className="font-mono text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    {finding.related_investigation}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-slate-400 font-mono">Multiple sample cases</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Related Trigger Alert</span>
                <span className="font-mono text-slate-300 font-semibold">
                  {finding.related_alert || 'Correlated cross-alert telemetry'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block mb-0.5">Scope & Patterns</span>
                <span className="text-slate-300">{finding.related_records}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Why This Confidence? */}
          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Why This Confidence? ({finding.confidence_pct}%)
            </h3>
            <p className="text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80 text-xs leading-relaxed">
              {finding.why_confidence || 'Confidence is computed directly from empirical signal concordance across ticket timestamps, text similarity, and missing negative-space artifacts.'}
            </p>
          </div>

          {/* Section 5: Recommended Action */}
          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-cyan-400" />
              Recommended for Manual Review
            </h3>
            <p className="text-cyan-200 bg-cyan-950/30 p-3 rounded-lg border border-cyan-800/40 font-medium">
              {finding.recommendation}
            </p>
          </div>

          {/* Section 6: Audit History */}
          {finding.audit_history && finding.audit_history.length > 0 && (
            <div className="pt-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-400" />
                Audit Trail & State Transitions
              </h3>
              <div className="bg-slate-900/60 rounded-lg border border-slate-800 divide-y divide-slate-800/80 text-xs">
                {finding.audit_history.map((h, i) => (
                  <div key={i} className="p-2.5 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white">{h.role}</span>
                      <span className="text-slate-500 mx-1.5">•</span>
                      <span className="text-slate-400">{h.previous_status} → <span className="text-cyan-300 font-semibold">{h.new_status}</span></span>
                      <p className="text-slate-300 mt-1 italic">"{h.review_note}"</p>
                    </div>
                    <span className="font-mono text-slate-500 text-[11px] whitespace-nowrap ml-3">
                      {h.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: Examiner / Senior Supervisor Review Box */}
          <div className="pt-4 space-y-3">
            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            {isCompleted ? (
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Lock className="w-4 h-4" />
                  Completed findings are locked to preserve assessment integrity.
                </div>
                <p className="text-xs text-slate-400">
                  Approved by {finding.completed_by || 'NCIIPC Senior Supervisor'} at {finding.completed_at || 'Recorded'}.
                </p>
                {isSeniorSupervisor && (
                  <button
                    onClick={handleReopen}
                    disabled={isSubmitting}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/60 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reopen Finding (Senior Supervisor Override)
                  </button>
                )}
              </div>
            ) : isReviewing ? (
              <div className="bg-slate-900/90 border border-cyan-800/80 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Submit Review Notes (Role: {currentUserRole})
                </h4>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Supervisor Review Notes</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter evidence reviewed, corroborating ticket checks, or root-cause notes..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Recommended Remediation</label>
                  <input
                    type="text"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="e.g. Schedule coaching session, update SOAR playbook..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsReviewing(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transition"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review (Mark Under Review)'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-slate-900/70 border border-slate-800 rounded-lg">
                <div className="text-xs text-slate-400">
                  Current Status: <span className="font-semibold text-white">{finding.status}</span>
                  {finding.reviewed_by && (
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Last reviewed by {finding.reviewed_by} at {finding.reviewed_at}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartReview}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
                  >
                    {finding.status === 'UNDER REVIEW' ? 'Edit Review' : 'Start Review'}
                  </button>

                  {isSeniorSupervisor ? (
                    <button
                      onClick={() => setShowCompleteConfirm(true)}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Complete
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic px-2">
                      (NCIIPC Senior Supervisor role required to complete)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Complete Confirmation Modal */}
        {showCompleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#181c26] border border-amber-800/80 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Complete Finding?
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This action will mark the finding as reviewed and completed. The original evidence and assessment data will be locked to preserve historical supervisory integrity.
              </p>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Senior Supervisor Sign-off Note (Optional)</label>
                <input
                  type="text"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Remediation confirmed with shift lead."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCompleteConfirm(false)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmComplete}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-lg"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Locking...' : 'Confirm Completion'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
