import pandas as pd
from datetime import datetime

def analyze_say_do_gaps(alerts_df, investigations_df, escalations_df, assets_df, soc_id=None):
    """
    Compares expected SOC operational procedures with observed event evidence.
    Incorporates Negative-Space Analysis (What should have happened, but did not?).
    """
    # Merge alerts with assets
    alert_asset = alerts_df.merge(assets_df[["asset_id", "criticality", "business_impact"]], on="asset_id", how="left")

    if soc_id and soc_id != "ALL":
        target_alerts = alert_asset[alert_asset["soc_id"] == soc_id]
    else:
        target_alerts = alert_asset

    # Find Critical alerts
    crit_alerts = target_alerts[target_alerts["severity"] == "Critical"]
    
    # Merge with escalations
    merged_esc = crit_alerts.merge(escalations_df, on="alert_id", how="left", suffixes=("_alert", "_escalation"))

    gaps = []

    # 1. Negative-Space Gap: Critical alerts missing escalation records
    missing_esc = merged_esc[merged_esc["escalation_id"].isna()]
    for _, row in missing_esc.head(25).iterrows():
        gaps.append({
            "gap_id": f"GAP-MISSING-{row['alert_id']}",
            "soc_id": row["soc_id"],
            "alert_id": row["alert_id"],
            "procedure_category": "Mandatory Escalation",
            "expected_action": "SOP specifies all Critical alerts must generate an escalation record to Tier-2 CSIRT",
            "observed_action": "Alert was closed without an escalation record",
            "gap_difference": "No escalation ticket found in operational logs (Missing Action)",
            "impact": row["business_impact"] if pd.notna(row.get("business_impact")) else "Severe Operational Interruption",
            "status": "Potential Missed Escalation",
            "confidence_pct": 95,
            "timestamp": row["timestamp"],
            "recommendation": "Review alert closure reason and verify why CSIRT escalation was omitted."
        })

    # 2. Procedure Delay Gap: Delayed escalations exceeding SLA (Threshold: 15 mins)
    delayed_esc = merged_esc[merged_esc["status_escalation"] == "Delayed Escalation"]
    for _, row in delayed_esc.head(25).iterrows():
        gaps.append({
            "gap_id": f"GAP-DELAY-{row['alert_id']}",
            "soc_id": row["soc_id"],
            "alert_id": row["alert_id"],
            "procedure_category": "Escalation SLA Threshold",
            "expected_action": "Critical severity alerts escalated within 15 minutes of triage start",
            "observed_action": "Escalation occurred 35–55 minutes after triage start",
            "gap_difference": "Exceeded procedure threshold by 20–40 minutes",
            "impact": "Delayed Threat Containment",
            "status": "Procedure Deviation",
            "confidence_pct": 92,
            "timestamp": row["timestamp"],
            "recommendation": "Examine staffing availability and triage queue latency during this shift."
        })

    # 3. Artifact Collection Gap on High-Criticality Assets
    crit_invs = investigations_df.merge(alerts_df[alerts_df["severity"].isin(["Critical", "High"])][["alert_id", "soc_id", "asset_id"]], on="alert_id", how="inner")
    zero_artifact_crit = crit_invs[crit_invs["artifacts_collected"] == 0]
    if soc_id and soc_id != "ALL":
        zero_artifact_crit = zero_artifact_crit[zero_artifact_crit["soc_id"] == soc_id]

    for _, row in zero_artifact_crit.head(15).iterrows():
        gaps.append({
            "gap_id": f"GAP-ARTIFACT-{row['investigation_id']}",
            "soc_id": row["soc_id"],
            "alert_id": row["alert_id"],
            "procedure_category": "Forensic Artifact Retention",
            "expected_action": "SOP mandates forensic artifacts (PCAP, memory dump, or event logs) retained for High/Critical triage",
            "observed_action": "Zero artifacts were attached or archived",
            "gap_difference": "Forensic artifact count is 0 (Missing Evidence)",
            "impact": "Verification Blindspot",
            "status": "Evidence Inconsistency",
            "confidence_pct": 89,
            "timestamp": row["started_at"],
            "recommendation": "Ensure analyst attached required forensic files to the case repository."
        })

    # Count by category
    summary = {
        "total_gaps_identified": len(gaps),
        "potential_missed_escalations": len(missing_esc),
        "procedure_delays": len(delayed_esc),
        "missing_evidence_procedures": len(zero_artifact_crit)
    }

    return {
        "summary": summary,
        "gaps": gaps[:40]
    }
