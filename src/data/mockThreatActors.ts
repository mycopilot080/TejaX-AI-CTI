import { IndustryThreatActor } from '../types/cti';

export const INITIAL_INDUSTRY_THREAT_ACTORS: IndustryThreatActor[] = [
  {
    id: 'ACTOR-001',
    actorName: 'Lazarus Group (UNC2891 / Hidden Cobra)',
    aliases: ['Guardians of Peace', 'APT38', 'BlueNoroff'],
    origin: 'North Korea (DPRK State-Sponsored)',
    targetIndustry: 'Financial Services',
    motivation: 'Financial Gain',
    primaryTTPs: [
      'T1003 - Credential Dumping (LSASS)',
      'T1059 - Command & Scripting Execution',
      'T1566 - SWIFT Banking Network Targeting'
    ],
    associatedMalware: ['FastCash', 'AppleJeus', 'Mimikatz', 'BlindedEagle'],
    cveTargets: ['CVE-2026-3912', 'CVE-2026-21840'],
    activityLevel: 'HIGH',
    riskScore: 96,
    description: 'Highly sophisticated nation-state threat group conducting high-value financial heists, cryptocurrency exchange breaches, and SWIFT payment gateway manipulation.',
    recommendedDefenses: [
      'Enforce strict Credential Guard on all Domain Controllers.',
      'Deploy HSM hardware token verification for SWIFT transactions.',
      'Audit SAP NetWeaver RFCPING Gateway access control lists.'
    ]
  },
  {
    id: 'ACTOR-002',
    actorName: 'Scattered Spider (UNC3944 / Octo Tempest)',
    aliases: ['Starfraud', '0ktapus', 'Scatter Swine'],
    origin: 'Transnational Cybercrime Syndicate',
    targetIndustry: 'Technology & Cloud',
    motivation: 'Financial Gain',
    primaryTTPs: [
      'T1078 - Valid Accounts & Social Engineering',
      'T1114 - Email Access & OAuth Consent Hijacking',
      'T1556 - MFA Fatigue & SIM Swapping'
    ],
    associatedMalware: ['BlackCat / ALPHV Ransomware', 'Octo Stealer', 'Mythic C2'],
    cveTargets: ['CVE-2026-30114', 'CVE-2026-1088'],
    activityLevel: 'HIGH',
    riskScore: 94,
    description: 'Expert social engineering and cloud identity compromise gang targeting SaaS platforms, Okta tenants, and cloud IAM infrastructure.',
    recommendedDefenses: [
      'Enforce FIDO2 WebAuthn hardware security keys for all IAM admins.',
      'Restrict unverified OAuth application consent workflows.',
      'Monitor Okta System Log for anomalous SessionId reassignments.'
    ]
  },
  {
    id: 'ACTOR-003',
    actorName: 'Volt Typhoon (BRONZE SILHOUETTE)',
    aliases: ['Vanguard Panda', 'InsidiousTaurus', 'Dev-0391'],
    origin: 'China (MSS / PLA Strategic Support Force)',
    targetIndustry: 'Energy & OT Infrastructure',
    motivation: 'Critical Infrastructure Disruption',
    primaryTTPs: [
      'T1190 - Exploit Public-Facing Edge Application',
      'T1021.004 - SSH & VPN Tunneling',
      'T1070 - Living-off-the-Land (LotL) Command Execution'
    ],
    associatedMalware: ['Cisco AnyConnect WebShell', 'KV-Botnet', 'FastReverseProxy'],
    cveTargets: ['CVE-2026-4401', 'CVE-2026-0044'],
    activityLevel: 'ELEVATED',
    riskScore: 92,
    description: 'State-sponsored adversary positioning stealth pre-implantation payloads inside electrical power grids, water treatment plants, and Cisco edge devices for potential crisis activation.',
    recommendedDefenses: [
      'Upgrade Cisco ASA firmware to 9.18.4+ immediately.',
      'Inspect OT network edge for unauthenticated Profinet & Modbus frames.',
      'Enforce strict outbound firewall egress rules on OT jump boxes.'
    ]
  },
  {
    id: 'ACTOR-004',
    actorName: 'APT28 (Fancy Bear / STRONTIUM)',
    aliases: ['Fancy Bear', 'Pawn Storm', 'Tla50', 'Iron Twilight'],
    origin: 'Russia (GRU Unit 26165)',
    targetIndustry: 'Defense & Government',
    motivation: 'Cyber Espionage',
    primaryTTPs: [
      'T1003.001 - OS Credential Dumping',
      'T1190 - Zero-Day Vulnerability Exploitation',
      'T1056 - Input Capture & Keylogging'
    ],
    associatedMalware: ['Zebrocy', 'X-Agent', 'Mimikatz', 'CHOPSTICK'],
    cveTargets: ['CVE-2026-21840', 'CVE-2026-1899'],
    activityLevel: 'HIGH',
    riskScore: 95,
    description: 'Military intelligence threat group targeting defense contractors, NATO member state diplomatic hubs, and government agencies for geopolitical intelligence gathering.',
    recommendedDefenses: [
      'Apply Windows Security Hotfix KB5038912 on Windows Server 2022.',
      'Enable LSASS Protected Process Light (PPL) mode.',
      'Implement zero-trust network access (ZTNA) for executive mail servers.'
    ]
  },
  {
    id: 'ACTOR-005',
    actorName: 'LockBit 3.0 Affiliates (Ransomware Cartel)',
    aliases: ['LockBit Black', 'Bitwise', 'LockBit Supp'],
    origin: 'Transnational Cybercrime Group',
    targetIndustry: 'Healthcare & Biotech',
    motivation: 'Financial Gain',
    primaryTTPs: [
      'T1490 - Inhibit System Recovery (vssadmin purge)',
      'T1486 - Data Encrypted for Impact',
      'T1041 - Exfiltration Over C2 Channel'
    ],
    associatedMalware: ['LockBit 3.0 Encryptor', 'StealBit', 'PsExec', 'Cobalt Strike'],
    cveTargets: ['CVE-2026-11099', 'CVE-2026-1120'],
    activityLevel: 'HIGH',
    riskScore: 93,
    description: 'Ransomware-as-a-Service operator conducting double-extortion attacks against hospitals, medical research facilities, and healthcare supply chains.',
    recommendedDefenses: [
      'Restrict execution of vssadmin.exe and wmic.exe via EDR behavioral blocking.',
      'Maintain immutable, air-gapped offsite backup snapshots.',
      'Block unauthorized PowerShell network connections.'
    ]
  },
  {
    id: 'ACTOR-006',
    actorName: 'FIN7 (Sangma Gang / Carbanak)',
    aliases: ['Carbanak', 'Elbrus', 'Carbon Spider'],
    origin: 'Eastern Europe / Cybercrime Syndicate',
    targetIndustry: 'Industrial & Manufacturing',
    motivation: 'Financial Gain',
    primaryTTPs: [
      'T1195 - Supply Chain & CI/CD Pipeline Compromise',
      'T1562.001 - Disable Cloud Trail & Security Tools',
      'T1059.001 - Malicious PowerShell Execution'
    ],
    associatedMalware: ['GRIFFON', 'DICELOADER', 'Lizar', 'POWERPLANT'],
    cveTargets: ['CVE-2026-1120', 'CVE-2026-1088'],
    activityLevel: 'MEDIUM',
    riskScore: 88,
    description: 'Organized cybercrime syndicate targeting manufacturing networks, Jenkins CI/CD automation pipelines, and AWS cloud build environments.',
    recommendedDefenses: [
      'Disable Jenkins CLI remote management port.',
      'Apply AWS Service Control Policy preventing cloudtrail:StopLogging.',
      'Enforce code signing for build deployment artifacts.'
    ]
  }
];
