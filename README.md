# SAT-SA — Supervisory Analytics Tool for SOC Assessment

> **An AI-assisted supervisory analytics platform for assessing SOC performance, investigation quality, and cyber-resilience.**

## 📌 Project Overview

**SAT-SA** is a supervisory analytics platform designed to support **NCIIPC** in assessing the operational effectiveness and cyber-resilience of **Critical Sector Entities (CSEs)**.

Security Operations Centers generate large volumes of alerts, investigations, evidence, escalations, and performance records. Manually reviewing these records across multiple entities can make it difficult to identify important patterns, inconsistencies, and areas that require deeper examination.

SAT-SA addresses this challenge by analyzing submitted SOC records and providing **data-driven supervisory insights**.

---

## 🎯 Problem

Supervisory teams need to review large volumes of SOC records to understand:

* Whether investigations are being performed effectively
* Whether reported outcomes are supported by evidence
* Whether there are inconsistencies across records
* Whether monitoring gaps or unusual patterns exist
* Which records may require deeper examination

Manual analysis of such information can be time-consuming and difficult to scale.

---

## 💡 Our Solution

SAT-SA acts as an **independent supervisory analytics layer** over submitted SOC records.

It correlates and analyzes operational data to identify:

* **Investigation quality concerns**
* **Evidence inconsistencies and gaps**
* **KPI vs. evidence mismatches**
* **Potential monitoring blind spots**
* **Unusual operational patterns**
* **Records requiring deeper supervisory review**

SAT-SA does **not replace the SOC or make the final supervisory decision**. It helps supervisors identify **where to look and what to investigate**, while the final decision remains with the human examiner.

---

## 🔄 How SAT-SA Works

```text
SOC Records
     ↓
Data Ingestion
     ↓
Record Correlation
     ↓
Supervisory Analytics
     ↓
Potential Supervisory Signals
     ↓
Evidence Review
     ↓
Human Supervisory Decision
```

---

## 🚀 Key Features

| Feature                      | Purpose                                                   |
| ---------------------------- | --------------------------------------------------------- |
| **SOC Record Analysis**      | Analyze submitted operational records                     |
| **Cross-Record Correlation** | Connect related alerts, investigations and evidence       |
| **Investigation Analysis**   | Identify potential investigation-quality concerns         |
| **Evidence Consistency**     | Highlight gaps and inconsistencies                        |
| **KPI vs Evidence Analysis** | Compare reported performance with supporting records      |
| **Monitoring Analysis**      | Identify potential monitoring blind spots                 |
| **Priority Identification**  | Help supervisors focus on records requiring deeper review |
| **Human-in-the-Loop**        | Keep final supervisory decisions with the examiner        |

---

## 🖥️ Prototype

The prototype provides a dashboard-based interface through which supervisors can:

**Overview → Identify Signals → Explore Records → Review Evidence → Investigate**

The current demonstration uses a **synthetic SOC dataset** designed to represent the relationships and patterns required to demonstrate SAT-SA's supervisory analytics capabilities.

---

## 🛠️ Technology Stack

**Frontend:** React · TypeScript · Vite
**Backend:** Python · Flask
**Data:** Structured SOC records · Synthetic demonstration dataset
**Deployment:** Vercel
**Version Control:** Git · GitHub

---

> **SAT-SA transforms large volumes of SOC records into focused supervisory insights — helping humans investigate better, not replacing human judgment.**
