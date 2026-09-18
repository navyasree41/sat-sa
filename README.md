\# SAT-SA — Supervisory Analytics Tool for SOC Assessment



SAT-SA is a supervisory analytics platform designed to support \*\*NCIIPC\*\* in assessing the operational effectiveness and cyber-resilience of Critical Sector Entities (CSEs).



Instead of replacing or operating a Security Operations Center (SOC), SAT-SA analyzes periodically submitted SOC records such as alerts, investigations, evidence, escalations, closures, and workflow data.

## Demo Dataset

The deployed prototype uses a reduced synthetic DEMO dataset for fast demonstrations. The original full dataset remains available under `backend/data/full` for scalability testing. The DEMO dataset is representative, preserves cross-record relationships, and retains the planted supervisory signals used by the important findings.



\## 🎯 Objective



SAT-SA helps NCIIPC identify:



\- Potential operational weaknesses

\- Evidence gaps and inconsistencies

\- Investigation-quality concerns

\- KPI-versus-evidence mismatches

\- Potential monitoring blind spots

\- Workload-associated quality degradation

\- Records that deserve deeper supervisory examination



The platform prioritizes potentially doubtful or weak patterns so that \*\*NCIIPC personnel can manually examine the underlying records and make the final supervisory judgment.\*\*



> \*\*SAT-SA doesn't say "GUILTY." SAT-SA says "WORTH CHECKING."\*\*



\## 🔄 How SAT-SA Works



```text

CSE

&#x20; ↓

CSE SOC

&#x20; ↓

Alerts / Investigations / Evidence / Escalations / Closures

&#x20; ↓

Periodic Structured Submission

&#x20; ↓

SAT-SA

&#x20; ↓

Supervisory Analytics

&#x20; ↓

Potential Supervisory Signals

&#x20; ↓

NCIIPC Examiner / Senior Supervisor

&#x20; ↓

Manual Examination \& Supervisory Decision

