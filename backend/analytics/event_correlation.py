import pandas as pd

def correlate_event_chain(alert_id, alerts_df, investigations_df, evidence_df, escalations_df, assets_df):
    """
    Connects Alert -> Investigation -> Evidence -> Escalation -> Asset.
    Identifies inconsistencies in the operational event chain.
    """
    alert_row = alerts_df[alerts_df["alert_id"] == alert_id]
    if len(alert_row) == 0:
        return None
    alert = alert_row.iloc[0].to_dict()

    # Asset
    asset_row = assets_df[assets_df["asset_id"] == alert["asset_id"]]
    asset = asset_row.iloc[0].to_dict() if len(asset_row) > 0 else {}

    # Investigation
    inv_row = investigations_df[investigations_df["alert_id"] == alert_id]
    inv = inv_row.iloc[0].to_dict() if len(inv_row) > 0 else None

    # Evidence
    ev_rows = evidence_df[evidence_df["alert_id"] == alert_id]
    evidence_list = ev_rows.to_dict(orient="records")

    # Escalation
    esc_row = escalations_df[escalations_df["alert_id"] == alert_id]
    escalation = esc_row.iloc[0].to_dict() if len(esc_row) > 0 else None

    # Correlation Inconsistency Analysis
    inconsistencies = []
    if alert["severity"] == "Critical" and not escalation:
        inconsistencies.append({
            "type": "Missed Mandatory Escalation",
            "cautious_text": "Alert is marked Critical, but no corresponding escalation record exists in operational logs."
        })

    if inv and float(inv.get("investigation_duration", 0)) < 3.0 and len(evidence_list) == 0:
        inconsistencies.append({
            "type": "Shallow Closure Without Evidence",
            "cautious_text": "Investigation was concluded in less than 3 minutes without attaching operational evidence."
        })

    return {
        "alert": alert,
        "asset": asset,
        "investigation": inv,
        "evidence_records": evidence_list,
        "escalation": escalation,
        "inconsistencies": inconsistencies,
        "evidence_strength": "Strong" if len(evidence_list) >= 3 else ("Moderate" if len(evidence_list) >= 1 else "Insufficient")
    }
