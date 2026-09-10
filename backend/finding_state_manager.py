import os
import json
from datetime import datetime

STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "state", "findings_state.json")

def load_findings_state():
    """Loads current finding statuses, notes, and audit history."""
    if not os.path.exists(STATE_FILE):
        return {}
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[SAT-SA] Warning: Could not read findings_state.json: {e}")
        return {}

def save_findings_state(state):
    """Saves finding state to JSON file."""
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def get_finding_state(finding_id):
    state = load_findings_state()
    return state.get(finding_id, {
        "status": "OPEN",
        "review_notes": "",
        "recommendation": "",
        "reviewed_by": None,
        "reviewed_at": None,
        "completed_by": None,
        "completed_at": None,
        "audit_history": []
    })

def submit_review(finding_id, role, review_notes, recommendation=""):
    """
    NCIIPC Examiner (or Senior Supervisor) starts/submits review.
    Moves status from OPEN -> UNDER REVIEW.
    """
    state = load_findings_state()
    current = state.get(finding_id, {
        "status": "OPEN",
        "review_notes": "",
        "recommendation": "",
        "reviewed_by": None,
        "reviewed_at": None,
        "completed_by": None,
        "completed_at": None,
        "audit_history": []
    })

    if current.get("status") == "COMPLETED":
        return False, "Completed findings are locked and cannot be edited.", 400

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    prev_status = current.get("status", "OPEN")
    new_status = "UNDER REVIEW"

    audit_entry = {
        "previous_status": prev_status,
        "new_status": new_status,
        "role": role,
        "timestamp": now_str,
        "review_note": review_notes or "Analyst started review and attached preliminary notes."
    }

    current["status"] = new_status
    current["review_notes"] = review_notes
    current["recommendation"] = recommendation
    current["reviewed_by"] = role
    current["reviewed_at"] = now_str
    current.setdefault("audit_history", []).append(audit_entry)

    state[finding_id] = current
    save_findings_state(state)
    return True, current, 200

def complete_finding(finding_id, role, notes=""):
    """
    NCIIPC Senior Supervisor completes finding.
    Moves status from UNDER REVIEW or OPEN -> COMPLETED.
    Enforces role-based permission: MUST be NCIIPC Senior Supervisor.
    """
    # Permission check: Examiner cannot complete
    if role != "NCIIPC Senior Supervisor":
        return False, "NCIIPC Senior Supervisor approval is required to complete this finding.", 403

    state = load_findings_state()
    current = state.get(finding_id, {
        "status": "OPEN",
        "review_notes": "",
        "recommendation": "",
        "reviewed_by": None,
        "reviewed_at": None,
        "completed_by": None,
        "completed_at": None,
        "audit_history": []
    })

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    prev_status = current.get("status", "OPEN")
    new_status = "COMPLETED"

    audit_entry = {
        "previous_status": prev_status,
        "new_status": new_status,
        "role": "NCIIPC Senior Supervisor",
        "timestamp": now_str,
        "review_note": notes or "NCIIPC Senior Supervisor validated evidence and approved finding completion. Record locked."
    }

    current["status"] = new_status
    current["completed_by"] = "NCIIPC Senior Supervisor"
    current["completed_at"] = now_str
    if notes:
        current["completion_notes"] = notes
    current.setdefault("audit_history", []).append(audit_entry)

    state[finding_id] = current
    save_findings_state(state)
    return True, current, 200

def reopen_finding(finding_id, role, notes=""):
    """
    NCIIPC Senior Supervisor explicitly reopens a completed finding back to OPEN.
    """
    if role != "NCIIPC Senior Supervisor":
        return False, "NCIIPC Senior Supervisor permission is required to reopen this finding.", 403

    state = load_findings_state()
    current = state.get(finding_id, {
        "status": "OPEN",
        "review_notes": "",
        "recommendation": "",
        "reviewed_by": None,
        "reviewed_at": None,
        "completed_by": None,
        "completed_at": None,
        "audit_history": []
    })

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    prev_status = current.get("status", "COMPLETED")
    new_status = "OPEN"

    audit_entry = {
        "previous_status": prev_status,
        "new_status": new_status,
        "role": "NCIIPC Senior Supervisor",
        "timestamp": now_str,
        "review_note": notes or "NCIIPC Senior Supervisor reopened finding for supervisory re-evaluation."
    }

    current["status"] = new_status
    current["completed_by"] = None
    current["completed_at"] = None
    current.setdefault("audit_history", []).append(audit_entry)

    state[finding_id] = current
    save_findings_state(state)
    return True, current, 200
