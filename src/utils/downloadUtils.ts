import { ThreatReportData, ThreatDigestData, defangIp, defangDomain } from '../components/ThreatReports';
import { getTlpConfig } from '../types/tlp';

/**
 * Universal helper to trigger a browser download from raw string content.
 */
export function downloadFile(content: string, filename: string, contentType: string = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download a Threat Report as a self-contained, styled HTML document.
 */
export function downloadReportAsHtml(report: ThreatReportData, isDefanged: boolean = true) {
  const formatIp = (ip: string) => (isDefanged ? defangIp(ip) : ip);
  const formatDomain = (dom: string) => (isDefanged ? defangDomain(dom) : dom);
  const tlpConfig = getTlpConfig(report.tlp);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.cveId} - ${report.title} [${tlpConfig.level}]</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1329; color: #e2e8f0; margin: 0; padding: 30px; line-height: 1.6; }
    .container { max-width: 820px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-family: monospace; font-weight: bold; margin-right: 8px; margin-bottom: 6px; }
    .badge-cve { background: #0c4a6e; color: #38bdf8; border: 1px solid #0284c7; }
    .badge-cvss { background: #7f1d1d; color: #fca5a5; border: 1px solid #dc2626; }
    .badge-defang { background: #064e3b; color: #34d399; border: 1px solid #059669; }
    .tlp-banner { background-color: ${tlpConfig.bannerBgColor}; border: 1px solid ${tlpConfig.bannerBorderColor}; border-left: 6px solid ${tlpConfig.hexColor}; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-family: monospace; }
    .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 12px 0 8px 0; }
    .meta { font-size: 12px; color: #94a3b8; font-family: monospace; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; margin-top: 28px; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 6px; }
    .box { background: #1e293b; border-radius: 8px; padding: 16px; font-size: 13px; color: #cbd5e1; border-left: 4px solid #0284c7; }
    .tech-box { background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 12px; color: #38bdf8; }
    .ioc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
    .ioc-card { background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11px; }
    .ioc-label { color: #64748b; font-size: 10px; font-weight: bold; display: block; margin-bottom: 6px; text-transform: uppercase; }
    .ioc-item { color: #f43f5e; word-break: break-all; margin-bottom: 4px; }
    .ioc-item-domain { color: #f59e0b; word-break: break-all; margin-bottom: 4px; }
    .ioc-item-hash { color: #38bdf8; word-break: break-all; margin-bottom: 4px; font-size: 10px; }
    ul { padding-left: 20px; margin: 0; font-size: 13px; color: #cbd5e1; }
    li { margin-bottom: 8px; }
    .ref-link { display: inline-block; background: #1e293b; color: #38bdf8; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; margin-right: 8px; margin-bottom: 8px; border: 1px solid #334155; }
    .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b; font-family: monospace; }
    @media print {
      body { background-color: #ffffff; color: #000000; padding: 0; }
      .container { border: none; box-shadow: none; background: #ffffff; color: #000000; }
      .box, .tech-box, .ioc-card { background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; }
      .title { color: #0f172a; }
      .section-title { color: #0284c7; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- FIRST TLP 2.0 CLASSIFICATION BANNER -->
    <div class="tlp-banner">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <span style="color: ${tlpConfig.textColor}; font-weight: bold; font-size: 13px; letter-spacing: 0.5px;">
          TRAFFIC LIGHT PROTOCOL: ${tlpConfig.level} &bull; ${tlpConfig.recipientScope.toUpperCase()}
        </span>
        <span style="font-size: 10px; color: #94a3b8; background: #020617; padding: 2px 8px; border-radius: 4px; border: 1px solid #1e293b;">
          FIRST TLP 2.0 STANDARD
        </span>
      </div>
      <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
        <strong>Sharing Protocol:</strong> ${tlpConfig.sharingBoundary}
      </div>
    </div>

    <div class="header">
      <div>
        <span class="badge" style="background: ${tlpConfig.bannerBgColor}; color: ${tlpConfig.textColor}; border: 1px solid ${tlpConfig.bannerBorderColor}; font-weight: bold;">
          ${tlpConfig.level}
        </span>
        <span class="badge badge-cve">${report.cveId}</span>
        <span class="badge badge-cvss">CVSS ${report.cvssScore} ${report.severity}</span>
        <span class="badge badge-defang">${isDefanged ? 'DEFANGED (SAFE)' : 'RAW UNGUARDED'}</span>
      </div>
      <h1 class="title">${report.title}</h1>
      <div class="meta">
        ATTRIBUTED THREAT ACTOR: ${report.threatActor} &nbsp;|&nbsp; WINDOW: ${report.timeWindow} &nbsp;|&nbsp; PUBLISHED: ${new Date(report.publishedAt).toUTCString()}
      </div>
    </div>

    <div class="section-title">1. Executive Summary</div>
    <div class="box">${report.executiveSummary}</div>

    <div class="section-title">2. MITRE ATT&CK TTP & Cyber Kill Chain Stage</div>
    <div class="box" style="border-left-color: #f43f5e; font-family: monospace;">
      <strong>MITRE TTP:</strong> <span style="color: #f43f5e;">${report.mitreTtp}</span><br>
      <strong>Kill Chain Stage:</strong> <span style="color: #34d399;">${report.killChainStage}</span>
    </div>

    <div class="section-title">3. Technical Deep-Dive Summary</div>
    <div class="tech-box">${report.technicalSummary}</div>

    <div class="section-title">4. Indicators of Compromise (IOCs) - ${isDefanged ? 'Defanged' : 'Raw'}</div>
    <div class="ioc-grid">
      <div class="ioc-card">
        <span class="ioc-label">Malicious IP Addresses:</span>
        ${report.iocs.ips.map((ip) => `<div class="ioc-item">${formatIp(ip)}</div>`).join('')}
      </div>
      <div class="ioc-card">
        <span class="ioc-label">Command & Control Domains:</span>
        ${report.iocs.domains.map((d) => `<div class="ioc-item-domain">${formatDomain(d)}</div>`).join('')}
      </div>
    </div>
    <div class="ioc-card" style="margin-top: 12px;">
      <span class="ioc-label">Payload SHA-256 Hashes:</span>
      ${report.iocs.hashes.map((h) => `<div class="ioc-item-hash">${h}</div>`).join('')}
    </div>
    <div class="ioc-card" style="margin-top: 12px;">
      <span class="ioc-label">Process Execution Vectors:</span>
      ${report.iocs.processes.map((p) => `<div style="color: #cbd5e1; margin-bottom: 4px;">${p}</div>`).join('')}
    </div>

    <div class="section-title">5. Actionable Mitigation Recommendations</div>
    <ul>
      ${report.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
    </ul>

    <div class="section-title">6. Intelligence Citations & References</div>
    <div>
      ${report.references.map((r) => `<a href="${r.url}" target="_blank" class="ref-link"><strong>[${r.source}]</strong> ${r.title}</a>`).join('')}
    </div>

    <div class="footer">
      TEJAX AI &bull; CYBER INTELLIGENCE 24H DISCLOSURE REPORT &bull; ${tlpConfig.level}<br>
      CONFIDENTIAL SECURITY AUDIT DATA &bull; Generated ${new Date().toISOString()}
    </div>
  </div>
</body>
</html>`;

  const filename = `${report.cveId}_24h_Threat_Report_${tlpConfig.code}_${isDefanged ? 'Defanged' : 'Raw'}.html`;
  downloadFile(htmlContent, filename, 'text/html');
}

/**
 * Download Threat Report as Markdown document.
 */
export function downloadReportAsMarkdown(report: ThreatReportData, isDefanged: boolean = true) {
  const formatIp = (ip: string) => (isDefanged ? defangIp(ip) : ip);
  const formatDomain = (dom: string) => (isDefanged ? defangDomain(dom) : dom);
  const tlpConfig = getTlpConfig(report.tlp);

  const mdContent = `# ${report.title}

> **CLASSIFICATION: ${tlpConfig.level}** (${tlpConfig.recipientScope})  
> **Sharing Boundary:** ${tlpConfig.sharingBoundary}

**CVE Identifier:** \`${report.cveId}\`  
**Severity:** ${report.severity} (CVSS ${report.cvssScore})  
**Threat Actor:** ${report.threatActor}  
**Time Window:** ${report.timeWindow}  
**TLP Marking:** \`${tlpConfig.level}\`  
**Defang Mode:** ${isDefanged ? 'DEFANGED (SAFE)' : 'RAW UNGUARDED'}  
**Published:** ${new Date(report.publishedAt).toUTCString()}  

---

## 1. Executive Summary
${report.executiveSummary}

## 2. MITRE ATT&CK TTP & Cyber Kill Chain Stage
- **MITRE TTP:** \`${report.mitreTtp}\`
- **Kill Chain Stage:** \`${report.killChainStage}\`

## 3. Technical Summary
${report.technicalSummary}

## 4. Indicators of Compromise (IOCs) [${isDefanged ? 'Defanged' : 'Raw Mode'}]

### Malicious IP Addresses
${report.iocs.ips.map((ip) => `- \`${formatIp(ip)}\``).join('\n')}

### C2 Domains
${report.iocs.domains.map((dom) => `- \`${formatDomain(dom)}\``).join('\n')}

### SHA-256 Hashes
${report.iocs.hashes.map((h) => `- \`${h}\``).join('\n')}

### Process Execution Vectors
${report.iocs.processes.map((p) => `- \`${p}\``).join('\n')}

## 5. Prioritized Mitigation Recommendations
${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## 6. Citations & References
${report.references.map((ref) => `- [${ref.source}: ${ref.title}](${ref.url})`).join('\n')}

---
*Classification: ${tlpConfig.level} &bull; Generated by Tejax AI Cyber Intelligence Engine on ${new Date().toISOString()}*
`;

  const filename = `${report.cveId}_24h_Threat_Report_${tlpConfig.code}_${isDefanged ? 'Defanged' : 'Raw'}.md`;
  downloadFile(mdContent, filename, 'text/markdown');
}

/**
 * Download Threat Report as PDF (triggers print dialog / PDF export).
 */
export function downloadReportAsPdf(report: ThreatReportData, isDefanged: boolean = true) {
  downloadReportAsHtml(report, isDefanged);
  setTimeout(() => {
    window.print();
  }, 400);
}

/**
 * Download Threat Report as STIX 2.1 Threat Intelligence JSON Bundle.
 */
export function downloadReportAsStixJson(report: ThreatReportData, isDefanged: boolean = true) {
  const formatIp = (ip: string) => (isDefanged ? defangIp(ip) : ip);
  const formatDomain = (dom: string) => (isDefanged ? defangDomain(dom) : dom);
  const tlpConfig = getTlpConfig(report.tlp);

  const bundleId = `bundle--${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
  const reportId = `report--${crypto.randomUUID ? crypto.randomUUID() : Date.now() + 1}`;
  const actorId = `threat-actor--${crypto.randomUUID ? crypto.randomUUID() : Date.now() + 2}`;

  const stixBundle = {
    type: 'bundle',
    id: bundleId,
    spec_version: '2.1',
    objects: [
      tlpConfig.stixMarkingDefinition,
      {
        type: 'threat-actor',
        spec_version: '2.1',
        id: actorId,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        name: report.threatActor,
        threat_actor_types: ['cybercrime', 'state-sponsored'],
        labels: ['threat-actor', report.cveId],
        object_marking_refs: [tlpConfig.stixMarkingRef]
      },
      {
        type: 'report',
        spec_version: '2.1',
        id: reportId,
        created: new Date(report.publishedAt).toISOString(),
        modified: new Date().toISOString(),
        name: report.title,
        description: report.executiveSummary,
        report_types: ['threat-report', 'vulnerability-advisory'],
        published: new Date().toISOString(),
        object_refs: [actorId],
        object_marking_refs: [tlpConfig.stixMarkingRef],
        custom_properties: {
          cve_id: report.cveId,
          cvss_score: report.cvssScore,
          severity: report.severity,
          tlp: tlpConfig.level,
          tlp_scope: tlpConfig.recipientScope,
          defang_status: isDefanged ? 'DEFANGED' : 'RAW',
          technical_summary: report.technicalSummary,
          iocs: {
            ips: report.iocs.ips.map(formatIp),
            domains: report.iocs.domains.map(formatDomain),
            hashes: report.iocs.hashes,
            processes: report.iocs.processes
          },
          recommendations: report.recommendations,
          references: report.references
        }
      }
    ]
  };

  const filename = `${report.cveId}_STIX21_${tlpConfig.code}_${isDefanged ? 'Defanged' : 'Raw'}.json`;
  downloadFile(JSON.stringify(stixBundle, null, 2), filename, 'application/json');
}

/**
 * Download IOCs as CSV file with TLP classification column.
 */
export function downloadIocsCsv(report: ThreatReportData, isDefanged: boolean = true) {
  const formatIp = (ip: string) => (isDefanged ? defangIp(ip) : ip);
  const formatDomain = (dom: string) => (isDefanged ? defangDomain(dom) : dom);
  const tlpConfig = getTlpConfig(report.tlp);

  const rows = [
    ['Type', 'Value', 'CVE_ID', 'TLP_Marking', 'Threat_Actor', 'Defang_Status', 'Time_Window']
  ];

  report.iocs.ips.forEach((ip) => {
    rows.push(['IPv4', formatIp(ip), report.cveId, tlpConfig.level, report.threatActor, isDefanged ? 'DEFANGED' : 'RAW', report.timeWindow]);
  });

  report.iocs.domains.forEach((dom) => {
    rows.push(['Domain', formatDomain(dom), report.cveId, tlpConfig.level, report.threatActor, isDefanged ? 'DEFANGED' : 'RAW', report.timeWindow]);
  });

  report.iocs.hashes.forEach((hash) => {
    rows.push(['SHA256_Hash', hash, report.cveId, tlpConfig.level, report.threatActor, isDefanged ? 'DEFANGED' : 'RAW', report.timeWindow]);
  });

  report.iocs.processes.forEach((proc) => {
    rows.push(['Process_Vector', proc.replace(/,/g, ';'), report.cveId, tlpConfig.level, report.threatActor, isDefanged ? 'DEFANGED' : 'RAW', report.timeWindow]);
  });

  const csvContent = rows.map((r) => r.join(',')).join('\n');
  const filename = `${report.cveId}_IOCs_${tlpConfig.code}_${isDefanged ? 'Defanged' : 'Raw'}.csv`;
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export all 24h reports in JSON bundle.
 */
export function downloadAllReportsJson(reports: ThreatReportData[], isDefanged: boolean = true) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalReports: reports.length,
    defangedMode: isDefanged,
    reports: reports.map((r) => {
      const cfg = getTlpConfig(r.tlp);
      return {
        ...r,
        tlp: cfg.level,
        tlpScope: cfg.recipientScope,
        iocs: {
          ips: r.iocs.ips.map((ip) => (isDefanged ? defangIp(ip) : ip)),
          domains: r.iocs.domains.map((dom) => (isDefanged ? defangDomain(dom) : dom)),
          hashes: r.iocs.hashes,
          processes: r.iocs.processes
        }
      };
    })
  };

  const filename = `Tejax_24H_Threat_Reports_Bundle_${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
}

/**
 * Download a Threat Intelligence Digest (Daily, Weekly, Monthly) as styled HTML document.
 */
export function downloadDigestAsHtml(digest: ThreatDigestData, isDefanged: boolean = true) {
  const formatIp = (ip: string) => (isDefanged ? defangIp(ip) : ip);
  const formatDomain = (dom: string) => (isDefanged ? defangDomain(dom) : dom);
  const tlpConfig = getTlpConfig(digest.tlp);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${digest.title} [${tlpConfig.level}] - Tejax Cyber Intelligence</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b1329; color: #e2e8f0; margin: 0; padding: 32px; line-height: 1.6; }
    .container { max-width: 860px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .tlp-banner { background-color: ${tlpConfig.bannerBgColor}; border: 1px solid ${tlpConfig.bannerBorderColor}; border-left: 6px solid ${tlpConfig.hexColor}; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-family: monospace; }
    .header { border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-family: monospace; font-weight: bold; margin-right: 8px; margin-bottom: 6px; }
    .badge-cadence { background: #083344; color: #38bdf8; border: 1px solid #0284c7; }
    .badge-threat { background: #450a0a; color: #f87171; border: 1px solid #ef4444; }
    .badge-defang { background: #064e3b; color: #34d399; border: 1px solid #059669; }
    .title { font-size: 24px; font-weight: 800; color: #ffffff; margin: 12px 0 6px 0; }
    .meta { font-size: 12px; color: #94a3b8; font-family: monospace; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
    .stat-card { background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 12px 16px; text-align: center; }
    .stat-num { font-size: 22px; font-weight: 800; color: #38bdf8; font-family: monospace; }
    .stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-top: 4px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; margin-top: 28px; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 6px; }
    .box { background: #1e293b; border-radius: 8px; padding: 16px; font-size: 13px; color: #cbd5e1; border-left: 4px solid #0284c7; }
    .list-item { background: #020617; border: 1px solid #1e293b; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; font-size: 12px; }
    .cve-card { background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; margin-bottom: 10px; }
    .actor-card { background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; margin-bottom: 10px; }
    .ioc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .ioc-card { background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11px; }
    .ioc-item { color: #f43f5e; margin-bottom: 4px; word-break: break-all; }
    .ioc-item-domain { color: #f59e0b; margin-bottom: 4px; word-break: break-all; }
    .ioc-item-hash { color: #38bdf8; margin-bottom: 4px; font-size: 10px; word-break: break-all; }
    .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <!-- FIRST TLP 2.0 CLASSIFICATION BANNER -->
    <div class="tlp-banner">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <span style="color: ${tlpConfig.textColor}; font-weight: bold; font-size: 13px; letter-spacing: 0.5px;">
          TRAFFIC LIGHT PROTOCOL: ${tlpConfig.level} &bull; ${tlpConfig.recipientScope.toUpperCase()}
        </span>
        <span style="font-size: 10px; color: #94a3b8; background: #020617; padding: 2px 8px; border-radius: 4px; border: 1px solid #1e293b;">
          FIRST TLP 2.0 PROTOCOL
        </span>
      </div>
      <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
        <strong>Sharing Boundary:</strong> ${tlpConfig.sharingBoundary}
      </div>
    </div>

    <div class="header">
      <div>
        <span class="badge" style="background: ${tlpConfig.bannerBgColor}; color: ${tlpConfig.textColor}; border: 1px solid ${tlpConfig.bannerBorderColor};">
          ${tlpConfig.level}
        </span>
        <span class="badge badge-cadence">${digest.cadence} DIGEST</span>
        <span class="badge badge-threat">THREAT LEVEL: ${digest.threatLevel}</span>
        <span class="badge badge-defang">${isDefanged ? 'DEFANGED (SAFE)' : 'RAW'}</span>
      </div>
      <h1 class="title">${digest.title}</h1>
      <div class="meta">
        TIME WINDOW: ${digest.timeWindowLabel} &nbsp;|&nbsp; RANGE: ${digest.startDate} - ${digest.endDate} &nbsp;|&nbsp; ID: ${digest.id}
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num">${digest.stats.cvesAnalyzed}</div>
        <div class="stat-label">CVEs Analyzed</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #f43f5e;">${digest.stats.criticalZeroDays}</div>
        <div class="stat-label">Critical Zero-Days</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #f59e0b;">${digest.stats.activeCampaigns}</div>
        <div class="stat-label">Active Campaigns</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #34d399;">${digest.stats.iocsBlocked}</div>
        <div class="stat-label">IOCs Blocked</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${digest.stats.mttdHours}h</div>
        <div class="stat-label">MTTD Avg</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color: #38bdf8;">${digest.stats.slaCompliancePercent}%</div>
        <div class="stat-label">SLA Compliance</div>
      </div>
    </div>

    <div class="section-title">1. Executive Summary</div>
    <div class="box">${digest.executiveSummary}</div>

    <div class="section-title">2. Key Threat Trends & Observations</div>
    ${digest.keyTrends.map((trend) => `<div class="list-item">&bull; ${trend}</div>`).join('')}

    <div class="section-title">3. Top Targeted CVEs & Ingress Vulnerabilities</div>
    ${digest.topTargetedCVEs
      .map(
        (c) => `
      <div class="cve-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: #38bdf8; font-family: monospace;">${c.cveId} - CVSS ${c.cvss} (${c.severity})</strong>
          ${c.cisaKev ? '<span style="background: #881337; color: #f43f5e; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">CISA KEV</span>' : ''}
        </div>
        <div style="font-size: 13px; font-weight: 600; color: #f8fafc; margin-bottom: 4px;">${c.title}</div>
        <div style="font-size: 12px; color: #94a3b8;"><strong>Affected:</strong> ${c.affectedSoftware} &nbsp;|&nbsp; <strong>Status:</strong> <span style="color: #f59e0b;">${c.exploitStatus}</span></div>
      </div>
    `
      )
      .join('')}

    <div class="section-title">4. Active Threat Actor Campaigns</div>
    ${digest.activeActorCampaigns
      .map(
        (a) => `
      <div class="actor-card">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <strong style="color: #f43f5e; font-size: 13px;">${a.actorName}</strong>
          <span style="color: #94a3b8; font-size: 11px; font-family: monospace;">${a.origin}</span>
        </div>
        <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 4px;"><strong>Target Sectors:</strong> ${a.targetSectors.join(', ')}</div>
        <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 4px;"><strong>Primary TTP:</strong> <span style="color: #38bdf8; font-family: monospace;">${a.primaryTTP}</span></div>
        <div style="font-size: 12px; color: #94a3b8;"><strong>Motivation:</strong> ${a.motivation}</div>
      </div>
    `
      )
      .join('')}

    <div class="section-title">5. Aggregated Defanged IOCs (${isDefanged ? 'Safe' : 'Raw'})</div>
    <div class="ioc-grid">
      <div class="ioc-card">
        <div style="color: #64748b; font-weight: bold; margin-bottom: 6px;">IP ADDRESSES:</div>
        ${digest.topIocs.ips.map((ip) => `<div class="ioc-item">${formatIp(ip)}</div>`).join('')}
      </div>
      <div class="ioc-card">
        <div style="color: #64748b; font-weight: bold; margin-bottom: 6px;">C2 DOMAINS:</div>
        ${digest.topIocs.domains.map((dom) => `<div class="ioc-item-domain">${formatDomain(dom)}</div>`).join('')}
      </div>
    </div>
    <div class="ioc-card" style="margin-top: 10px;">
      <div style="color: #64748b; font-weight: bold; margin-bottom: 6px;">SHA-256 HASHES:</div>
      ${digest.topIocs.hashes.map((h) => `<div class="ioc-item-hash">${h}</div>`).join('')}
    </div>

    <div class="section-title">6. Strategic Recommendations</div>
    ${digest.strategicRecommendations.map((rec) => `<div class="list-item">&check; ${rec}</div>`).join('')}

    <div class="section-title">7. Operational SOC Actions</div>
    ${digest.operationalActions.map((action) => `<div class="list-item">&#9889; ${action}</div>`).join('')}

    <div class="footer">
      Tejax AI Cyber Threat Intelligence Engine &bull; Confidential CISO Security Governance &bull; ${tlpConfig.level}<br>
      Generated ${new Date().toISOString()}
    </div>
  </div>
</body>
</html>`;

  const filename = `${digest.id}_${digest.cadence}_Threat_Digest_${tlpConfig.code}_${isDefanged ? 'Defanged' : 'Raw'}.html`;
  downloadFile(htmlContent, filename, 'text/html');
}

/**
 * Download a Threat Intelligence Digest as Markdown document.
 */
export function downloadDigestAsMarkdown(digest: ThreatDigestData, isDefanged: boolean = true) {
  const formatIp = (ip: string) => (isDefanged ? defangIp(ip) : ip);
  const formatDomain = (dom: string) => (isDefanged ? defangDomain(dom) : dom);
  const tlpConfig = getTlpConfig(digest.tlp);

  const mdContent = `# ${digest.title}

> **CLASSIFICATION: ${tlpConfig.level}** (${tlpConfig.recipientScope})  
> **Sharing Boundary:** ${tlpConfig.sharingBoundary}

**Cadence:** ${digest.cadence} | **Time Window:** ${digest.timeWindowLabel} (${digest.startDate} - ${digest.endDate})  
**Threat Level:** ${digest.threatLevel} | **TLP:** \`${tlpConfig.level}\` | **Defang Status:** ${isDefanged ? 'DEFANGED (SAFE)' : 'RAW'} | **Digest ID:** ${digest.id}  

---

## Key Metrics Summary
- **CVEs Analyzed:** ${digest.stats.cvesAnalyzed}
- **Critical Zero-Days:** ${digest.stats.criticalZeroDays}
- **Active Campaigns:** ${digest.stats.activeCampaigns}
- **IOCs Blocked at Perimeter:** ${digest.stats.iocsBlocked}
- **Mean Time to Detect (MTTD):** ${digest.stats.mttdHours} hours
- **SLA Compliance Rate:** ${digest.stats.slaCompliancePercent}%

---

## 1. Executive Summary
${digest.executiveSummary}

---

## 2. Key Threat Trends & Observations
${digest.keyTrends.map((t) => `- ${t}`).join('\n')}

---

## 3. Top Targeted CVEs & Vulnerabilities
${digest.topTargetedCVEs
  .map(
    (c) => `### ${c.cveId} - CVSS ${c.cvss} (${c.severity})${c.cisaKev ? ' [CISA KEV]' : ''}
- **Title:** ${c.title}
- **Affected:** ${c.affectedSoftware}
- **Status:** ${c.exploitStatus}`
  )
  .join('\n\n')}

---

## 4. Active Threat Actor Campaigns
${digest.activeActorCampaigns
  .map(
    (a) => `### ${a.actorName} (${a.origin})
- **Target Sectors:** ${a.targetSectors.join(', ')}
- **Primary TTP:** ${a.primaryTTP}
- **Motivation:** ${a.motivation}`
  )
  .join('\n\n')}

---

## 5. Indicators of Compromise (IOCs) - ${isDefanged ? 'Defanged' : 'Raw'}

### Malicious IP Addresses
\`\`\`
${digest.topIocs.ips.map(formatIp).join('\n')}
\`\`\`

### C2 Domains
\`\`\`
${digest.topIocs.domains.map(formatDomain).join('\n')}
\`\`\`

### Cryptographic Hashes (SHA-256)
\`\`\`
${digest.topIocs.hashes.join('\n')}
\`\`\`

---

## 6. Strategic Recommendations
${digest.strategicRecommendations.map((r) => `- [ ] ${r}`).join('\n')}

---

## 7. Operational Actions
${digest.operationalActions.map((a) => `- [ ] ${a}`).join('\n')}

---
*Classification: ${tlpConfig.level} &bull; Generated by Tejax AI Cyber Threat Intelligence Engine on ${new Date().toISOString()}*
`;

  const filename = `${digest.id}_${digest.cadence}_Threat_Digest_${tlpConfig.code}_${isDefanged ? 'Defanged' : 'Raw'}.md`;
  downloadFile(mdContent, filename, 'text/markdown');
}

/**
 * Print / Save Digest as PDF via browser print.
 */
export function downloadDigestAsPdf(digest: ThreatDigestData, isDefanged: boolean = true) {
  downloadDigestAsHtml(digest, isDefanged);
}
