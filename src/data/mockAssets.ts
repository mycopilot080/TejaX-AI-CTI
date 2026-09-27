import { Asset } from '../types/cti';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'AST-001',
    hostname: 'DC-GLOBAL-01',
    ipAddress: '10.0.4.12',
    os: 'Windows Server 2022 Datacenter',
    environment: 'Production',
    tier: 'Tier 1 (Critical)',
    businessOwner: 'Identity & Active Directory Team',
    contactEmail: 'sysadmin@enterprise.com',
    contactPhone: '+1 (555) 018-9942',
    contactRole: 'Elena Rostova (Lead IAM Admin)',
    installedSoftware: [
      { name: 'Active Directory Domain Services', version: '10.0.20348' },
      { name: 'Local Security Authority Subsystem', version: '10.0.20348.1200' },
      { name: 'CrowdStrike Falcon Sensor', version: '7.12.1802' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-21840',
        title: 'Windows Kernel LSASS Memory Buffer Overflow Privilege Escalation',
        cvssScore: 9.8,
        severity: 'CRITICAL',
        affectedSoftware: 'Local Security Authority Subsystem v10.0.20348',
        patchStatus: 'UNPATCHED',
        cisaKevExploited: true,
        threatActorsExploiting: ['APT28 (Fancy Bear)', 'Lazarus Group'],
        remediationGuide: 'Apply Microsoft KB5038912 security patch immediately and enforce Credential Guard.'
      }
    ]
  },
  {
    id: 'AST-002',
    hostname: 'FINANCE-WS-09',
    ipAddress: '192.168.1.104',
    os: 'Windows 11 Enterprise 23H2',
    environment: 'Production',
    tier: 'Tier 2 (High)',
    businessOwner: 'Corporate Finance Ops',
    contactEmail: 'finance-it@enterprise.com',
    contactPhone: '+1 (555) 019-5500',
    contactRole: 'Financial Systems SecOps Team',
    installedSoftware: [
      { name: 'Windows Volume Shadow Copy Service', version: '10.0.22631' },
      { name: 'Microsoft PowerShell', version: '7.4.1' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-11099',
        title: 'LockBit 3.0 Shadow Copy Purge & Volume Encryption Vector',
        cvssScore: 9.6,
        severity: 'CRITICAL',
        affectedSoftware: 'Windows Volume Shadow Copy v10.0.22631',
        patchStatus: 'UNPATCHED',
        cisaKevExploited: true,
        threatActorsExploiting: ['LockBit Ransomware Affiliates'],
        remediationGuide: 'Enforce EDR rules restricting non-system execution of vssadmin.exe and wmic.exe.'
      }
    ]
  },
  {
    id: 'AST-003',
    hostname: 'OKTA-TENANT-PROXY',
    ipAddress: '198.51.100.41',
    os: 'Linux Ubuntu 24.04 LTS (Cloud Identity Proxy)',
    environment: 'Cloud AWS/Azure',
    tier: 'Tier 1 (Critical)',
    businessOwner: 'Cloud IAM Operations',
    contactEmail: 'iam-cloud@enterprise.com',
    contactPhone: '+1 (555) 018-9942',
    contactRole: 'Elena Rostova (Lead IAM Admin)',
    installedSoftware: [
      { name: 'Okta OAuth Authentication Gateway', version: '2.14.0' },
      { name: 'Entra ID Sync Service', version: '1.6.0' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 1).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-30114',
        title: 'OAuth Token Hijacking via Unverified Application Registrations',
        cvssScore: 9.1,
        severity: 'CRITICAL',
        affectedSoftware: 'Okta OAuth Gateway v2.14.0',
        patchStatus: 'UNPATCHED',
        cisaKevExploited: true,
        threatActorsExploiting: ['Scattered Spider (UNC3944)'],
        remediationGuide: 'Restrict user app consent workflows and audit Graph API high-privilege scopes.'
      }
    ]
  },
  {
    id: 'AST-004',
    hostname: 'FW-CORE-01',
    ipAddress: '185.220.101.5',
    os: 'Cisco ASA OS 9.18',
    environment: 'OT Infrastructure',
    tier: 'Tier 1 (Critical)',
    businessOwner: 'OT Network Operations',
    contactEmail: 'ot-sec@enterprise.com',
    contactPhone: '+1 (555) 017-3390',
    contactRole: 'David O\'Connor (OT Security Lead)',
    installedSoftware: [
      { name: 'Cisco AnyConnect SSL VPN', version: '4.10.0' },
      { name: 'Cisco ASA Firmware', version: '9.18.2' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 12).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-4401',
        title: 'Volt Typhoon LotL Memory Web Shell & SSH Tunneling Vulnerability',
        cvssScore: 8.8,
        severity: 'HIGH',
        affectedSoftware: 'Cisco ASA Firmware v9.18.2',
        patchStatus: 'UNPATCHED',
        cisaKevExploited: true,
        threatActorsExploiting: ['Volt Typhoon (BRONZE SILHOUETTE)'],
        remediationGuide: 'Upgrade ASA OS to 9.18.4+ and perform memory image integrity audit.'
      }
    ]
  },
  {
    id: 'AST-005',
    hostname: 'AWS-PROD-CT',
    ipAddress: '45.154.255.82',
    os: 'Amazon Linux 2023',
    environment: 'Cloud AWS/Azure',
    tier: 'Tier 1 (Critical)',
    businessOwner: 'DevOps Cloud Team',
    contactEmail: 'cloud-devsec@enterprise.com',
    contactPhone: '+1 (555) 014-8833',
    contactRole: 'Chen Wei (DevOps SecOps Lead)',
    installedSoftware: [
      { name: 'AWS CLI v2', version: '2.15.0' },
      { name: 'AWS CloudTrail Agent', version: '1.2.0' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 18).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-1088',
        title: 'AWS CloudTrail StopLogging IAM Policy Escalation',
        cvssScore: 8.5,
        severity: 'HIGH',
        affectedSoftware: 'AWS CloudTrail Agent v1.2.0',
        patchStatus: 'UNPATCHED',
        cisaKevExploited: false,
        threatActorsExploiting: ['FIN7'],
        remediationGuide: 'Apply Service Control Policy (SCP) explicitly denying cloudtrail:StopLogging.'
      }
    ]
  },
  {
    id: 'AST-006',
    hostname: 'K8S-INGRESS-GW01',
    ipAddress: '10.100.2.15',
    os: 'Ubuntu 22.04 LTS (Linux Kernel 6.5)',
    environment: 'DMZ Edge',
    tier: 'Tier 1 (Critical)',
    businessOwner: 'Cloud Platform Engineering',
    contactEmail: 'cloud-devsec@enterprise.com',
    contactPhone: '+1 (555) 014-8833',
    contactRole: 'Chen Wei (DevOps SecOps Lead)',
    installedSoftware: [
      { name: 'NGINX Ingress Controller', version: '1.9.4' },
      { name: 'Kubernetes API Server', version: '1.28.2' },
      { name: 'OpenSSL', version: '3.0.2' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 3).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-5510',
        title: 'HTTP/2 Rapid Reset Request Amplification Denial of Service',
        cvssScore: 8.2,
        severity: 'HIGH',
        affectedSoftware: 'NGINX Ingress v1.9.4',
        patchStatus: 'PATCH_SCHEDULED',
        cisaKevExploited: true,
        threatActorsExploiting: ['Killnet', 'Anonymous Sudan'],
        remediationGuide: 'Apply keepalive_requests rate limit patch and upgrade to NGINX 1.9.6.'
      }
    ]
  },
  {
    id: 'AST-007',
    hostname: 'PG-CUSTOMER-DB',
    ipAddress: '10.0.12.88',
    os: 'Red Hat Enterprise Linux 9.3',
    environment: 'Production',
    tier: 'Tier 1 (Critical)',
    businessOwner: 'Core Data Engineering',
    contactEmail: 'db-sec@enterprise.com',
    contactPhone: '+1 (555) 012-7721',
    contactRole: 'Aisha Patel (Lead DBA)',
    installedSoftware: [
      { name: 'PostgreSQL Server', version: '16.1' },
      { name: 'pgCrypto Module', version: '1.3' },
      { name: 'pgaudit Log Collector', version: '1.7.0' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 6).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-1899',
        title: 'PostgreSQL SQL Injection in libpq Environment Variable Parser',
        cvssScore: 8.9,
        severity: 'HIGH',
        affectedSoftware: 'PostgreSQL Server v16.1',
        patchStatus: 'UNPATCHED',
        cisaKevExploited: false,
        threatActorsExploiting: ['APT41'],
        remediationGuide: 'Sanitize environment connection strings and upgrade to PostgreSQL 16.3.'
      }
    ]
  },
  {
    id: 'AST-008',
    hostname: 'SAP-ERP-PROD-01',
    ipAddress: '10.0.50.10',
    os: 'SUSE Linux Enterprise Server 15 SP5',
    environment: 'Production',
    tier: 'Tier 1 (Critical)',
    businessOwner: 'Enterprise ERP Operations',
    contactEmail: 'db-sec@enterprise.com',
    contactPhone: '+1 (555) 012-7721',
    contactRole: 'Aisha Patel (Lead DBA)',
    installedSoftware: [
      { name: 'SAP S/4HANA Application Server', version: '2023.1' },
      { name: 'SAP NetWeaver AS ABAP', version: '7.57' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 14).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-3912',
        title: 'SAP NetWeaver ABAP Remote Code Execution via RFCPING Service',
        cvssScore: 9.9,
        severity: 'CRITICAL',
        affectedSoftware: 'SAP NetWeaver AS ABAP v7.57',
        patchStatus: 'UNPATCHED',
        cisaKevExploited: true,
        threatActorsExploiting: ['Lazarus Group', 'UNC2891'],
        remediationGuide: 'Apply SAP Security Note 3418921 and restrict Gateway RFC access control lists.'
      }
    ]
  },
  {
    id: 'AST-009',
    hostname: 'SCADA-PLC-SUB-04',
    ipAddress: '172.16.40.12',
    os: 'Siemens SIMATIC OS / VxWorks 7',
    environment: 'OT Infrastructure',
    tier: 'Tier 1 (Critical)',
    businessOwner: 'OT Industrial Field Tech',
    contactEmail: 'ot-sec@enterprise.com',
    contactPhone: '+1 (555) 017-3390',
    contactRole: 'David O\'Connor (OT Security Lead)',
    installedSoftware: [
      { name: 'Siemens S7-1500 Firmware', version: 'v2.9.2' },
      { name: 'Profinet Stack', version: 'v4.1' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 20).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-0044',
        title: 'Siemens S7-1500 PLC Malformed Profinet Packet DoS Vulnerability',
        cvssScore: 7.5,
        severity: 'HIGH',
        affectedSoftware: 'Siemens S7-1500 Firmware v2.9.2',
        patchStatus: 'MITIGATED',
        cisaKevExploited: false,
        threatActorsExploiting: ['SANDWORM (Electrum)'],
        remediationGuide: 'Deploy Industrial Firewall OT inspection rules filtering unauthenticated Profinet frames.'
      }
    ]
  },
  {
    id: 'AST-010',
    hostname: 'DEV-JENKINS-CI',
    ipAddress: '10.200.5.44',
    os: 'Debian 12 Bookworm',
    environment: 'Staging',
    tier: 'Tier 2 (High)',
    businessOwner: 'DevOps & Build Automation',
    contactEmail: 'cloud-devsec@enterprise.com',
    contactPhone: '+1 (555) 014-8833',
    contactRole: 'Chen Wei (DevOps SecOps Lead)',
    installedSoftware: [
      { name: 'Jenkins Automation Server', version: '2.426.1' },
      { name: 'Docker Engine', version: '24.0.7' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 8).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-1120',
        title: 'Jenkins CLI Arbitrary File Read & Secret Key Exfiltration',
        cvssScore: 9.8,
        severity: 'CRITICAL',
        affectedSoftware: 'Jenkins Automation Server v2.426.1',
        patchStatus: 'UNPATCHED',
        cisaKevExploited: true,
        threatActorsExploiting: ['8220 Gang', 'MinerBot'],
        remediationGuide: 'Disable Jenkins CLI capability immediately or upgrade Jenkins to v2.426.3.'
      }
    ]
  },
  {
    id: 'AST-011',
    hostname: 'SWIFT-PAYMENT-GW',
    ipAddress: '10.0.99.5',
    os: 'Red Hat Enterprise Linux 8.9',
    environment: 'Production',
    tier: 'Tier 1 (Critical)',
    businessOwner: 'Financial Technology Ops',
    contactEmail: 'finance-it@enterprise.com',
    contactPhone: '+1 (555) 019-5500',
    contactRole: 'Financial Systems SecOps Team',
    installedSoftware: [
      { name: 'SWIFT Alliance Access', version: '7.6' },
      { name: 'Hardware Security Module (HSM) Client', version: '3.2.1' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 4).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-8801',
        title: 'OpenSSL TLS Session Resumption Buffer Overread',
        cvssScore: 7.8,
        severity: 'HIGH',
        affectedSoftware: 'OpenSSL 1.1.1u / SWIFT Gateway',
        patchStatus: 'PATCHED',
        cisaKevExploited: false,
        remediationGuide: 'System fully patched to OpenSSL 1.1.1w with HSM hardware verification.'
      }
    ]
  },
  {
    id: 'AST-012',
    hostname: 'EXEC-MACBOOK-03',
    ipAddress: '192.168.10.82',
    os: 'macOS Sequoia 15.1',
    environment: 'Production',
    tier: 'Tier 3 (Medium)',
    businessOwner: 'Executive Leadership Team',
    contactEmail: 'dfir-tier2@enterprise.com',
    contactPhone: '+1 (555) 016-6644',
    contactRole: 'Sarah Jenkins (DFIR Specialist)',
    installedSoftware: [
      { name: 'Jamf Pro Agent', version: '10.49.0' },
      { name: 'CrowdStrike Falcon Sensor macOS', version: '7.10.12' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * 10).toISOString(),
    vulnerabilities: [
      {
        cveId: 'CVE-2026-4090',
        title: 'macOS Gatekeeper Bypass via Crafted WebArchive File',
        cvssScore: 6.5,
        severity: 'MEDIUM',
        affectedSoftware: 'macOS Sequoia 15.1',
        patchStatus: 'UNPATCHED',
        cisaKevExploited: false,
        remediationGuide: 'Apply macOS 15.1.1 Supplemental Update via Jamf MDM policy.'
      }
    ]
  }
];
