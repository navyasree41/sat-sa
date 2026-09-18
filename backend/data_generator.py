import os
import random
import hashlib
from datetime import datetime, timedelta
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
FULL_DATA_DIR = os.path.join(DATA_DIR, "full")
DEMO_DATA_DIR = os.path.join(DATA_DIR, "demo")
DEMO_DATASET_SIZE = 1000


def create_demo_dataset(
    source_dir=FULL_DATA_DIR,
    output_dir=DEMO_DATA_DIR,
    alert_count=DEMO_DATASET_SIZE,
    seed=42,
):
    """Create a representative, relationship-preserving demo dataset from full CSVs."""
    required_files = [
        "socs.csv",
        "alerts.csv",
        "investigations.csv",
        "escalations.csv",
        "kpis.csv",
        "assets.csv",
        "detection_rules.csv",
        "evidence.csv",
    ]
    if not all(os.path.exists(os.path.join(source_dir, filename)) for filename in required_files):
        raise FileNotFoundError(f"Full dataset is incomplete: {source_dir}")

    os.makedirs(output_dir, exist_ok=True)
    frames = {
        filename: pd.read_csv(os.path.join(source_dir, filename))
        for filename in required_files
    }

    alerts = frames["alerts.csv"]
    if alert_count < 1 or alert_count > len(alerts):
        raise ValueError(f"alert_count must be between 1 and {len(alerts)}")

    # Keep the SOC distribution proportional while pinning planted Beta signal cases.
    soc_targets = {
        "SOC-ALPHA": 190,
        "SOC-BETA": 170,
        "SOC-GAMMA": 155,
        "SOC-DELTA": 175,
        "SOC-EPSILON": 145,
        "SOC-ZETA": 165,
    }
    target_total = sum(soc_targets.values())
    if target_total != alert_count:
        raise ValueError("SOC demo targets must add up to alert_count")

    investigations = frames["investigations.csv"].merge(
        alerts[["alert_id", "soc_id", "severity"]], on="alert_id", how="inner"
    )
    beta_candidates = investigations[
        (investigations["soc_id"] == "SOC-BETA")
        & (
            (investigations["investigation_duration"] < 2.5)
            | (
                (investigations["investigation_duration"] < 4.5)
                & investigations["severity"].isin(["Critical", "High"])
            )
        )
        & (investigations["evidence_count"] <= 1)
        & (investigations["artifacts_collected"] == 0)
    ]
    pinned_ids = set(beta_candidates.sort_values("investigation_id").head(12)["alert_id"])
    pinned_ids.update(
        investigations.loc[
            investigations["investigation_id"] == "INV-02140", "alert_id"
        ]
    )

    selected_alerts = []
    for soc_id, target in soc_targets.items():
        soc_alerts = alerts[alerts["soc_id"] == soc_id]
        pinned = soc_alerts[soc_alerts["alert_id"].isin(pinned_ids)]
        sample_size = target - len(pinned)
        sampled = soc_alerts.drop(index=pinned.index).sample(
            n=sample_size, random_state=seed + len(selected_alerts)
        )
        selected_alerts.append(pd.concat([pinned, sampled]))

    demo_alerts = pd.concat(selected_alerts).sort_values("alert_id").reset_index(drop=True)
    selected_ids = set(demo_alerts["alert_id"])

    demo_investigations = frames["investigations.csv"][
        frames["investigations.csv"]["alert_id"].isin(selected_ids)
    ].copy()
    demo_evidence = frames["evidence.csv"][
        frames["evidence.csv"]["alert_id"].isin(selected_ids)
    ].copy()
    demo_escalations = frames["escalations.csv"][
        frames["escalations.csv"]["alert_id"].isin(selected_ids)
    ].copy()

    referenced_assets = set(demo_alerts["asset_id"])
    critical_assets = set(
        frames["assets.csv"].loc[
            frames["assets.csv"]["criticality"] == "Critical", "asset_id"
        ]
    )
    demo_assets = frames["assets.csv"][
        frames["assets.csv"]["asset_id"].isin(referenced_assets | critical_assets)
    ].copy()

    output_frames = {
        "socs.csv": frames["socs.csv"],
        "alerts.csv": demo_alerts,
        "investigations.csv": demo_investigations,
        "escalations.csv": demo_escalations,
        "kpis.csv": frames["kpis.csv"],
        "assets.csv": demo_assets,
        "detection_rules.csv": frames["detection_rules.csv"],
        "evidence.csv": demo_evidence,
    }
    for filename, frame in output_frames.items():
        frame.to_csv(os.path.join(output_dir, filename), index=False)

    print(f"Demo dataset generated successfully in {output_dir}:")
    for filename, frame in output_frames.items():
        print(f" - {filename}: {len(frame)} records")

def generate_synthetic_dataset(output_dir=DATA_DIR, seed=42):
    """
    Generates a reproducible synthetic dataset for SAT-SA SOC Assurance.
    Planted behavioral patterns match SOC profiles:
      - SOC Alpha: Healthy baseline
      - SOC Beta: High note similarity / template reuse / low evidence diversity
      - SOC Gamma: Shallow investigations / ultra-fast closures / near-zero artifacts
      - SOC Delta: High KPI vs Evidence discrepancy (inflated reported metrics)
      - SOC Epsilon: Detection gaps / outdated detection rules / visibility blindspots
      - SOC Zeta: Say-Do procedure deviations / missing critical escalations / SLA delays
    """
    random.seed(seed)
    os.makedirs(output_dir, exist_ok=True)

    now = datetime(2026, 9, 10, 8, 0, 0)
    start_time = now - timedelta(days=90)

    # 1. SOCs
    socs = [
        {"soc_id": "SOC-ALPHA", "soc_name": "SOC Alpha (Global Operations)", "analyst_count": 22, "assessment_period": "Last 90 Days"},
        {"soc_id": "SOC-BETA", "soc_name": "SOC Beta (Regional Tier-1)", "analyst_count": 18, "assessment_period": "Last 90 Days"},
        {"soc_id": "SOC-GAMMA", "soc_name": "SOC Gamma (Cloud Defense)", "analyst_count": 15, "assessment_period": "Last 90 Days"},
        {"soc_id": "SOC-DELTA", "soc_name": "SOC Delta (Financial Services)", "analyst_count": 20, "assessment_period": "Last 90 Days"},
        {"soc_id": "SOC-EPSILON", "soc_name": "SOC Epsilon (Critical Infrastructure)", "analyst_count": 14, "assessment_period": "Last 90 Days"},
        {"soc_id": "SOC-ZETA", "soc_name": "SOC Zeta (Logistics & Supply)", "analyst_count": 16, "assessment_period": "Last 90 Days"},
    ]

    # Save socs.csv
    socs_path = os.path.join(output_dir, "socs.csv")
    with open(socs_path, "w", encoding="utf-8") as f:
        f.write("soc_id,soc_name,analyst_count,assessment_period\n")
        for s in socs:
            f.write(f"{s['soc_id']},{s['soc_name']},{s['analyst_count']},{s['assessment_period']}\n")

    # 2. Analysts (105 total distributed)
    analysts_by_soc = {}
    analyst_counter = 1
    for s in socs:
        count = s["analyst_count"]
        analysts_by_soc[s["soc_id"]] = []
        for _ in range(count):
            a_id = f"ANL-{analyst_counter:03d}"
            analysts_by_soc[s["soc_id"]].append(a_id)
            analyst_counter += 1

    # 3. Assets (500 total)
    asset_types = ["Domain Controller", "Database Server", "Payment Gateway", "Workstation", "API Gateway", "Cloud Storage Bucket", "Firewall Appliance", "Identity Provider (IdP)"]
    criticalities = ["Critical", "High", "Medium", "Low"]
    impact_levels = {"Critical": "Catastrophic Business Impact", "High": "Severe Operational Interruption", "Medium": "Moderate Workload Degradation", "Low": "Minimal Impact"}

    assets = []
    for i in range(1, 501):
        crit = "Critical" if i <= 50 else ("High" if i <= 170 else ("Medium" if i <= 360 else "Low"))
        atype = asset_types[i % len(asset_types)]
        aname = f"SRV-{atype.split()[0].upper()}-{i:03d}" if "Server" in atype or "Domain" in atype else f"AST-{atype.split()[0].upper()}-{i:03d}"
        assets.append({
            "asset_id": f"AST-{i:04d}",
            "asset_name": aname,
            "asset_type": atype,
            "criticality": crit,
            "business_impact": impact_levels[crit]
        })

    assets_path = os.path.join(output_dir, "assets.csv")
    with open(assets_path, "w", encoding="utf-8") as f:
        f.write("asset_id,asset_name,asset_type,criticality,business_impact\n")
        for a in assets:
            f.write(f"{a['asset_id']},{a['asset_name']},{a['asset_type']},{a['criticality']},{a['business_impact']}\n")

    # 4. Detection Rules (100 total with MITRE ATT&CK techniques)
    mitre_techniques = [
        ("T1078", "Valid Accounts", "Defense Evasion / Persistence"),
        ("T1059", "Command and Scripting Interpreter", "Execution"),
        ("T1566", "Phishing", "Initial Access"),
        ("T1053", "Scheduled Task/Job", "Execution / Persistence"),
        ("T1021", "Remote Services", "Lateral Movement"),
        ("T1003", "OS Credential Dumping", "Credential Access"),
        ("T1046", "Network Service Discovery", "Discovery"),
        ("T1562", "Impair Defenses", "Defense Evasion"),
        ("T1110", "Brute Force", "Credential Access"),
        ("T1070", "Indicator Removal on Host", "Defense Evasion"),
        ("T1567", "Exfiltration Over Web Service", "Exfiltration"),
        ("T1486", "Data Encrypted for Impact", "Impact"),
        ("T1055", "Process Injection", "Defense Evasion"),
        ("T1090", "Proxy", "Command and Control"),
        ("T1190", "Exploit Public-Facing Application", "Initial Access"),
    ]

    rules = []
    for r_idx in range(1, 101):
        tech_id, tech_name, _ = mitre_techniques[r_idx % len(mitre_techniques)]
        rule_type = "Sigma Signature" if r_idx % 3 == 0 else ("Behavioral Anomaly" if r_idx % 3 == 1 else "Correlation Rule")
        
        # Plant outdated rules in SOC Epsilon / general rulebase
        if r_idx in [12, 27, 44, 71, 89]: # Outdated rules
            days_old = random.randint(220, 360)
            status = "Outdated"
        elif r_idx in [5, 19]:
            days_old = random.randint(185, 230)
            status = "Review Overdue"
        else:
            days_old = random.randint(10, 110)
            status = "Active"

        rule_created = (now - timedelta(days=days_old + 60)).strftime("%Y-%m-%d")
        rule_updated = (now - timedelta(days=days_old)).strftime("%Y-%m-%d")
        rule_name = f"DET-{tech_id}-{tech_name.replace(' ', '_')}_{r_idx:02d}"

        rules.append({
            "rule_id": f"RUL-{r_idx:03d}",
            "rule_name": rule_name,
            "rule_type": rule_type,
            "created_at": rule_created,
            "last_updated": rule_updated,
            "status": status,
            "mapped_technique": tech_id
        })

    rules_path = os.path.join(output_dir, "detection_rules.csv")
    with open(rules_path, "w", encoding="utf-8") as f:
        f.write("rule_id,rule_name,rule_type,created_at,last_updated,status,mapped_technique\n")
        for r in rules:
            f.write(f"{r['rule_id']},{r['rule_name']},{r['rule_type']},{r['created_at']},{r['last_updated']},{r['status']},{r['mapped_technique']}\n")

    # 5. Alerts, Investigations, Evidence, Escalations
    # Note templates for SOC Beta (Copy-paste / high similarity behavior)
    beta_templates = [
        "Standard triage performed. Alert verified against host baseline. Host logs checked, dismissed as benign business operational activity.",
        "Standard triage performed. Alert verified against host baseline. Host logs checked, dismissed as benign business operational activity.",
        "Alert reviewed according to SOP checklist. No active malicious payload detected on endpoint. Ticket marked as false positive.",
        "Alert reviewed according to SOP checklist. No active malicious payload detected on endpoint. Ticket marked as false positive.",
        "User confirmed routine administrative task was authorized. No containment action needed. Closed.",
    ]

    gamma_templates = [
        "Closed per quick check. False alarm.",
        "No threat observed. Dismissed.",
        "Brief review. Whitelisted activity.",
        "Cleared after quick glance. No anomaly.",
    ]

    healthy_templates = [
        "Triage initiated following telemetry trigger. Process tree analyzed down to parent PID. Network socket correlation confirmed outbound SSL beaconing to untrusted external IP. Host isolated pending escalation.",
        "Memory dump and Windows Event Log 4624/4625 scrutinized. Lateral movement attempt blocked by host firewall. Evidence artifacts securely archived in vault.",
        "Investigated suspicious PowerShell invocation with base64 encoded command. Decoded payload revealed credential harvesting script. Credentials revoked and host quarantined.",
        "Correlated firewall drop events with endpoint DNS query logs. Detected domain fronting attempt against CDN endpoint. Evidence artifacts and PCAP extract attached.",
        "Validated alert with scheduled task audit. Discovered persistence backdoor under TaskScheduler. Scheduled task deleted and hash submitted for blacklisting."
    ]

    alerts = []
    investigations = []
    evidence_records = []
    escalations = []

    alert_counter = 1
    inv_counter = 1
    ev_counter = 1
    esc_counter = 1

    # Distribution of alerts across 6 SOCs: ~20,000 total alerts
    soc_alert_targets = {
        "SOC-ALPHA": 3800,
        "SOC-BETA": 3400,
        "SOC-GAMMA": 3100,
        "SOC-DELTA": 3500,
        "SOC-EPSILON": 2900,
        "SOC-ZETA": 3300
    }

    # Tracking for T1078 (Valid Accounts): SOC Epsilon has ZERO detections for T1078 (Potential Coverage Gap)
    for soc_id, target_count in soc_alert_targets.items():
        anl_list = analysts_by_soc[soc_id]

        for _ in range(target_count):
            a_num = alert_counter
            alert_counter += 1

            # Timestamp within 90 days
            offset_hours = random.randint(0, 90 * 24)
            alert_time = start_time + timedelta(hours=offset_hours, minutes=random.randint(0, 59))
            
            # Severity distribution
            sev_rand = random.random()
            if sev_rand < 0.12:
                sev = "Critical"
            elif sev_rand < 0.38:
                sev = "High"
            elif sev_rand < 0.75:
                sev = "Medium"
            else:
                sev = "Low"

            # Asset selection
            if sev in ["Critical", "High"] and random.random() < 0.70:
                asset = random.choice(assets[:170]) # Critical or High assets
            else:
                asset = random.choice(assets)

            # Rule selection
            # SOC Epsilon misses T1078 completely!
            if soc_id == "SOC-EPSILON":
                non_t1078_rules = [r for r in rules if r["mapped_technique"] != "T1078"]
                rule = random.choice(non_t1078_rules)
            else:
                rule = random.choice(rules)

            assigned_analyst = random.choice(anl_list)
            status = "Closed" if random.random() < 0.94 else "Under Review"

            alert_obj = {
                "alert_id": f"ALT-{a_num:06d}",
                "soc_id": soc_id,
                "timestamp": alert_time.strftime("%Y-%m-%d %H:%M:%S"),
                "severity": sev,
                "asset_id": asset["asset_id"],
                "asset_criticality": asset["criticality"],
                "alert_type": rule["rule_name"],
                "detection_rule": rule["rule_id"],
                "status": status,
                "assigned_analyst": assigned_analyst
            }
            alerts.append(alert_obj)

            # Investigations: ~50% of alerts have formal recorded investigation tickets (approx 10,000 total)
            # High & Critical alerts almost always receive investigation ticket
            needs_inv = (sev in ["Critical", "High"]) or (random.random() < 0.35)
            if needs_inv and len(investigations) < 10000:
                inv_id = f"INV-{inv_counter:05d}"
                inv_counter += 1

                started_at = alert_time + timedelta(minutes=random.randint(2, 25))

                # Planting profile traits into investigations
                if soc_id == "SOC-BETA":
                    # Fast closure, high similarity, low evidence count (mostly 1)
                    duration_min = round(random.uniform(1.2, 3.8), 1)
                    ev_count = 1 if random.random() < 0.85 else 2
                    artifacts = 0 if random.random() < 0.70 else 1
                    notes = random.choice(beta_templates)
                    closure_reason = "False Positive" if random.random() < 0.90 else "Benign True Positive"
                    escalated = "No"

                elif soc_id == "SOC-GAMMA":
                    # Ultra shallow, quick close, zero artifacts
                    duration_min = round(random.uniform(0.6, 2.4), 1)
                    ev_count = 0 if random.random() < 0.60 else 1
                    artifacts = 0
                    notes = random.choice(gamma_templates)
                    closure_reason = "Dismissed - Routine"
                    escalated = "No"

                elif soc_id == "SOC-DELTA":
                    # Reported as thorough, but operational evidence shows medium-shallow duration and light evidence
                    duration_min = round(random.uniform(3.5, 9.0), 1)
                    ev_count = random.choice([1, 2])
                    artifacts = random.choice([0, 1])
                    notes = "Triage evaluation completed per playbook. Review indicators match documented known exception."
                    closure_reason = "Resolved - Standard Process"
                    escalated = "Yes" if (sev == "Critical" and random.random() < 0.75) else "No"

                elif soc_id == "SOC-ZETA":
                    # Say-Do gap: Often forgets to escalate or takes way too long (>30 min)
                    duration_min = round(random.uniform(18.0, 52.0), 1)
                    ev_count = random.choice([2, 3])
                    artifacts = random.choice([1, 2])
                    notes = "Investigation carried out on alert telemetry. Escalation delayed due to shift turnover."
                    closure_reason = "Escalated for Action" if random.random() < 0.50 else "Closed Locally"
                    # Zeta skips escalation even for critical alerts!
                    escalated = "No" if (sev == "Critical" and random.random() < 0.45) else ("Yes" if sev == "Critical" else "No")

                else: # SOC-ALPHA and others: Healthy
                    duration_min = round(random.uniform(14.0, 42.0), 1)
                    ev_count = random.randint(3, 5)
                    artifacts = random.randint(2, 4)
                    notes = random.choice(healthy_templates)
                    closure_reason = "Containment Verified" if sev in ["Critical", "High"] else "Benign Operation"
                    escalated = "Yes" if sev == "Critical" else ("Yes" if sev == "High" and random.random() < 0.6 else "No")

                closed_at = started_at + timedelta(minutes=duration_min)

                investigations.append({
                    "investigation_id": inv_id,
                    "alert_id": alert_obj["alert_id"],
                    "analyst_id": assigned_analyst,
                    "started_at": started_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "closed_at": closed_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "investigation_duration": duration_min,
                    "investigation_notes": notes,
                    "evidence_count": ev_count,
                    "artifacts_collected": artifacts,
                    "closure_reason": closure_reason,
                    "escalated": escalated
                })

                # Generate matching evidence records (~10,000 total)
                ev_sources = ["EDR Sensor (CrowdStrike/Defender)", "Network Packet Broker (Zeek)", "Firewall Syslog (PaloAlto)", "Active Directory Security Log 4624", "CloudTrail API Audit"]
                ev_types = ["Process Tree & Hash", "PCAP Stream", "Authentication Token", "Registry Modification", "Memory Extraction"]

                for e_i in range(ev_count):
                    if len(evidence_records) < 10000:
                        ev_id = f"EVD-{ev_counter:05d}"
                        ev_counter += 1
                        ev_source = ev_sources[(e_i + a_num) % len(ev_sources)]
                        ev_type = ev_types[(e_i + a_num) % len(ev_types)]
                        hash_val = hashlib.sha256(f"{ev_id}-{alert_obj['alert_id']}-{e_i}".encode()).hexdigest()[:16]

                        evidence_records.append({
                            "evidence_id": ev_id,
                            "alert_id": alert_obj["alert_id"],
                            "evidence_type": ev_type,
                            "created_at": (started_at + timedelta(minutes=random.randint(1, max(1, int(duration_min))))).strftime("%Y-%m-%d %H:%M:%S"),
                            "source": ev_source,
                            "description": f"Verified {ev_type} captured from {asset['asset_name']} during investigation of {rule['rule_name']}",
                            "hash": hash_val
                        })

                # Escalation record creation (~2000 total)
                # If Critical alert, escalation is MANDATORY per SLA policy
                is_required = (sev == "Critical")
                if (is_required or escalated == "Yes") and len(escalations) < 2000:
                    # In SOC Zeta, 12+ required escalations never occurred!
                    if soc_id == "SOC-ZETA" and is_required and random.random() < 0.38:
                        # Say-Do deviation: Escalation was required by SLA, but NEVER HAPPENED or was aborted
                        pass
                    else:
                        esc_id = f"ESC-{esc_counter:04d}"
                        esc_counter += 1
                        
                        # In SOC Zeta, escalation is severely delayed (30-65 mins instead of required <= 15 mins)
                        delay_mins = random.randint(31, 65) if soc_id == "SOC-ZETA" else random.randint(4, 13)
                        esc_time = started_at + timedelta(minutes=delay_mins)

                        escalations.append({
                            "escalation_id": esc_id,
                            "alert_id": alert_obj["alert_id"],
                            "analyst_id": assigned_analyst,
                            "required": "Yes" if is_required else "Discretionary",
                            "escalated_at": esc_time.strftime("%Y-%m-%d %H:%M:%S"),
                            "escalation_target": "Tier-2 CSIRT" if sev == "Critical" else "Lead Analyst",
                            "incident_id": f"INC-{2026000 + esc_counter}",
                            "status": "Escalated" if delay_mins <= 15 else "Delayed Escalation"
                        })

    # Write alerts.csv
    alerts_path = os.path.join(output_dir, "alerts.csv")
    with open(alerts_path, "w", encoding="utf-8") as f:
        f.write("alert_id,soc_id,timestamp,severity,asset_id,asset_criticality,alert_type,detection_rule,status,assigned_analyst\n")
        for a in alerts:
            f.write(f"{a['alert_id']},{a['soc_id']},{a['timestamp']},{a['severity']},{a['asset_id']},{a['asset_criticality']},{a['alert_type']},{a['detection_rule']},{a['status']},{a['assigned_analyst']}\n")

    # Write investigations.csv
    inv_path = os.path.join(output_dir, "investigations.csv")
    with open(inv_path, "w", encoding="utf-8") as f:
        f.write("investigation_id,alert_id,analyst_id,started_at,closed_at,investigation_duration,investigation_notes,evidence_count,artifacts_collected,closure_reason,escalated\n")
        for inv in investigations:
            # Clean notes to avoid breaking CSV format
            clean_notes = inv['investigation_notes'].replace('"', "'").replace("\n", " ")
            f.write(f"{inv['investigation_id']},{inv['alert_id']},{inv['analyst_id']},{inv['started_at']},{inv['closed_at']},{inv['investigation_duration']},\"{clean_notes}\",{inv['evidence_count']},{inv['artifacts_collected']},{inv['closure_reason']},{inv['escalated']}\n")

    # Write evidence.csv
    ev_path = os.path.join(output_dir, "evidence.csv")
    with open(ev_path, "w", encoding="utf-8") as f:
        f.write("evidence_id,alert_id,evidence_type,created_at,source,description,hash\n")
        for e in evidence_records:
            clean_desc = e['description'].replace('"', "'").replace("\n", " ")
            f.write(f"{e['evidence_id']},{e['alert_id']},{e['evidence_type']},{e['created_at']},{e['source']},\"{clean_desc}\",{e['hash']}\n")

    # Write escalations.csv
    esc_path = os.path.join(output_dir, "escalations.csv")
    with open(esc_path, "w", encoding="utf-8") as f:
        f.write("escalation_id,alert_id,analyst_id,required,escalated_at,escalation_target,incident_id,status\n")
        for esc in escalations:
            f.write(f"{esc['escalation_id']},{esc['alert_id']},{esc['analyst_id']},{esc['required']},{esc['escalated_at']},{esc['escalation_target']},{esc['incident_id']},{esc['status']}\n")

    # 6. Reported KPIs (kpis.csv)
    # Notice SOC Delta reports high numbers: 98% closure rate, 8 min response time, 100% escalation rate, 95% quality!
    # But operational evidence shows lower metrics!
    kpi_records = [
        {
            "soc_id": "SOC-ALPHA",
            "assessment_period": "Last 90 Days",
            "reported_closure_rate": 95.5,
            "reported_response_time": 18.2, # minutes
            "reported_escalation_rate": 96.0, # percent
            "reported_investigation_quality": 92.0 # score 0-100
        },
        {
            "soc_id": "SOC-BETA",
            "assessment_period": "Last 90 Days",
            "reported_closure_rate": 99.1,
            "reported_response_time": 4.5,
            "reported_escalation_rate": 88.0,
            "reported_investigation_quality": 89.0
        },
        {
            "soc_id": "SOC-GAMMA",
            "assessment_period": "Last 90 Days",
            "reported_closure_rate": 98.2,
            "reported_response_time": 3.2,
            "reported_escalation_rate": 78.0,
            "reported_investigation_quality": 84.0
        },
        {
            "soc_id": "SOC-DELTA",
            "assessment_period": "Last 90 Days",
            "reported_closure_rate": 98.0, # Claimed 98%
            "reported_response_time": 8.0, # Claimed 8 min
            "reported_escalation_rate": 100.0, # Claimed 100%
            "reported_investigation_quality": 95.0 # Claimed 95%
        },
        {
            "soc_id": "SOC-EPSILON",
            "assessment_period": "Last 90 Days",
            "reported_closure_rate": 91.0,
            "reported_response_time": 24.5,
            "reported_escalation_rate": 92.0,
            "reported_investigation_quality": 86.0
        },
        {
            "soc_id": "SOC-ZETA",
            "assessment_period": "Last 90 Days",
            "reported_closure_rate": 94.0,
            "reported_response_time": 14.0,
            "reported_escalation_rate": 95.0,
            "reported_investigation_quality": 88.0
        },
    ]

    kpis_path = os.path.join(output_dir, "kpis.csv")
    with open(kpis_path, "w", encoding="utf-8") as f:
        f.write("soc_id,assessment_period,reported_closure_rate,reported_response_time,reported_escalation_rate,reported_investigation_quality\n")
        for k in kpi_records:
            f.write(f"{k['soc_id']},{k['assessment_period']},{k['reported_closure_rate']},{k['reported_response_time']},{k['reported_escalation_rate']},{k['reported_investigation_quality']}\n")

    print(f"Dataset generated successfully in {output_dir}:")
    print(f" - SOCs: {len(socs)}")
    print(f" - Assets: {len(assets)}")
    print(f" - Detection Rules: {len(rules)}")
    print(f" - Alerts: {len(alerts)}")
    print(f" - Investigations: {len(investigations)}")
    print(f" - Evidence Records: {len(evidence_records)}")
    print(f" - Escalations: {len(escalations)}")

if __name__ == "__main__":
    generate_synthetic_dataset()
