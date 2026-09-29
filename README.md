# TejaX AI powered CYBER INTELLIGENCE

## Problem Statement
Modern Security Operations Centers (SOCs) are inundated with an overwhelming volume of raw threat data from disparate sources. SOC analysts and Cyber Threat Intelligence (CTI) teams struggle to:
- **Synthesize Information**: Manually processing raw advisories into actionable intelligence is time-consuming and error-prone.
- **Maintain Cross-Platform Agility**: Generating consistent detection rules across multiple SIEM and EDR platforms (Splunk, Microsoft Sentinel, CrowdStrike, etc.) requires deep expertise in various query languages.
- **Track Attacker Evolution**: Understanding how threat actors like APT28 or Lazarus Group have evolved their tradecraft over decades is nearly impossible without structured historical archives.
- **Communicate Executive Risk**: Translating technical vulnerabilities into high-level security posture metrics for CISOs and executives remains a significant challenge.

## The Solution: TejaX AI
**TejaX AI powered CYBER INTELLIGENCE** is an enterprise-grade platform designed to bridge the gap between raw intelligence and proactive defense. It leverages cutting-edge AI (Gemini 2.0) to empower SOC teams with:

### 1. AI-Driven CTI Synthesis
Automatically transforms raw security advisories, vulnerability disclosures, and OSINT snippets into structured CTI reports. It generates production-ready detection queries for:
- **Splunk (SPL)**
- **Microsoft Sentinel (KQL)**
- **CrowdStrike LogScale (CQL)**
- **Sigma Rules (YAML)**
- **YARA & Snort Signatures**

### 2. Historical Intelligence Archives
A centralized database storing decades of threat actor profiles, past campaigns, and historical vulnerability data. The platform enables analysts to:
- Identify long-term patterns in adversary behavior.
- Track the "evolution path" of specific threat groups.
- Analyze the lifecycle of critical vulnerabilities from disclosure to widespread exploitation.

### 3. Interactive Threat Hunting Sandbox
A dedicated environment for formulating and testing hunt hypotheses. The AI Assistant provides real-time guidance, optimizing SPL queries and suggesting hunt pivots based on MITRE ATT&CK TTPs.

### 4. Executive CISO Dashboard & CTI Posture
Translates technical telemetry into business risk metrics.
- **CTI Posture Score**: A composite risk metric based on asset vulnerabilities, EDR coverage, and active threat actor targeting.
- **Global Threat Heatmap**: Visualizes attack vectors and kill chain stages in real-time.
- **Asset CTI Matrix**: Correlates live threat feeds with the organization's specific asset inventory.

### 5. Multi-Turn AI SOC Co-pilot
A Gemini-powered assistant integrated into the workflow, capable of:
- Optimizing complex SIEM queries for enterprise scale.
- Converting detection rules between different platform formats.
- Explaining threat actor behaviors with grounded historical context.
- Generating formal incident remediation playbooks.

## Tech Stack
- **Frontend**: React (Vite) with Tailwind CSS for high-performance, glassmorphic UI.
- **Backend**: Node.js Express server providing secure proxy to Gemini AI APIs.
- **Database**: Firebase Firestore for real-time intelligence synchronization and persistence.
- **Authentication**: Firebase Auth with Google Cloud Identity integration.
- **AI Engine**: Google Gemini 2.0 Flash & Pro models for intelligence synthesis and threat analysis.

## Security & Compliance
- **ABAC Security**: Attribute-Based Access Control enforced via hardened Firestore security rules.
- **TLP Standards**: Full support for Traffic Light Protocol (TLP 2.0) information sharing standards.
- **Zero-Trust Principles**: Identity-aware access to all intelligence dossiers and executive reports.

---
*Proprietary Intelligence Environment // Authorized Analyst Access Only*
