import pandas as pd
import numpy as np

def analyze_evidence_validation(evidence_df, investigations_df, alerts_df, soc_id=None):
    """
    Validates whether SOC investigation claims and actions are backed by operational evidence.
    """
    if soc_id and soc_id != "ALL":
        # Filter investigations and evidence for this SOC
        soc_alerts = alerts_df[alerts_df["soc_id"] == soc_id]["alert_id"]
        inv_subset = investigations_df[investigations_df["alert_id"].isin(soc_alerts)]
        ev_subset = evidence_df[evidence_df["alert_id"].isin(soc_alerts)]
    else:
        inv_subset = investigations_df
        ev_subset = evidence_df

    total_invs = len(inv_subset)
    if total_invs == 0:
        return {"total_investigations": 0, "evidence_coverage": 0, "evidence_distribution": []}

    # Match evidence count per investigation
    ev_per_alert = ev_subset.groupby("alert_id").size().reset_index(name="actual_evidence_records")
    merged = inv_subset.merge(ev_per_alert, on="alert_id", how="left").fillna({"actual_evidence_records": 0})

    # Evidence coverage: % of investigations with >= 2 validated evidence records
    supported = (merged["actual_evidence_records"] >= 2).sum()
    coverage_pct = round((supported / total_invs) * 100, 1)

    # Evidence by type
    ev_types = ev_subset["evidence_type"].value_counts().to_dict()
    ev_sources = ev_subset["source"].value_counts().to_dict()

    # Evidence strength categorization
    strong = (merged["actual_evidence_records"] >= 3).sum()
    moderate = ((merged["actual_evidence_records"] >= 1) & (merged["actual_evidence_records"] < 3)).sum()
    weak_or_none = (merged["actual_evidence_records"] == 0).sum()

    return {
        "total_investigations": int(total_invs),
        "evidence_coverage_pct": float(coverage_pct),
        "supported_investigations": int(supported),
        "strength_breakdown": {
            "strong": int(strong),
            "moderate": int(moderate),
            "weak_or_none": int(weak_or_none)
        },
        "evidence_types": ev_types,
        "evidence_sources": ev_sources
    }
