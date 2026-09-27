import React, { useState } from 'react';
import {
  FileText,
  Mail,
  Copy,
  Check,
  Send,
  Eye,
  Code,
  Sparkles,
  Lock,
  ToggleLeft,
  ToggleRight,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Terminal,
  CheckCircle2,
  Settings,
  RefreshCw,
  Download,
  ChevronDown
} from 'lucide-react';
import { defangIp, defangDomain, defangUrl } from './ThreatReports';
import { downloadFile } from '../utils/downloadUtils';
import { TLPLevel, getTlpConfig } from '../types/tlp';
import { TLPSelector, TLPBadge } from './TLPSelector';

export interface DailyThreatReportTemplateProps {
  onClose?: () => void;
  defaultEmail?: string;
}

export type TemplateStyle = 'executive' | 'technical' | 'compliance';

export const DailyThreatReportTemplate: React.FC<DailyThreatReportTemplateProps> = ({
  onClose,
  defaultEmail = 'sharath.skt55@gmail.com'
}) => {
  const [recipientEmail, setRecipientEmail] = useState<string>(defaultEmail);
  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>('executive');
  const [isDefanged, setIsDefanged] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'preview' | 'html' | 'markdown'>('preview');
  const [tlp, setTlp] = useState<TLPLevel>('TLP:AMBER');
  
  // Customization fields
  const [organizationName, setOrganizationName] = useState<string>('Tejax Global Enterprise');
  const [timeWindow, setTimeWindow] = useState<string>('Last 24 Hours (08:00 UTC - 08:00 UTC)');
  const [customExecutiveNote, setCustomExecutiveNote] = useState<string>(
    'During the last 24 hours, Tejax CTI Engine detected 3 critical zero-day advisories targeting LSASS memory handles, ransomware shadow purges, and Entra ID OAuth persistence. All high-risk endpoints were automatically isolated via SOAR playbooks.'
  );

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState<boolean>(false);

  const handleDownloadHtml = () => {
    const htmlStr = generateHtmlTemplate();
    const tlpCode = getTlpConfig(tlp).code;
    downloadFile(htmlStr, `Daily_Threat_Report_Template_${organizationName.replace(/\s+/g, '_')}_${tlpCode}_${isDefanged ? 'Defanged' : 'Raw'}.html`, 'text/html');
    setSendFeedback(`Downloaded HTML Template with ${tlp} classification.`);
    setDownloadDropdownOpen(false);
    setTimeout(() => setSendFeedback(null), 3500);
  };

  const handleDownloadMarkdown = () => {
    const mdStr = generateMarkdownTemplate();
    const tlpCode = getTlpConfig(tlp).code;
    downloadFile(mdStr, `Daily_Threat_Report_Summary_${organizationName.replace(/\s+/g, '_')}_${tlpCode}_${isDefanged ? 'Defanged' : 'Raw'}.md`, 'text/markdown');
    setSendFeedback(`Downloaded Markdown Summary with ${tlp} classification.`);
    setDownloadDropdownOpen(false);
    setTimeout(() => setSendFeedback(null), 3500);
  };

  const handleDownloadJsonConfig = () => {
    const tlpCfg = getTlpConfig(tlp);
    const jsonConfig = {
      templateType: '24h_daily_threat_report_summary',
      templateStyle,
      tlp,
      tlpScope: tlpCfg.recipientScope,
      tlpSharingBoundary: tlpCfg.sharingBoundary,
      organizationName,
      timeWindow,
      defanged: isDefanged,
      recipientEmail,
      executiveSummary: customExecutiveNote,
      sampleCves,
      rawIps,
      rawDomains,
      sampleHashes,
      generatedAt: new Date().toISOString()
    };
    downloadFile(JSON.stringify(jsonConfig, null, 2), `Daily_Threat_Report_Template_Config_${tlpCfg.code}.json`, 'application/json');
    setSendFeedback(`Downloaded Template Config JSON (${tlp}).`);
    setDownloadDropdownOpen(false);
    setTimeout(() => setSendFeedback(null), 3500);
  };

  // Sample data for 24h threat telemetry
  const sampleCves = [
    { cve: 'CVE-2026-21840', title: 'LSASS Memory Handle Buffer Overflow (APT28)', cvss: 9.8, status: 'SOAR ISOLATED', mitreTtp: 'T1003.001 - LSASS Memory Dump', killChainStage: 'Credential Access' },
    { cve: 'CVE-2026-11099', title: 'LockBit 3.0 Shadow Copy Erasure & Encryption', cvss: 9.6, status: 'PATCHED & ISOLATED', mitreTtp: 'T1490 - Inhibit System Recovery', killChainStage: 'Impact' },
    { cve: 'CVE-2026-30114', title: 'Scattered Spider Entra ID OAuth Consent Abuse', cvss: 9.1, status: 'TOKEN REVOKED', mitreTtp: 'T1528 - Capture Access Token', killChainStage: 'Persistence' }
  ];

  const rawIps = ['185.220.101.5', '175.45.176.8', '198.51.100.41'];
  const rawDomains = ['c2.darknet-nexus.ru', 'auth-verify-session.net', 'oauth-snatcher-cloud.net'];
  const sampleHashes = [
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  ];

  const displayIps = isDefanged ? rawIps.map(defangIp) : rawIps;
  const displayDomains = isDefanged ? rawDomains.map(defangDomain) : rawDomains;

  // Generate HTML Email String for Template based on Persona Style
  const generateHtmlTemplate = () => {
    const isExec = templateStyle === 'executive';
    const isTech = templateStyle === 'technical';
    const isComp = templateStyle === 'compliance';
    const tlpCfg = getTlpConfig(tlp);

    let personaBadgeColor = '#0284c7';
    let personaTitle = 'Executive C-Level Threat Briefing & Strategic Risk Assessment';
    if (isTech) {
      personaTitle = 'Technical SOC & EDR Intelligence Telemetry Report';
      personaBadgeColor = '#e11d48';
    } else if (isComp) {
      personaTitle = 'Regulatory Compliance & CISA KEV Vulnerability Audit Report';
      personaBadgeColor = '#d97706';
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${personaTitle} [${tlpCfg.level}]</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1329; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 680px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, ${personaBadgeColor} 0%, #0369a1 100%); color: #ffffff; padding: 24px; }
    .header h1 { margin: 0; font-size: 19px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; font-family: monospace; }
    .badge-persona { display: inline-block; background: #020617; color: ${isTech ? '#f43f5e' : isComp ? '#f59e0b' : '#38bdf8'}; font-size: 10px; font-weight: bold; font-family: monospace; padding: 3px 8px; border-radius: 4px; border: 1px solid ${personaBadgeColor}; }
    .body-content { padding: 24px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${isTech ? '#f43f5e' : isComp ? '#f59e0b' : '#38bdf8'}; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-top: 20px; margin-bottom: 12px; }
    .summary-box { background-color: #1e293b; border-left: 4px solid ${personaBadgeColor}; padding: 14px; border-radius: 6px; font-size: 13px; line-height: 1.6; color: #cbd5e1; }
    .grid-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    .grid-table th { background-color: #1e293b; color: #94a3b8; text-align: left; padding: 8px 10px; font-family: monospace; text-transform: uppercase; font-size: 10px; }
    .grid-table td { padding: 10px; border-bottom: 1px solid #1e293b; color: #f1f5f9; }
    .cve-tag { font-family: monospace; font-weight: bold; color: #38bdf8; background: #0c4a6e; padding: 2px 6px; border-radius: 4px; }
    .cvss-tag { font-family: monospace; font-weight: bold; color: #fca5a5; background: #7f1d1d; padding: 2px 6px; border-radius: 4px; }
    .ioc-box { background-color: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 11px; color: #38bdf8; word-break: break-all; margin-bottom: 8px; }
    .ioc-label { color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px; }
    .footer { background-color: #020617; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <table style="width: 100%;">
        <tr>
          <td>
            <h1>TEJAX AI • ${personaTitle.toUpperCase()}</h1>
            <p>Organization: ${organizationName} • Window: ${timeWindow}</p>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <span class="badge-persona" style="background: ${tlpCfg.bannerBgColor}; color: ${tlpCfg.textColor}; border: 1px solid ${tlpCfg.bannerBorderColor}; margin-right: 6px;">
              ${tlpCfg.level}
            </span>
            <span class="badge-persona">${templateStyle.toUpperCase()} FORMAT</span>
          </td>
        </tr>
      </table>
    </div>

    <div class="body-content">
      <!-- TLP CLASSIFICATION BANNER -->
      <div style="background-color: ${tlpCfg.bannerBgColor}; border: 1px solid ${tlpCfg.bannerBorderColor}; border-left: 5px solid ${tlpCfg.hexColor}; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-family: monospace;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
          <strong style="color: ${tlpCfg.textColor}; font-size: 11px; text-transform: uppercase;">
            TRAFFIC LIGHT PROTOCOL: ${tlpCfg.level} &bull; ${tlpCfg.recipientScope.toUpperCase()}
          </strong>
          <span style="font-size: 9px; color: #94a3b8; background: #020617; padding: 2px 6px; border-radius: 4px;">FIRST TLP 2.0</span>
        </div>
        <div style="font-size: 10px; color: #cbd5e1; margin-top: 3px;">
          <strong>Sharing Boundary:</strong> ${tlpCfg.sharingBoundary}
        </div>
      </div>

      <div style="font-size: 11px; color: #94a3b8; font-family: monospace; margin-bottom: 16px;">
        <strong>RECIPIENT:</strong> ${recipientEmail} &nbsp;|&nbsp; <strong>DEFANG STATUS:</strong> ${isDefanged ? 'DEFANGED (SAFE)' : 'RAW'} &nbsp;|&nbsp; <strong>TLP:</strong> ${tlpCfg.level}
      </div>

      ${
        isExec
          ? `
      <div class="section-title">1. Executive Summary & Business Risk Assessment</div>
      <div class="summary-box">
        ${customExecutiveNote}
      </div>

      <div class="section-title">2. Primary MITRE ATT&CK TTP & Kill Chain Vectors</div>
      <table class="grid-table">
        <tr><td><strong>Primary MITRE ATT&CK TTP:</strong></td><td><span class="cve-tag">T1003.001</span> - LSASS Memory Dumping</td></tr>
        <tr><td><strong>Cyber Kill Chain Stage:</strong></td><td style="color: #f43f5e; font-weight: bold; font-family: monospace;">Credential Access / Exploitation</td></tr>
        <tr><td><strong>Active APT Threat Groups:</strong></td><td>APT28, Lazarus Group, LockBit 3.0, Scattered Spider</td></tr>
      </table>

      <div class="section-title">3. Strategic Risk Metrics & Financial Exposure</div>
      <table class="grid-table">
        <tr><td><strong>Overall Enterprise Risk Score:</strong></td><td style="color: #f43f5e; font-weight: bold; font-family: monospace;">98 / 100 (CRITICAL)</td></tr>
        <tr><td><strong>Estimated Financial Risk Mitigation:</strong></td><td style="color: #34d399; font-weight: bold;">$14.2M Prevented via Automated SOAR Isolation</td></tr>
        <tr><td><strong>SLA Incident Response Adherence:</strong></td><td style="color: #38bdf8; font-weight: bold;">98.2% (Avg 4.2 mins response)</td></tr>
      </table>

      <div class="section-title">4. Board-Level Recommendations & Governance</div>
      <ul style="font-size: 12px; color: #cbd5e1; padding-left: 20px; line-height: 1.8;">
        <li>Approve emergency deployment of Windows Security Update KB5038912 across Domain Controllers.</li>
        <li>Authorize mandatory credential rotation for high-privilege IAM and Service Accounts.</li>
        <li>Enforce strict admin-only workflow approval for all third-party Entra ID OAuth integrations.</li>
      </ul>

      <div class="section-title">5. Threat Report References & Intelligence Sources</div>
      <ul style="font-size: 11px; color: #94a3b8; font-family: monospace; padding-left: 20px; line-height: 1.6;">
        <li>[1] CISA Cybersecurity Advisory (AA26-085A): Active Exploitation of LSASS Memory Handles.</li>
        <li>[2] MITRE ATT&CK Enterprise Framework (v15.1): T1003.001 (OS Credential Dumping: LSASS Memory).</li>
        <li>[3] NIST Special Publication 800-61 Rev. 2: Computer Security Incident Handling Guide.</li>
      </ul>
      `
          : isTech
          ? `
      <div class="section-title">1. Technical Incident & Telemetry Synthesis</div>
      <div class="summary-box">
        ${customExecutiveNote}
      </div>

      <div class="section-title">2. Top Critical CVEs, MITRE TTPs & Kill Chain Vectors</div>
      <table class="grid-table">
        <thead>
          <tr>
            <th>CVE Identifier</th>
            <th>Advisory / Technical Title</th>
            <th>CVSS</th>
            <th>MITRE TTP & Kill Chain</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${sampleCves
            .map(
              (item) => `
          <tr>
            <td><span class="cve-tag">${item.cve}</span></td>
            <td><strong>${item.title}</strong></td>
            <td><span class="cvss-tag">${item.cvss}</span></td>
            <td><div style="font-family: monospace; font-size: 10px; color: #f43f5e;">${item.mitreTtp}</div><div style="font-family: monospace; font-size: 9px; color: #34d399;">Kill Chain: ${item.killChainStage}</div></td>
            <td style="color: #34d399; font-weight: bold; font-size: 11px;">${item.status}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <div class="section-title">3. Indicators of Compromise (IOCs) - ${isDefanged ? 'Defanged' : 'Raw'}</div>
      <div class="ioc-box">
        <span class="ioc-label">MALICIOUS IP ADDRESSES:</span>
        ${displayIps.join('<br>')}
      </div>
      <div class="ioc-box">
        <span class="ioc-label">C2 DOMAIN INFRASTRUCTURE:</span>
        ${displayDomains.join('<br>')}
      </div>
      <div class="ioc-box">
        <span class="ioc-label">PAYLOAD SHA-256 HASHES:</span>
        ${sampleHashes.join('<br>')}
      </div>

      <div class="section-title">4. EDR / Sysmon Detection Rules & Playbooks</div>
      <ul style="font-size: 12px; color: #cbd5e1; padding-left: 20px; line-height: 1.8;">
        <li>Sysmon EventCode 10 GrantedAccess=0x1010 detection triggered for mimikatz.exe.</li>
        <li>PowerShell vssadmin.exe delete shadows execution intercepted by EDR auto-quarantine.</li>
        <li>Graph API rogue multitenant OAuth registration tokens revoked via automated SOAR.</li>
      </ul>

      <div class="section-title">5. Threat Report References & Intelligence Sources</div>
      <ul style="font-size: 11px; color: #94a3b8; font-family: monospace; padding-left: 20px; line-height: 1.6;">
        <li>[1] MITRE ATT&CK TTP Mapping: T1003.001, T1490, T1528.</li>
        <li>[2] STIX 2.1 CTI Feed Indicator Bundle (SHA-256 Hashes & C2 IPs).</li>
        <li>[3] Sigma Rule Signatures: Windows Security Log & Sysmon Telemetry.</li>
      </ul>
      `
          : `
      <div class="section-title">1. Compliance & Regulatory Audit Scope</div>
      <div class="summary-box">
        ${customExecutiveNote}
      </div>

      <div class="section-title">2. Primary MITRE ATT&CK TTP & Kill Chain Mapping</div>
      <table class="grid-table">
        <tr><td><strong>Primary MITRE ATT&CK TTP:</strong></td><td><span class="cve-tag">T1003.001</span> (Credential Access) & <span class="cve-tag">T1490</span> (Impact)</td></tr>
        <tr><td><strong>Kill Chain Phase Coverage:</strong></td><td style="color: #34d399; font-weight: bold;">Exploitation, Credential Access, Impact</td></tr>
        <tr><td><strong>CISA KEV Vulnerabilities:</strong></td><td style="color: #f43f5e; font-weight: bold;">3 Actionable CVEs Mitigated</td></tr>
      </table>

      <div class="section-title">3. CISA KEV & Regulatory Framework Mapping</div>
      <table class="grid-table">
        <thead>
          <tr>
            <th>Framework Standard</th>
            <th>Control Domain</th>
            <th>Compliance Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>CISA KEV Catalog</strong></td><td>Known Exploited Vulnerabilities</td><td style="color: #f43f5e; font-weight: bold;">3 Actionable CVEs</td></tr>
          <tr><td><strong>NIST CSF 2.0</strong></td><td>PR.DS-1 / DE.CM-01 (Continuous Monitoring)</td><td style="color: #34d399; font-weight: bold;">COMPLIANT (98%)</td></tr>
          <tr><td><strong>ISO/IEC 27001:2022</strong></td><td>A.12.6.1 (Vulnerability Management)</td><td style="color: #34d399; font-weight: bold;">VERIFIED</td></tr>
          <tr><td><strong>SOC 2 Type II</strong></td><td>CC6.8 (Unauthorized Access Prevention)</td><td style="color: #34d399; font-weight: bold;">ATTESTED</td></tr>
        </tbody>
      </table>

      <div class="section-title">4. Mandatory Control Verification & Sign-Off</div>
      <ul style="font-size: 12px; color: #cbd5e1; padding-left: 20px; line-height: 1.8;">
        <li>All unpatched CVSS 9.0+ vulnerabilities logged in CISA KEV have associated SOAR mitigations.</li>
        <li>Immutable offsite backup snapshots verified for SQL and Active Directory databases.</li>
        <li>Formal CISO audit trail generated and archived for annual SOC 2 compliance verification.</li>
      </ul>

      <div class="section-title">5. Threat Report References & Intelligence Sources</div>
      <ul style="font-size: 11px; color: #94a3b8; font-family: monospace; padding-left: 20px; line-height: 1.6;">
        <li>[1] CISA Known Exploited Vulnerabilities (KEV) Catalog & Binding Operational Directive 22-01.</li>
        <li>[2] ISO/IEC 27001:2022 Information Security Management Standards.</li>
        <li>[3] SOC 2 Type II Trust Services Criteria (CC6.8 Security & Availability).</li>
      </ul>
      `
      }
    </div>

    <div class="footer">
      CONFIDENTIAL SECURITY DISCLOSURE • Generated by Tejax AI Powered Cyber Intelligence Engine<br>
      Format: ${templateStyle.toUpperCase()} Persona • Time: ${new Date().toISOString()}
    </div>
  </div>
</body>
</html>`;
  };

  // Generate Markdown Version of Template based on Persona Style
  const generateMarkdownTemplate = () => {
    const isExec = templateStyle === 'executive';
    const isTech = templateStyle === 'technical';
    const isComp = templateStyle === 'compliance';
    const tlpCfg = getTlpConfig(tlp);

    const tlpBlock = `> **TLP CLASSIFICATION: ${tlpCfg.level}** (${tlpCfg.recipientScope})  
> **Sharing Boundary:** ${tlpCfg.sharingBoundary}  
> **Standard:** FIRST TLP 2.0 Protocol  

`;

    if (isExec) {
      return `# TEJAX AI • EXECUTIVE C-LEVEL THREAT BRIEFING

${tlpBlock}**Organization:** ${organizationName}
**Time Window:** ${timeWindow}
**Recipient:** ${recipientEmail}
**TLP:** \`${tlpCfg.level}\`
**Format:** Executive C-Level Risk Assessment

---

## 1. Executive Summary & Business Risk Impact
${customExecutiveNote}

## 2. Primary MITRE ATT&CK TTP & Kill Chain Vectors
- **Primary MITRE TTP:** \`T1003.001\` - LSASS Memory Dumping
- **Kill Chain Stage:** \`Credential Access / Exploitation\`
- **Active APT Threat Groups:** APT28, Lazarus Group, LockBit 3.0, Scattered Spider

## 3. Strategic Risk Metrics
- **Overall Enterprise Risk Score:** 98 / 100 (CRITICAL)
- **Estimated Financial Exposure Prevented:** $14.2M via Automated SOAR Isolation
- **SLA Incident Adherence:** 98.2%

## 4. Board-Level Recommendations
1. Approve emergency deployment of Windows Security Update KB5038912.
2. Authorize mandatory credential rotation for IAM service accounts.
3. Enforce admin-only approval for Entra ID OAuth integrations.

## 5. Threat Report References & Intelligence Sources
- [1] CISA Cybersecurity Advisory (AA26-085A): Active Exploitation of LSASS Memory Handles.
- [2] MITRE ATT&CK Enterprise Framework (v15.1): T1003.001 (OS Credential Dumping).
- [3] NIST Special Publication 800-61 Rev. 2: Computer Security Incident Handling Guide.

---
*Generated by Tejax AI Cyber Intelligence Engine*
`;
    }

    if (isTech) {
      return `# TEJAX AI • TECHNICAL SOC & EDR TELEMETRY REPORT

${tlpBlock}**Organization:** ${organizationName}
**Time Window:** ${timeWindow}
**Recipient:** ${recipientEmail}
**TLP:** \`${tlpCfg.level}\`
**Defang Status:** ${isDefanged ? 'DEFANGED (SAFE)' : 'RAW'}

---

## 1. Technical Incident Breakdown
${customExecutiveNote}

## 2. Top Critical CVEs, MITRE TTPs & Kill Chain Vectors
${sampleCves.map((c) => `- **${c.cve}** (CVSS ${c.cvss}): ${c.title}\n  - **MITRE TTP:** \`${c.mitreTtp}\`\n  - **Kill Chain:** \`${c.killChainStage}\`\n  - *Status: ${c.status}*`).join('\n\n')}

## 3. Indicators of Compromise (IOCs)
**Malicious IPs:**
${displayIps.map((ip) => `- \`${ip}\``).join('\n')}

**C2 Domains:**
${displayDomains.map((dom) => `- \`${dom}\``).join('\n')}

**SHA-256 Hashes:**
${sampleHashes.map((h) => `- \`${h}\``).join('\n')}

## 4. EDR / Sysmon Detection Rules
- Sysmon EventCode 10 GrantedAccess=0x1010 detected for mimikatz.exe.
- PowerShell vssadmin.exe delete shadows intercepted.

## 5. Threat Report References & Intelligence Sources
- [1] MITRE ATT&CK TTP Mapping: T1003.001, T1490, T1528.
- [2] STIX 2.1 CTI Feed Indicator Bundle (SHA-256 Hashes & C2 IPs).
- [3] Sigma Rule Signatures: Windows Security Log & Sysmon Telemetry.

---
*Generated by Tejax AI Cyber Intelligence Engine*
`;
    }

    return `# TEJAX AI • REGULATORY COMPLIANCE & CISA KEV AUDIT

${tlpBlock}**Organization:** ${organizationName}
**Time Window:** ${timeWindow}
**Recipient:** ${recipientEmail}
**TLP:** \`${tlpCfg.level}\`
**Format:** Compliance / CISA Audit

---

## 1. Compliance Audit Scope
${customExecutiveNote}

## 2. Primary MITRE ATT&CK TTP & Kill Chain Mapping
- **Primary MITRE ATT&CK TTP:** \`T1003.001\` (Credential Access) & \`T1490\` (Impact)
- **Kill Chain Phase Coverage:** \`Exploitation, Credential Access, Impact\`
- **CISA KEV Vulnerabilities:** 3 Actionable CVEs Mitigated

## 3. Regulatory Framework Mapping
- **CISA KEV Catalog:** 3 Actionable CVEs Mitigated
- **NIST CSF 2.0:** COMPLIANT (98%)
- **ISO/IEC 27001:2022 A.12.6.1:** VERIFIED
- **SOC 2 Type II CC6.8:** ATTESTED

## 4. Mandatory Control Verification
1. All unpatched CVSS 9.0+ vulnerabilities logged in CISA KEV have active SOAR mitigations.
2. Immutable offsite backups verified for SQL and Active Directory arrays.
3. Formal CISO audit trail archived for compliance verification.

## 5. Threat Report References & Intelligence Sources
- [1] CISA Known Exploited Vulnerabilities (KEV) Catalog & Binding Operational Directive 22-01.
- [2] ISO/IEC 27001:2022 Information Security Management Standards.
- [3] SOC 2 Type II Trust Services Criteria (CC6.8 Security & Availability).

---
*Generated by Tejax AI Cyber Intelligence Engine*
`;
  };

  const handleCopyCode = () => {
    const textToCopy = viewMode === 'markdown' ? generateMarkdownTemplate() : generateHtmlTemplate();
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestDispatch = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/dispatch-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          incidentTitle: `[DAILY 24H THREAT SUMMARY] ${organizationName} Security Briefing`,
          severity: 'CRITICAL',
          riskScore: 94,
          affectedHost: `${organizationName} Global Infrastructure`,
          executiveSummary: customExecutiveNote
        })
      });

      const data = await res.json();
      if (data.success) {
        setSendFeedback(`Test Daily 24h Summary Notification template dispatched to ${recipientEmail}`);
        setTimeout(() => setSendFeedback(null), 4000);
      } else {
        setSendFeedback('Failed to dispatch test notification email.');
      }
    } catch (e) {
      setSendFeedback('Error sending notification dispatch.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Last 24 Hours Daily Threat Report Summary Notification Template</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                TEMPLATE BUILDER
              </span>
              <TLPBadge level={tlp} size="sm" />
            </h3>
            <p className="text-xs text-slate-400">
              Customize, defang, preview, and dispatch the official 24-hour daily security threat summary template.
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Defang Toggle Bar */}
          <button
            onClick={() => setIsDefanged(!isDefanged)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-xs border transition-all ${
              isDefanged
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {isDefanged ? (
              <>
                <ToggleRight className="w-4 h-4 text-emerald-400" />
                <span>Defang: ON (hxxp / [.])</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-amber-400" />
                <span>Defang: OFF (Raw URLs)</span>
              </>
            )}
          </button>

          {/* Copy Template Code */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>

          {/* Download Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 text-xs font-semibold transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download Template</span>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {downloadDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 font-mono text-xs animate-fadeIn">
                <button
                  onClick={handleDownloadHtml}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download HTML</span>
                  </div>
                  <span className="text-[10px] text-slate-400">.html</span>
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>Download Markdown</span>
                  </div>
                  <span className="text-[10px] text-slate-400">.md</span>
                </button>

                <button
                  onClick={handleDownloadJsonConfig}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center justify-between border-t border-slate-800 pt-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Config JSON</span>
                  </div>
                  <span className="text-[10px] text-slate-400">.json</span>
                </button>
              </div>
            )}
          </div>

          {/* Send Test Dispatch Button */}
          <button
            onClick={handleTestDispatch}
            disabled={isSending}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-md shadow-cyan-500/20"
          >
            {isSending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 fill-slate-950" />
                <span>Dispatch Test Email</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {sendFeedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{sendFeedback}</span>
        </div>
      )}

      {/* Main Grid: Controls Panel (Left) & Live Preview Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls & Configuration Sidebar (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-300 uppercase font-mono tracking-wider text-[11px] flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>Template Parameters</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">24H SUMMARY</span>
          </div>

          {/* Template Style Preset Picker */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Template Style Persona:</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setTemplateStyle('executive')}
                className={`py-1.5 px-2 rounded font-mono font-bold text-[10px] text-center transition-all ${
                  templateStyle === 'executive'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                Executive C-Level
              </button>
              <button
                onClick={() => setTemplateStyle('technical')}
                className={`py-1.5 px-2 rounded font-mono font-bold text-[10px] text-center transition-all ${
                  templateStyle === 'technical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                Technical SOC
              </button>
              <button
                onClick={() => setTemplateStyle('compliance')}
                className={`py-1.5 px-2 rounded font-mono font-bold text-[10px] text-center transition-all ${
                  templateStyle === 'compliance'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                Compliance / CISA
              </button>
            </div>
          </div>

          {/* Customizable TLP Classification Picker */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-200 font-bold text-xs">Customise TLP Classification:</label>
              <span className="text-[9px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                FIRST TLP 2.0
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <TLPSelector
                value={tlp}
                onChange={setTlp}
                label="Template TLP"
                size="sm"
              />
              <span className="text-[10px] text-slate-400 font-mono">
                Scope: {getTlpConfig(tlp).recipientScope}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Sets sensitivity marking on generated executive templates, HTML/Markdown exports, and dispatches.
            </p>
          </div>

          {/* Target Email Input & Contact Roster Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-bold">Target Analyst Email:</label>
              <select
                onChange={(e) => {
                  if (e.target.value) setRecipientEmail(e.target.value);
                }}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-cyan-300 text-[10px] focus:outline-none focus:border-cyan-500 font-mono"
                defaultValue=""
              >
                <option value="" disabled>-- Select Contact Roster --</option>
                <option value="sharath.skt55@gmail.com">Sharath Kumar (Lead SOC Manager)</option>
                <option value="sysadmin@enterprise.com">Elena Rostova (Lead IAM Admin)</option>
                <option value="ciso-office@enterprise.com">Marcus Vance (CISO)</option>
                <option value="cloud-devsec@enterprise.com">Chen Wei (DevOps SecOps Lead)</option>
                <option value="ot-sec@enterprise.com">David O'Connor (OT Security Lead)</option>
                <option value="db-sec@enterprise.com">Aisha Patel (Lead DBA)</option>
                <option value="finance-it@enterprise.com">Financial Systems SecOps Team</option>
                <option value="dfir-tier2@enterprise.com">Sarah Jenkins (DFIR Lead)</option>
              </select>
            </div>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Organization Name */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Organization Name:</label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 24h Time Window Label */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Time Window Range:</label>
            <input
              type="text"
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Executive Summary Note Editor */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">24-Hour Executive Summary Text:</label>
            <textarea
              rows={4}
              value={customExecutiveNote}
              onChange={(e) => setCustomExecutiveNote(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-sans text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Variables Reference Legend */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-1 text-[10px] font-mono text-slate-400">
            <span className="font-bold text-cyan-400 block uppercase">Supported Dynamic Variables:</span>
            <div className="grid grid-cols-2 gap-1 text-slate-300">
              <span>{"{{ORGANIZATION}}"}</span>
              <span>{"{{TIME_WINDOW}}"}</span>
              <span>{"{{DEFANG_STATUS}}"}</span>
              <span>{"{{TOP_CVES_TABLE}}"}</span>
              <span>{"{{DEFANGED_IOCS}}"}</span>
              <span>{"{{REMEDIATION_STEPS}}"}</span>
            </div>
          </div>
        </div>

        {/* Live Preview / Source Workspace (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 flex flex-col min-h-[580px]">
          {/* View Mode Toolbar */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 rounded-t-xl">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-bold transition-all ${
                  viewMode === 'preview'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Rendered HTML View</span>
              </button>

              <button
                onClick={() => setViewMode('html')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-bold transition-all ${
                  viewMode === 'html'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>HTML Code</span>
              </button>

              <button
                onClick={() => setViewMode('markdown')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-bold transition-all ${
                  viewMode === 'markdown'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Markdown</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-slate-500">
              {viewMode === 'preview' ? 'HTML Email Client Simulation' : 'Source Code View'}
            </span>
          </div>

          {/* Main Display Area */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[580px]">
            {viewMode === 'preview' && (
              <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0b1329]">
                <iframe
                  title="Daily Threat Report Email Preview"
                  srcDoc={generateHtmlTemplate()}
                  className="w-full h-[520px] bg-transparent border-0"
                />
              </div>
            )}

            {viewMode === 'html' && (
              <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generateHtmlTemplate()}
              </pre>
            )}

            {viewMode === 'markdown' && (
              <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generateMarkdownTemplate()}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
