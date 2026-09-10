export type UserRole = "NCIIPC Examiner" | "NCIIPC Senior Supervisor";
export type AssessmentPeriod = "7" | "30" | "90";
export type FindingStatus = "OPEN" | "UNDER REVIEW" | "COMPLETED";

export interface AuditHistoryItem {
  previous_status: string;
  new_status: string;
  role: string;
  timestamp: string;
  review_note: string;
}

export interface Finding {
  finding_id: string;
  priority_rank: number;
  finding_type: string;
  soc_id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  risk_score: number;
  confidence_pct: number;
  confidence_factors?: string[];
  impact: string;
  evidence_count: number;
  related_records: string;
  related_investigation?: string;
  related_alert?: string;
  explanation: string;
  what_happened?: string;
  why_flagged?: string;
  why_confidence?: string;
  recommendation: string;
  status: FindingStatus;
  review_notes?: string;
  recommendation_note?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  completed_by?: string | null;
  completed_at?: string | null;
  completion_notes?: string;
  audit_history?: AuditHistoryItem[];
}

export interface AttentionCard {
  category: string;
  soc_id: string;
  soc_name: string;
  title: string;
  stat: string;
  confidence_pct: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  risk_score: number;
  badge: string;
  explanation: string;
  finding_id?: string;
  status?: FindingStatus;
}

export interface OverviewData {
  assessment_period: string;
  period_days: number;
  soc_id: string;
  overall_assurance_score: number;
  evidence_coverage_pct: number;
  kpi_alignment_pct: number;
  priority_findings_count: number;
  completed_findings_count?: number;
  high_critical_impact_count: number;
  total_alerts_analyzed: number;
  total_investigations_analyzed: number;
  total_evidence_records: number;
  what_needs_attention: AttentionCard[];
  priority_findings: Finding[];
  evidence_breakdown: {
    strong: number;
    moderate: number;
    weak_or_none: number;
  };
}

export interface SOCSummary {
  soc_id: string;
  soc_name: string;
  analyst_count: number;
  assessment_period: string;
  assurance_score: number;
  evidence_quality: string;
  investigation_quality: string;
  escalation_quality: string;
  priority: string;
  badge_color: string;
  alert_count: number;
  investigation_count?: number;
}

export interface SOCDetail {
  soc_id: string;
  soc_name: string;
  analyst_count: number;
  assessment_period: string;
  overall_assurance_score: number;
  evidence_coverage: {
    total_investigations: number;
    evidence_coverage_pct: number;
    supported_investigations: number;
    strength_breakdown: {
      strong: number;
      moderate: number;
      weak_or_none: number;
    };
    evidence_types: Record<string, number>;
    evidence_sources: Record<string, number>;
  };
  kpi_alignment: {
    soc_id: string;
    gap_status: string;
    metrics: KPIMetric[];
    summary_explanation: string;
  };
  investigation_integrity: {
    analyzed_count: number;
    potential_concerns: number;
    high_risk_count: number;
    evidence_supported_count: number;
    average_similarity_pct: number;
  };
  detection_coverage: {
    total_rules: number;
    outdated_rules_count: number;
    coverage_gaps_count: number;
    limited_coverage_count: number;
    visibility_gaps_count: number;
  };
  main_findings: Finding[];
}

export interface InvestigationRecord {
  investigation_id: string;
  alert_id: string;
  soc_id: string;
  analyst_id: string;
  duration_min: number;
  evidence_count: number;
  artifacts_collected: number;
  similarity_pct: number;
  status: string;
  confidence_pct: number;
  confidence_factors?: string[];
  severity: string;
  started_at: string;
  closed_at: string;
  closure_reason?: string;
  notes_snippet: string;
  why_flagged: string;
  why_confidence?: string;
}

export interface InvestigationAnalysis {
  summary: {
    analyzed_count: number;
    potential_concerns: number;
    high_risk_count: number;
    evidence_supported_count: number;
    average_similarity_pct: number;
  };
  severity_counts: {
    ALL: number;
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
  flagged_investigations: InvestigationRecord[];
  total_flagged_matching_filters?: number;
  period_days?: number;
  soc_id?: string;
}

export interface KPIMetric {
  metric_name: string;
  reported: number;
  evidence_supported: number;
  gap: number;
  unit: string;
  direction?: string;
  explanation?: string;
}

export interface KPIEvidenceData {
  soc_id: string;
  period_days?: number;
  aggregate_metrics?: KPIMetric[];
  metrics?: KPIMetric[];
  gap_status?: string;
  summary_explanation: string;
  by_soc?: Array<{
    soc_id: string;
    gap_status: string;
    metrics: KPIMetric[];
    summary_explanation: string;
  }>;
}

export interface SayDoGap {
  gap_id: string;
  soc_id: string;
  alert_id: string;
  procedure_category: string;
  expected_action: string;
  observed_action: string;
  gap_difference: string;
  impact: string;
  status: string;
  confidence_pct: number;
  timestamp: string;
  recommendation: string;
}

export interface SayDoData {
  period_days?: number;
  summary: {
    total_gaps_identified: number;
    potential_missed_escalations: number;
    procedure_delays: number;
    missing_evidence_procedures: number;
  };
  gaps: SayDoGap[];
}

export interface MitreTechnique {
  technique_id: string;
  technique_name: string;
  tactic: string;
  detection_evidence: number;
  status: string;
  last_updated: string;
  rules_mapped: number;
  explanation: string;
}

export interface OutdatedRule {
  rule_id: string;
  rule_name: string;
  rule_type: string;
  mapped_technique: string;
  created_at: string;
  last_updated: string;
  age_days: number;
  status: string;
  recommended_action: string;
}

export interface SuppressionGap {
  gap_id: string;
  asset_id: string;
  asset_name: string;
  asset_type: string;
  criticality: string;
  business_impact: string;
  observed_pattern: string;
  cautious_explanation: string;
  status: string;
  recommended_review: string;
}

export interface DetectionCoverageData {
  period_days?: number;
  mitre_coverage: MitreTechnique[];
  outdated_rules: OutdatedRule[];
  suppression_gaps: SuppressionGap[];
  summary: {
    total_rules: number;
    outdated_rules_count: number;
    coverage_gaps_count: number;
    limited_coverage_count: number;
    visibility_gaps_count: number;
  };
}

export interface SupervisoryQueueData {
  period_days?: number;
  soc_id?: string;
  total_queued: number;
  total_active: number;
  total_completed: number;
  high_priority_count: number;
  active_findings: Finding[];
  completed_findings: Finding[];
  queue: Finding[];
}
