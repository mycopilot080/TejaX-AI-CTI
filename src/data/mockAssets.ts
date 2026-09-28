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
  ...Array.from({ length: 74 }).map((_, i) => ({
    id: `AST-G-${i + 2}`,
    hostname: `GUARDED-HOST-${(i + 2).toString().padStart(3, '0')}`,
    ipAddress: `10.50.${Math.floor(i / 254)}.${(i % 254) + 1}`,
    os: 'Ubuntu 24.04 LTS (Hardened)',
    environment: 'Production',
    tier: 'Tier 3 (Medium)',
    businessOwner: 'Infrastructure Security Ops',
    contactEmail: 'secops-guarded@enterprise.com',
    installedSoftware: [
      { name: 'OSquery Agent', version: '5.11.0' },
      { name: 'Wazuh EDR', version: '4.7.2' }
    ],
    lastScanTimestamp: new Date(Date.now() - 1000 * 3600 * (i % 24)).toISOString(),
    vulnerabilities: []
  })) as Asset[]
];

