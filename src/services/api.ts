import {
  OverviewData,
  SOCSummary,
  SOCDetail,
  InvestigationAnalysis,
  KPIEvidenceData,
  SayDoData,
  DetectionCoverageData,
  Finding,
  SupervisoryQueueData,
  AssessmentPeriod,
  UserRole
} from '../types';

const BASE_URL = '/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    let errorMsg = '';
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message;
    } catch {
      errorMsg = await response.text();
    }
    throw new Error(errorMsg || `API Error [${response.status}] ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getOverview: (socId: string = 'ALL', period: AssessmentPeriod = '90'): Promise<OverviewData> => {
    return fetchJSON<OverviewData>(`/overview?soc_id=${encodeURIComponent(socId)}&period=${encodeURIComponent(period)}`);
  },

  getSocs: (period: AssessmentPeriod = '90'): Promise<SOCSummary[]> => {
    return fetchJSON<SOCSummary[]>(`/socs?period=${encodeURIComponent(period)}`);
  },

  getSocDetail: (socId: string, period: AssessmentPeriod = '90'): Promise<SOCDetail> => {
    return fetchJSON<SOCDetail>(`/socs/${encodeURIComponent(socId)}?period=${encodeURIComponent(period)}`);
  },

  getInvestigations: (
    socId: string = 'ALL',
    period: AssessmentPeriod = '90',
    severity: string = 'ALL',
    search: string = '',
    limit: number = 150
  ): Promise<InvestigationAnalysis> => {
    const params = new URLSearchParams({
      soc_id: socId,
      period,
      severity,
      search,
      limit: limit.toString()
    });
    return fetchJSON<InvestigationAnalysis>(`/investigations?${params.toString()}`);
  },

  getInvestigationDetail: (investigationId: string) => {
    return fetchJSON<{
      investigation: any;
      correlated_chain: any;
    }>(`/investigations/${encodeURIComponent(investigationId)}`);
  },

  getKpiEvidence: (socId: string = 'ALL', period: AssessmentPeriod = '90'): Promise<KPIEvidenceData> => {
    return fetchJSON<KPIEvidenceData>(`/kpi-evidence?soc_id=${encodeURIComponent(socId)}&period=${encodeURIComponent(period)}`);
  },

  getSayDoGaps: (socId: string = 'ALL', period: AssessmentPeriod = '90'): Promise<SayDoData> => {
    return fetchJSON<SayDoData>(`/say-do?soc_id=${encodeURIComponent(socId)}&period=${encodeURIComponent(period)}`);
  },

  getDetectionCoverage: (socId: string = 'ALL', period: AssessmentPeriod = '90'): Promise<DetectionCoverageData> => {
    return fetchJSON<DetectionCoverageData>(`/detection-coverage?soc_id=${encodeURIComponent(socId)}&period=${encodeURIComponent(period)}`);
  },

  getFindings: (
    socId: string = 'ALL',
    period: AssessmentPeriod = '90',
    severity: string = 'ALL',
    status: string = 'ALL'
  ): Promise<Finding[]> => {
    const params = new URLSearchParams({
      soc_id: socId,
      period,
      severity,
      status
    });
    return fetchJSON<Finding[]>(`/findings?${params.toString()}`);
  },

  getFindingDetail: (
    findingId: string,
    socId: string = 'ALL',
    period: AssessmentPeriod = '90'
  ): Promise<Finding> => {
    return fetchJSON<Finding>(`/findings/${encodeURIComponent(findingId)}?soc_id=${encodeURIComponent(socId)}&period=${encodeURIComponent(period)}`);
  },

  getSupervisoryQueue: (socId: string = 'ALL', period: AssessmentPeriod = '90'): Promise<SupervisoryQueueData> => {
    return fetchJSON<SupervisoryQueueData>(`/supervisory-queue?soc_id=${encodeURIComponent(socId)}&period=${encodeURIComponent(period)}`);
  },

  reviewFinding: (
    findingId: string,
    role: UserRole,
    reviewNotes: string,
    recommendation: string = ''
  ): Promise<{ status: string; message: string; finding: any }> => {
    return fetchJSON<{ status: string; message: string; finding: any }>(`/findings/${encodeURIComponent(findingId)}/review`, {
      method: 'POST',
      body: JSON.stringify({ role, review_notes: reviewNotes, recommendation })
    });
  },

  completeFinding: (
    findingId: string,
    role: UserRole,
    notes: string = ''
  ): Promise<{ status: string; message: string; finding: any }> => {
    return fetchJSON<{ status: string; message: string; finding: any }>(`/findings/${encodeURIComponent(findingId)}/complete`, {
      method: 'POST',
      body: JSON.stringify({ role, notes })
    });
  },

  reopenFinding: (
    findingId: string,
    role: UserRole,
    notes: string = ''
  ): Promise<{ status: string; message: string; finding: any }> => {
    return fetchJSON<{ status: string; message: string; finding: any }>(`/findings/${encodeURIComponent(findingId)}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ role, notes })
    });
  },

  regenerateDataset: (seed: number = 42): Promise<{ status: string; message: string }> => {
    return fetchJSON<{ status: string; message: string }>('/regenerate-dataset', {
      method: 'POST',
      body: JSON.stringify({ seed }),
    });
  },

  checkHealth: (): Promise<{ status: string; total_alerts: number }> => {
    return fetchJSON<{ status: string; total_alerts: number }>('/health');
  }
};
