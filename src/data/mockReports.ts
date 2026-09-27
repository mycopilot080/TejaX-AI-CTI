import { ThreatReportData } from '../types/cti';

export const INITIAL_24H_REPORTS: ThreatReportData[] = [
  {
    id: 'REP-2026-001',
    title: 'APT28 LSASS Memory Handle Injection & Credential Harvesting Campaign',
    cveId: 'CVE-2026-21840',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    threatActor: 'APT28 (Fancy Bear / LazarusStealer)',
    timeWindow: 'Last 24 Hours',
    publishedAt: new Date(Date.now() - 1000 * 3600 * 4).toISOString(),
    mitreTtp: 'T1003.001 - OS Credential Dumping: LSASS Memory',
    killChainStage: 'Credential Access / Exploitation',
    reportType: 'daily_24h',
    executiveSummary:
      'Over the last 24 hours, Tejax Cyber Intelligence detected active zero-day exploitation targeting Windows Local Security Authority Subsystem Service (LSASS) across financial and defense sector endpoints. Threat actors are utilizing an unquoted buffer overflow to dump domain administrator credentials directly from kernel memory space.',
    technicalSummary:
      'The attack originates from memory allocation requests with GrantedAccess mask 0x1010 issued toward lsass.exe by unquoted binaries (e.g. mimikatz.exe, sekurlsa). Once injected, the malware hooks ntdll.dll routines to extract Kerberos TGT tickets and plaintext hashes, bypassing standard Windows Defender credentials guard policies on unpatched builds.',
    iocs: {
      ips: ['185.220.101.5', '175.45.176.8', '45.154.255.12'],
      domains: ['c2.darknet-nexus.ru', 'auth-verify-session.net'],
      hashes: [
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        '8f34b21901a89c201e91240189ab102941298401928401920194820192810192'
      ],
      processes: ['lsass.exe', 'mimikatz.exe', 'cmd.exe /c sekurlsa::logonpasswords']
    },
    recommendations: [
      'Apply Microsoft Security Update KB5038912 immediately across all Active Directory Domain Controllers.',
      'Enforce Credential Guard & Virtualization-based Security (VBS) on Windows Server 2022 builds.',
      'Deploy Splunk Detection Rule DET-EP-001 monitoring Sysmon EventCode 10 with targetImage lsass.exe.'
    ],
    references: [
      { title: 'CISA Alert AA24-192A: APT28 Zero-Day Exploitation', url: 'https://cisa.gov', source: 'CISA' },
      { title: 'Microsoft Security Response Center (MSRC)', url: 'https://msrc.microsoft.com', source: 'MSRC' }
    ]
  },
  {
    id: 'REP-2026-002',
    title: 'LockBit 3.0 Volume Shadow Copy Deletion & Double-Extortion Surge',
    cveId: 'CVE-2026-19451',
    severity: 'CRITICAL',
    cvssScore: 9.4,
    threatActor: 'LockBit 3.0 Syndicate',
    timeWindow: 'Last 24 Hours',
    publishedAt: new Date(Date.now() - 1000 * 3600 * 8).toISOString(),
    mitreTtp: 'T1490 - Inhibit System Recovery: Delete Volume Shadow Copies',
    killChainStage: 'Impact / Recovery Inhibition',
    reportType: 'daily_24h',
    executiveSummary:
      'A spike in automated vssadmin shadow deletions preceded by high-volume internal SMB traffic was detected across three healthcare asset enclaves. Adversaries deployed customized BlackMatter/LockBit crypters.',
    technicalSummary:
      'Execution flow initiates through obfuscated PowerShell commands invoking vssadmin.exe delete shadows /all /quiet and bcdedit /set {default} recoveryenabled No, followed by fast AES-256 multithreaded encryption of hypervisor VHDX disk images.',
    iocs: {
      ips: ['194.26.29.112', '91.215.85.19'],
      domains: ['lockbit-recovery-portal.onion', 'cdn-storage-cdn77.com'],
      hashes: ['f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2'],
      processes: ['vssadmin.exe', 'wmic.exe', 'powershell -e JABjAD0ATg...']
    },
    recommendations: [
      'Enable Immutable / Offsite Air-Gapped Backups for critical database clusters.',
      'Deploy AppLocker or Software Restriction Policies blocking non-system execution of vssadmin.exe.',
      'Isolate compromised domain controller nodes to stop lateral ransomware SMB propagation.'
    ],
    references: [
      { title: 'DFIR Labs Ransomware Advisory', url: 'https://thedfirreport.com', source: 'DFIR Labs' },
      { title: 'CERT/CC Vulnerability Note', url: 'https://www.kb.cert.org', source: 'CERT/CC' }
    ]
  },
  {
    id: 'REP-2026-003',
    title: 'Scattered Spider OAuth Consent Hijacking & Entra ID Identity Persistence',
    cveId: 'CVE-2026-30114',
    severity: 'HIGH',
    cvssScore: 9.1,
    threatActor: 'Scattered Spider (UNC3944)',
    timeWindow: 'Last 24 Hours',
    publishedAt: new Date(Date.now() - 1000 * 3600 * 14).toISOString(),
    mitreTtp: 'T1528 - Capture Access Token: OAuth Grant',
    killChainStage: 'Credential Access / Persistence',
    reportType: 'daily_24h',
    executiveSummary:
      'Cloud threat actor Scattered Spider has been observed registering rogue multitenant OAuth applications in Entra ID and Okta environments to gain persistent API access without triggering MFA alerts.',
    technicalSummary:
      'Targeted users receive phishing prompts requesting consent for unverified applications with high-privilege scopes such as Directory.ReadWrite.All and Mail.ReadWrite. Once granted, refresh tokens are exfiltrated to maintain continuous Graph API session persistence.',
    iocs: {
      ips: ['198.51.100.41', '45.154.255.99'],
      domains: ['oauth-snatcher-cloud.net', 'entra-auth-verify.com'],
      hashes: ['410368832386aaa8812903192019840192019482019281019284019201948201'],
      processes: ['Okta Gateway Sync', 'Graph API Consent Handler']
    },
    recommendations: [
      'Disable unverified user app consent in Microsoft Entra ID & Okta tenant settings.',
      'Audit existing Enterprise Applications for privileged Microsoft Graph API scopes.',
      'Enforce Admin Consent Workflows for all third-party integrations.'
    ],
    references: [
      { title: 'Microsoft MSRC OAuth Consent Abuse Guide', url: 'https://msrc.microsoft.com', source: 'Microsoft MSRC' },
      { title: 'CISA Identity Security Advisory', url: 'https://www.cisa.gov', source: 'CISA' }
    ]
  }
];

export const INITIAL_ONDEMAND_REPORTS: ThreatReportData[] = [
  {
    id: 'OD-REP-101',
    title: 'Advanced Ransomware & Zero-Day Memory Injection Campaign',
    cveId: 'CVE-2026-4912',
    severity: 'CRITICAL',
    cvssScore: 9.8,
    threatActor: 'APT-29 / CozyBear (On-Demand Synthesis)',
    timeWindow: 'Last 24 Hours',
    publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    mitreTtp: 'T1003.001 - OS Credential Dumping: LSASS Memory',
    killChainStage: 'Credential Access / Exploitation',
    reportType: 'on_demand',
    executiveSummary: 'Synthesized on-demand briefing analyzing multi-stage memory injection targeting enterprise LSASS handles and Active Directory domain controllers over the last 24 hours.',
    technicalSummary: 'Attackers leveraged unauthenticated RPC calls combined with custom process hollowing to evade endpoint detection and response (EDR) telemetry.',
    iocs: {
      ips: ['198.51.100.45', '185.220.101.8', '45.154.255.99'],
      domains: ['c2-ondemand-relay.net', 'update-telemetry-dispatch.org'],
      hashes: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '8f34b21901a89c201e91240189ab102941298401928401920194820192810192'],
      processes: ['lsass.exe', 'powershell.exe -enc', 'cmd.exe']
    },
    recommendations: [
      'Isolate affected host endpoints immediately via SOAR automated playbooks.',
      'Enforce Credential Guard and block malicious IoCs across perimeter firewalls.'
    ],
    references: [
      { title: 'Tejax On-Demand CTI Telemetry Analysis', url: 'https://cisa.gov', source: 'Tejax CTI Engine' }
    ]
  },
  {
    id: 'OD-REP-102',
    title: 'Cloud Kubernetes API Token Exfiltration via Misconfigured RBAC',
    cveId: 'CVE-2026-8831',
    severity: 'HIGH',
    cvssScore: 8.4,
    threatActor: 'Lazarus Group (On-Demand)',
    timeWindow: 'Last 12 Hours',
    publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    mitreTtp: 'T1078.004 - Valid Accounts: Cloud Accounts',
    killChainStage: 'Defense Evasion / Persistence',
    reportType: 'on_demand',
    executiveSummary: 'Automated 12-hour threat intelligence synthesis detecting unauthorized clusterrolebindings accessing Kubernetes secret vaults.',
    technicalSummary: 'Adversaries utilized compromised service account tokens to query kube-apiserver and exfiltrate production database credentials.',
    iocs: {
      ips: ['203.0.113.88', '198.18.0.11'],
      domains: ['kube-metrics-collector.io'],
      hashes: ['7c4a8d09f12b6e3a9c8f1234567890ab'],
      processes: ['kubectl', 'kube-apiserver']
    },
    recommendations: [
      'Audit all clusterrolebindings and revoke unused service account tokens.',
      'Enable Kubernetes audit log anomaly detection in SIEM.'
    ],
    references: [
      { title: 'Kubernetes Security Advisory', url: 'https://kubernetes.io', source: 'CNCF' }
    ]
  }
];

export const ALL_INITIAL_REPORTS: ThreatReportData[] = [
  ...INITIAL_24H_REPORTS,
  ...INITIAL_ONDEMAND_REPORTS
];
