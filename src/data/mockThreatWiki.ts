export type WikiCategory = 'actor' | 'malware' | 'ttp' | 'cve' | 'framework' | 'tool';
export type WikiSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFORMATIONAL';

export interface WikiIOC {
  type: 'IP' | 'DOMAIN' | 'HASH_SHA256' | 'URL' | 'FILE_PATH' | 'MUTEX';
  value: string;
  description: string;
  confidence: 'HIGH' | 'MEDIUM' | 'EMERGING';
}

export interface WikiMitreTechnique {
  id: string;
  name: string;
  tactic: 'Initial Access' | 'Execution' | 'Persistence' | 'Privilege Escalation' | 'Defense Evasion' | 'Credential Access' | 'Discovery' | 'Lateral Movement' | 'Collection' | 'Command and Control' | 'Exfiltration' | 'Impact';
  subTechnique?: string;
}

export interface WikiDetectionQueries {
  spl?: string;
  sigma?: string;
  kql?: string;
  yara?: string;
}

export interface ThreatWikiArticle {
  id: string;
  title: string;
  category: WikiCategory;
  severity: WikiSeverity;
  riskScore: number;
  lastUpdated: any; // Can be ISO string (mock) or Firestore Timestamp/Date (real)
  author: string;
  version: string;
  aliases: string[];
  tags: string[];
  origin?: string;
  motivation?: string;
  targetSectors: string[];
  summary: string;
  technicalDetails: string[];
  killChainStage?: 'Reconnaissance' | 'Weaponization' | 'Delivery' | 'Exploitation' | 'Installation' | 'Command and Control' | 'Actions on Objectives';
  mitreTechniques: WikiMitreTechnique[];
  iocs: WikiIOC[];
  detectionQueries: WikiDetectionQueries;
  mitigations: string[];
  references: { title: string; source: string; url?: string }[];
  relatedArticleIds: string[];
  userId: string;
}

export const INITIAL_WIKI_ARTICLES: ThreatWikiArticle[] = [
  // 1. THREAT ACTORS
  {
    id: 'WIKI-ACT-001',
    title: 'Lazarus Group (UNC2891 / APT38 / Hidden Cobra)',
    category: 'actor',
    severity: 'CRITICAL',
    riskScore: 96,
    lastUpdated: '2026-09-24T18:00:00Z',
    author: 'Tejax CTI Research Lab',
    version: '4.2',
    aliases: ['Guardians of Peace', 'APT38', 'BlueNoroff', 'Stardust Chollima', 'Nickel Academy'],
    tags: ['DPRK', 'SWIFT', 'Cryptocurrency', 'FastCash', 'AppleJeus', 'State-Sponsored'],
    origin: 'North Korea (RGB / DPRK State-Sponsored)',
    motivation: 'State Revenue Generation & Geopolitical Cyber Espionage',
    targetSectors: ['Financial Services', 'Cryptocurrency Exchanges', 'Defense', 'Energy'],
    summary: 'Lazarus Group is a premier state-sponsored cyber espionage and illicit financial revenue syndicate operated by the DPRK Reconnaissance General Bureau. Notorious for multi-hundred million dollar cryptocurrency thefts, SWIFT banking fraud, and destructive wiper operations.',
    technicalDetails: [
      'Employs customized trojanized open-source software (AppleJeus) distributed through social engineering on LinkedIn to target dev-ops and crypto engineers.',
      'Specialized operational wing APT38 conducts precision SWIFT payment gateway intrusions using specialized FastCash malware to intercept ATM transaction requests.',
      'Recent 2026 campaigns utilize DLL search order hijacking with legitimate signed binaries (e.g., msra.exe, calc.exe) to deliver encrypted in-memory shellcode without disk staging.',
      'Maintains fallback multi-stage C2 infrastructure routing through compromised WordPress blogs, dynamic DNS providers, and commercial bulletproof hosters.'
    ],
    killChainStage: 'Actions on Objectives',
    mitreTechniques: [
      { id: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory', tactic: 'Credential Access' },
      { id: 'T1059.001', name: 'Command & Scripting: PowerShell', tactic: 'Execution' },
      { id: 'T1566.002', name: 'Phishing: Spearphishing Link', tactic: 'Initial Access' },
      { id: 'T1071.001', name: 'Application Layer Protocol: Web Protocols', tactic: 'Command and Control' },
      { id: 'T1574.002', name: 'Hijack Execution Flow: DLL Side-Loading', tactic: 'Defense Evasion' }
    ],
    iocs: [
      { type: 'IP', value: '185.193.64.12', description: 'Primary C2 Beacon Gateway (FastCash)', confidence: 'HIGH' },
      { type: 'DOMAIN', value: 'api.crypto-vault-auth.com', description: 'AppleJeus trojanized updater domain', confidence: 'HIGH' },
      { type: 'HASH_SHA256', value: '8a9c1e7f3b508f77e6d2bc4a51199cb502c3ef39c87893214878a9c8b74619d0', description: 'FastCash payload binary (x64 Windows)', confidence: 'HIGH' },
      { type: 'FILE_PATH', value: 'C:\\Windows\\Temp\\~dfir_cache.dat', description: 'Staged encrypted credentials dump', confidence: 'MEDIUM' }
    ],
    detectionQueries: {
      spl: `index=sec_endpoint sourcetype=sysmon EventCode=7 (ImageLoaded="*\\msra.exe" OR ImageLoaded="*\\calc.exe") AND Signed=false | stats count by host, Image, ImageLoaded, Hashes`,
      sigma: `title: Lazarus FastCash In-Memory DLL Injection\nstatus: stable\nlogsource:\n  category: process_creation\n  product: windows\ndetection:\n  selection:\n    ParentImage|endswith: '\\cmd.exe'\n    CommandLine|contains:\n      - 'FastCash'\n      - 'sekurlsa::logonpasswords'\n      - 'AppleJeus'\n  condition: selection`,
      kql: `DeviceProcessEvents | where ProcessCommandLine has_any ("FastCash", "AppleJeus", "msra.exe -inject") | project Timestamp, DeviceName, AccountName, ProcessCommandLine`,
      yara: `rule APT_Lazarus_FastCash_Signature {\n  strings:\n    $magic = { 4D 5A 90 00 }\n    $s1 = "DPRK_TRANSACTION_FORWARDER" ascii wide\n    $s2 = "SWIFT_FIN_GATEWAY_HOOK" ascii wide\n  condition:\n    $magic at 0 and all of ($s*)\n}`
    },
    mitigations: [
      'Enforce Credential Guard and LSA Protected Process Light (PPL) on all endpoints and domain controllers.',
      'Deploy strict Application Whitelisting (WDAC / AppLocker) blocking unapproved DLL side-loading locations.',
      'Implement multi-factor hardware security key (FIDO2) authorization for all financial database and SWIFT access.',
      'Isolate cryptocurrency signing infrastructure onto air-gapped HSMs with mandatory multi-sig ceremony quorum.'
    ],
    references: [
      { title: 'CISA Alert AA22-108A: DPRK State-Sponsored Cyber Actors', source: 'CISA / FBI / CSAF' },
      { title: 'Mandiant APT38 Threat Profile & Financial Crime Playbook', source: 'Mandiant / Google Cloud' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-MAL-001', 'WIKI-TTP-001', 'WIKI-CVE-001']
  },

  {
    id: 'WIKI-ACT-002',
    title: 'Scattered Spider (UNC3944 / Octo Tempest)',
    category: 'actor',
    severity: 'CRITICAL',
    riskScore: 95,
    lastUpdated: '2026-09-25T11:30:00Z',
    author: 'Tejax CTI Research Lab',
    version: '3.8',
    aliases: ['0ktapus', 'Scatter Swine', 'Starfraud', 'Muddled Libra'],
    tags: ['SocialEngineering', 'Okta', 'MFA-Fatigue', 'SIM-Swap', 'BlackCat', 'Cloud-IAM'],
    origin: 'Transnational Cybercrime Syndicate (US / UK / Europe)',
    motivation: 'High-Volume Financial Extortion & Cloud Data Ransom',
    targetSectors: ['Technology & Cloud', 'SaaS Providers', 'Casinos & Hospitality', 'Telecommunications'],
    summary: 'A native English-speaking cybercriminal collective specializing in aggressive vishing, identity provider (IdP) compromise, SIM swapping, and MFA fatigue attacks targeting internal helpdesks to hijack Okta and Azure AD admin accounts.',
    technicalDetails: [
      'Impersonates corporate employees calling internal IT helpdesks, tricking technicians into resetting MFA tokens or registering new FIDO authenticators.',
      'Abuses compromised Okta admin accounts to generate new OAuth app credentials and modify identity federation settings.',
      'Transitions into hybrid AWS/Azure cloud tenants, assigning AdministratorAccess roles and leveraging AWS Systems Manager (SSM) for agentless lateral movement.',
      'Deploys BlackCat / ALPHV ransomware on on-premises ESXi hypervisors and exfiltrates terabytes of cloud data via rclone to Mega.nz.'
    ],
    killChainStage: 'Exploitation',
    mitreTechniques: [
      { id: 'T1556', name: 'Modify Authentication Process', tactic: 'Credential Access' },
      { id: 'T1078.004', name: 'Valid Accounts: Cloud Accounts', tactic: 'Defense Evasion' },
      { id: 'T1114.002', name: 'Email Access: Remote Email Fetching', tactic: 'Collection' },
      { id: 'T1562.001', name: 'Disable or Modify Tools: CloudTrail', tactic: 'Defense Evasion' },
      { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' }
    ],
    iocs: [
      { type: 'DOMAIN', value: 'helpdesk-okta-sso-verify.net', description: 'Vishing phishing landing portal', confidence: 'HIGH' },
      { type: 'IP', value: '45.142.177.89', description: 'Proxied Okta API credential harvesting proxy', confidence: 'HIGH' },
      { type: 'HASH_SHA256', value: 'd3f4a189b2c37701e9a8f4c2e6b1298834a5d89e02c512399aa456e8770b134a', description: 'ALPHV / BlackCat ESXi linux encryptor', confidence: 'HIGH' }
    ],
    detectionQueries: {
      spl: `index=okta sourcetype="OktaIM2:log" eventType IN ("user.mfa.factor.update", "system.api_token.create", "user.session.start") 
| eval is_anom_ip=if(match(client.ipAddress, "^(45\\.|185\\.|193\\.)"), 1, 0)
| stats count by actor.alternateId, client.ipAddress, client.geographicalContext.city, eventType 
| sort - count`,
      sigma: `title: Okta Helpdesk MFA Factor Reset Anomaly\nstatus: experimental\nlogsource:\n  product: okta\n  service: system_log\ndetection:\n  selection:\n    eventType: 'user.mfa.factor.reset'\n    outcome.result: 'SUCCESS'\n  condition: selection`,
      kql: `SigninLogs | where AuthenticationRequirement == "multiFactorAuthentication" and ResultType == 500121 | summarize FailedAttempts = count() by UserPrincipalName, IPAddress, bin(TimeGenerated, 10m) | where FailedAttempts >= 5`
    },
    mitigations: [
      'Eliminate SMS and push notification MFA; enforce mandatory hardware security keys (FIDO2 / WebAuthn).',
      'Implement out-of-band video or manager verification for all helpdesk identity and password resets.',
      'Deploy strict Conditional Access policies restricting IdP admin console access to verified corporate managed devices.',
      'Enable AWS CloudTrail tamper protection with multi-region trail replication and S3 Object Lock.'
    ],
    references: [
      { title: 'FBI & CISA Cybersecurity Advisory: Scattered Spider UNC3944', source: 'FBI / CISA' },
      { title: 'Microsoft Threat Intelligence: Octo Tempest Operator Profile', source: 'MSRC' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-TTP-004', 'WIKI-CVE-004', 'WIKI-MAL-003']
  },

  {
    id: 'WIKI-ACT-003',
    title: 'Volt Typhoon (BRONZE SILHOUETTE / Vanguard Panda)',
    category: 'actor',
    severity: 'CRITICAL',
    riskScore: 94,
    lastUpdated: '2026-09-22T14:15:00Z',
    author: 'Tejax CTI Research Lab',
    version: '3.1',
    aliases: ['Vanguard Panda', 'InsidiousTaurus', 'Dev-0391', 'Voltzite'],
    tags: ['China', 'CriticalInfrastructure', 'OT', 'Living-off-the-Land', 'Edge-Appliances', 'SOHO-Routers'],
    origin: 'China (MSS / PLA Strategic Support Force)',
    motivation: 'Critical Infrastructure Disruption & Pre-Positioning in Energy Grids',
    targetSectors: ['Energy & OT Infrastructure', 'Water Utilities', 'Transportation', 'Telecommunications', 'Defense'],
    summary: 'A stealth Chinese state-sponsored adversary focusing on pre-positioning access inside US and allied critical infrastructure (electrical grids, wastewater, maritime ports) to enable disruptive cyber-attacks during geopolitical crises.',
    technicalDetails: [
      'Avoids custom malware payloads; relies almost exclusively on Living-off-the-Land (LotL) binaries built into Windows (wmic, netsh, ntdsutil, powershell) to evade EDR detection.',
      'Exploits zero-day vulnerabilities in public-facing network edge devices (Fortinet FortiGate, Cisco ASA, Ivanti Connect Secure) to establish reverse proxy tunnels.',
      'Builds stealth proxy networks (KV-Botnet) through compromised small office/home office (SOHO) routers (Netgear, ASUS, DrayTek) to obfuscate command-and-control origin.',
      'Dumps Active Directory credentials directly from NTDS.dit via ntdsutil snapshots, bypassing LSASS process handle monitoring.'
    ],
    killChainStage: 'Installation',
    mitreTechniques: [
      { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access' },
      { id: 'T1070', name: 'Indicator Removal: Living off the Land', tactic: 'Defense Evasion' },
      { id: 'T1021.004', name: 'Remote Services: SSH / Port Forwarding', tactic: 'Lateral Movement' },
      { id: 'T1003.003', name: 'OS Credential Dumping: NTDS', tactic: 'Credential Access' }
    ],
    iocs: [
      { type: 'IP', value: '194.26.29.114', description: 'Compromised Edge Router Egress Gateway', confidence: 'HIGH' },
      { type: 'FILE_PATH', value: 'C:\\Windows\\System32\\tasks\\Microsoft\\Windows\\NetTrace\\system_tunnel.bat', description: 'Persistence batch script for lotl port forward', confidence: 'HIGH' },
      { type: 'HASH_SHA256', value: '47d9916ab450ce482937be1991d902bf8696d552cf518a29a0f4438b4d8d1e21', description: 'FastReverseProxy binary stripped for Cisco edge', confidence: 'HIGH' }
    ],
    detectionQueries: {
      spl: `index=sec_endpoint sourcetype=sysmon EventCode=1 (CommandLine="*ntdsutil*" OR CommandLine="*netsh interface portproxy*" OR CommandLine="*vssadmin create shadow*") 
| stats count by host, User, CommandLine, ParentCommandLine`,
      sigma: `title: Volt Typhoon Living-off-the-Land PortProxy Creation\nstatus: stable\nlogsource:\n  category: process_creation\n  product: windows\ndetection:\n  selection:\n    CommandLine|contains:\n      - 'interface portproxy add v4tov4'\n      - 'ntdsutil \"ac i ntds\"'\n  condition: selection`
    },
    mitigations: [
      'Upgrade firmware on edge VPN appliances immediately; disable administrative interfaces on the public WAN.',
      'Audit and terminate unauthorized netsh interface portproxy and SSH forwarding rules.',
      'Enforce strict network segmentation between IT enterprise networks and operational technology (OT) SCADA enclaves.',
      'Implement multi-tier privileged access workstations (PAWs) with air-gapped domain administration.'
    ],
    references: [
      { title: 'CISA, NSA, FBI Joint Cybersecurity Advisory: PRC State-Sponsored Actor Volt Typhoon', source: 'CISA / NSA / FBI' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-CVE-003', 'WIKI-TTP-005', 'WIKI-TOOL-002']
  },

  {
    id: 'WIKI-ACT-004',
    title: 'APT28 (Fancy Bear / STRONTIUM / Forest Blizzard)',
    category: 'actor',
    severity: 'CRITICAL',
    riskScore: 95,
    lastUpdated: '2026-09-20T09:40:00Z',
    author: 'Tejax CTI Research Lab',
    version: '4.0',
    aliases: ['Fancy Bear', 'Pawn Storm', 'Tla50', 'Iron Twilight', 'Sofacy', 'Sednit'],
    tags: ['Russia', 'GRU', 'Espionage', 'LSASS', 'Zebrocy', 'Government', 'NATO'],
    origin: 'Russia (Main Intelligence Directorate / GRU Unit 26165)',
    motivation: 'Military Intelligence & Geopolitical Cyber Espionage',
    targetSectors: ['Defense & Government', 'NATO Member States', 'Aerospace', 'Energy'],
    summary: 'A military intelligence cyber warfare unit operated by Russian GRU Unit 26165, engaged in high-profile espionage campaigns against defense contractors, government agencies, and geopolitical summits.',
    technicalDetails: [
      'Deploys modular malware ecosystems (Zebrocy, X-Agent, CHOPSTICK, GooseEgg) to conduct automated host reconnaissance and file staging.',
      'Leverages zero-day vulnerabilities in Microsoft Outlook, Windows Print Spooler, and Cisco routers to achieve remote code execution.',
      'Extracts NTLM password hashes using LSASS memory dumping utilities and passes hashes across internal domain networks.',
      'Exfiltrates intelligence via encrypted DNS tunneling and custom C2 protocols mimicking legitimate HTTPS traffic.'
    ],
    killChainStage: 'Exploitation',
    mitreTechniques: [
      { id: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory', tactic: 'Credential Access' },
      { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access' },
      { id: 'T1071.004', name: 'DNS Tunneling C2', tactic: 'Command and Control' }
    ],
    iocs: [
      { type: 'IP', value: '91.240.118.42', description: 'GooseEgg C2 C&C Server', confidence: 'HIGH' },
      { type: 'DOMAIN', value: 'nato-defense-briefing.org', description: 'Spearphishing credential landing page', confidence: 'HIGH' },
      { type: 'HASH_SHA256', value: 'e5f6a9870192bc54a8e7d432b10984cf510293847561a2b3c4d5e6f7a8b9c0d1', description: 'Zebrocy loader executable', confidence: 'HIGH' }
    ],
    detectionQueries: {
      spl: `index=sec_endpoint sourcetype=sysmon EventCode=10 TargetImage="*\\lsass.exe" GrantedAccess="0x1010" CallTrace="*UNKNOWN*" 
| table _time, host, SourceImage, TargetImage, GrantedAccess`,
      sigma: `title: Potential Mimikatz / APT28 LSASS Injection\nstatus: stable\nlogsource:\n  category: process_access\n  product: windows\ndetection:\n  selection:\n    TargetImage|endswith: '\\lsass.exe'\n    GrantedAccess: '0x1010'\n  condition: selection`
    },
    mitigations: [
      'Enable LSA RunAsPPL (Protected Process Light) registry enforcement.',
      'Block outbound DNS requests to non-authoritative internal DNS resolvers to prevent DNS tunneling.',
      'Deploy EDR behavioral telemetry on all Windows Server domain controllers.'
    ],
    references: [
      { title: 'UK NCSC & US CISA: Russian GRU Military Intelligence Cyber Operations', source: 'NCSC / CISA' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-TTP-001', 'WIKI-MAL-002', 'WIKI-CVE-002']
  },

  // 2. MALWARE FAMILIES & C2 FRAMEWORKS
  {
    id: 'WIKI-MAL-001',
    title: 'Cobalt Strike Beacon (Malleable C2 Framework)',
    category: 'malware',
    severity: 'CRITICAL',
    riskScore: 92,
    lastUpdated: '2026-09-23T16:20:00Z',
    author: 'Tejax Threat Research',
    version: '4.9',
    aliases: ['Beacon', 'CS', 'CobaltStrike'],
    tags: ['C2', 'Post-Exploitation', 'In-Memory', 'NamedPipes', 'Adversary-Simulation'],
    origin: 'Commercial Red Teaming Tool (Extensively Cracked & Weaponized by Threat Groups)',
    motivation: 'Interactive Post-Exploitation, Lateral Movement & Payload Delivery',
    targetSectors: ['All Sectors'],
    summary: 'The most widely deployed adversary post-exploitation agent in existence. Provides interactive shell access, keylogging, lateral movement, in-memory execution, and malleable C2 profiles mimicking legitimate web traffic.',
    technicalDetails: [
      'Uses reflective DLL injection to execute Beacon payloads purely in RAM, leaving zero binary footprint on physical disk.',
      'Malleable C2 profiles allow operators to alter HTTP headers, URIs, user agents, sleep jitters, and DNS queries to evade signature-based NIDS.',
      'Supports peer-to-peer command routing via Windows Named Pipes (smb_pipe), allowing internal compromised hosts without internet access to communicate outbound through an internet-facing pivot node.',
      'Built-in execute-assembly feature loads and runs .NET assemblies entirely in process memory without invoking powershell.exe.'
    ],
    killChainStage: 'Command and Control',
    mitreTechniques: [
      { id: 'T1055.001', name: 'Process Injection: Dynamic-link Library Injection', tactic: 'Defense Evasion' },
      { id: 'T1071.001', name: 'Application Layer Protocol: Web Protocols', tactic: 'Command and Control' },
      { id: 'T1021.002', name: 'SMB/Windows Admin Shares', tactic: 'Lateral Movement' },
      { id: 'T1573', name: 'Encrypted Channel', tactic: 'Command and Control' }
    ],
    iocs: [
      { type: 'DOMAIN', value: 'telemetry.cloud-cdn-edge.com', description: 'Malleable C2 HTTP Beacon Endpoint', confidence: 'HIGH' },
      { type: 'HASH_SHA256', value: '18b2c45e89d13401fa9045bc12984576ee34219a8710928374a5b6c7d8e9f012', description: 'Staged 64-bit reflective Beacon DLL', confidence: 'HIGH' },
      { type: 'FILE_PATH', value: '\\\\.\\pipe\\msagent_77', description: 'Default SMB named pipe beacon pivot', confidence: 'HIGH' }
    ],
    detectionQueries: {
      spl: `index=sec_endpoint sourcetype=sysmon EventCode=18 PipeName IN ("*msagent_*", "*status_*", "*postex_*") 
| stats count by host, Image, PipeName`,
      sigma: `title: Cobalt Strike Default Named Pipe Communication\nstatus: stable\nlogsource:\n  category: pipe_created\n  product: windows\ndetection:\n  selection:\n    PipeName|contains:\n      - '\\pipe\\msagent_'\n      - '\\pipe\\postex_'\n  condition: selection`,
      yara: `rule Cobalt_Strike_Beacon_Memory {\n  strings:\n    $b1 = "%s as %s\\\\%s: %d" ascii\n    $b2 = "Started service %s on %s" ascii\n    $b3 = { 73 70 72 6E 67 00 } \n  condition:\n    2 of ($b*)\n}`
    },
    mitigations: [
      'Deploy memory integrity scanning (EDR AMSI + Kernel ETW-TI) to catch unbacked memory executable threads.',
      'Block unauthorized SMB named pipe creation between non-admin workstations.',
      'Implement JA3 / JA4 TLS fingerprinting on network perimeter proxies to identify default Cobalt Strike TLS handshakes.'
    ],
    references: [
      { title: 'MITRE ATT&CK Software: Cobalt Strike S0154', source: 'MITRE ATT&CK' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-TTP-001', 'WIKI-ACT-001', 'WIKI-TOOL-001']
  },

  {
    id: 'WIKI-MAL-002',
    title: 'Mimikatz (sekurlsa / Kerberos Golden Ticket Suite)',
    category: 'malware',
    severity: 'CRITICAL',
    riskScore: 94,
    lastUpdated: '2026-09-21T12:00:00Z',
    author: 'Tejax Threat Research',
    version: '2.2.0',
    aliases: ['mimi', 'sekurlsa', 'kuhl_m'],
    tags: ['CredentialDumping', 'LSASS', 'Kerberos', 'GoldenTicket', 'Pass-the-Hash', 'Pass-the-Ticket'],
    origin: 'Open Source Security Research Tool (Authored by Benjamin Delpy)',
    motivation: 'Local and Domain Credential Harvesting',
    targetSectors: ['All Sectors'],
    summary: 'The benchmark post-exploitation credential extraction tool. Capable of harvesting plaintext passwords, NTLM hashes, Kerberos tickets, and DPAPI keys directly from Windows LSASS memory and SAM databases.',
    technicalDetails: [
      'Accesses the Local Security Authority Subsystem Service (lsass.exe) memory space using OpenProcess with PROCESS_VM_READ and PROCESS_QUERY_INFORMATION.',
      'Parses the memory structures of Windows authentication packages (WDigest, Kerberos, TsPkg, Msv1_0) to recover active plaintext credentials and ticket-granting tickets (TGTs).',
      'The kerberos::golden command creates forged Kerberos Ticket Granting Tickets with arbitrary group memberships (e.g., Domain Admins SID 512) utilizing the compromised KRBTGT account hash.',
      'Can inject into LSASS using reflective injection or MiniDumpWriteDump API calls to generate full crash dumps for offline decryption.'
    ],
    killChainStage: 'Exploitation',
    mitreTechniques: [
      { id: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory', tactic: 'Credential Access' },
      { id: 'T1558.001', name: 'Steal or Forge Kerberos Tickets: Golden Ticket', tactic: 'Credential Access' },
      { id: 'T1550.002', name: 'Pass the Hash', tactic: 'Lateral Movement' }
    ],
    iocs: [
      { type: 'HASH_SHA256', value: 'a984bc123049182374e6f5d8c91a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90', description: 'Standard compiled mimikatz.exe (x64)', confidence: 'HIGH' },
      { type: 'FILE_PATH', value: 'C:\\Windows\\Temp\\lsass.dmp', description: 'Raw memory dump created via procdump/comsvcs', confidence: 'HIGH' }
    ],
    detectionQueries: {
      spl: `index=sec_endpoint sourcetype=sysmon EventCode=10 TargetImage="*\\lsass.exe" GrantedAccess IN ("0x1410", "0x1010", "0x1F3FFF") 
| eval suspicious=if(match(SourceImage, "(?i)(explorer|cmd|powershell|rundll32|wmic)\\.exe"), "HIGH", "LOW")
| where suspicious="HIGH"
| table _time, host, SourceImage, TargetImage, GrantedAccess`,
      sigma: `title: Mimikatz LSASS OpenProcess Handle\nstatus: stable\nlogsource:\n  category: process_access\n  product: windows\ndetection:\n  selection:\n    TargetImage|endswith: '\\lsass.exe'\n    GrantedAccess:\n      - '0x1410'\n      - '0x1010'\n      - '0x1F3FFF'\n  condition: selection`
    },
    mitigations: [
      'Enable Windows Defender Credential Guard to isolate LSASS in a Virtualization-based Security (VBS) enclave.',
      'Configure LSA Protection via registry: HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa -> RunAsPPL = 1.',
      'Rotate the Active Directory KRBTGT password twice in succession to invalidate all forged Golden Tickets.',
      'Restrict Debug Privilege (SeDebugPrivilege) to dedicated Domain Administrators.'
    ],
    references: [
      { title: 'Gentilkiwi Mimikatz Repository & Documentation', source: 'GitHub' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-TTP-001', 'WIKI-ACT-004', 'WIKI-CVE-002']
  },

  {
    id: 'WIKI-MAL-003',
    title: 'LockBit 3.0 Encryptor (LockBit Black Ransomware)',
    category: 'malware',
    severity: 'CRITICAL',
    riskScore: 93,
    lastUpdated: '2026-09-24T15:00:00Z',
    author: 'Tejax Threat Research',
    version: '3.0.4',
    aliases: ['LockBit Black', 'Bitwise', 'LB3'],
    tags: ['Ransomware', 'Double-Extortion', 'VSSAdmin', 'ShadowCopy', 'Anti-Analysis', 'ChaCha20'],
    origin: 'Transnational Cybercrime Syndicate (RaaS)',
    motivation: 'Multi-Million Dollar Cryptocurrency Extortion',
    targetSectors: ['Healthcare', 'Manufacturing', 'Financial Services', 'Legal', 'Education'],
    summary: 'A premier Ransomware-as-a-Service payload engineered in C++ with anti-analysis code borrowed from BlackMatter. Employs multi-threaded encryption using ChaCha20 and RSA-4096, deletes system backups, and terminates security services.',
    technicalDetails: [
      'Requires a unique execution password passed via command line parameter (-k or -pass) to unpack and decrypt its core binary routines in memory, frustrating automated sandbox analysis.',
      'Executes vssadmin.exe delete shadows /all /quiet and bcdedit commands to eliminate shadow copies and boot recovery.',
      'Terminates database services (SQL, Exchange, Oracle) and disables Windows Defender real-time protection via PowerShell cmdlets.',
      'Spawns 64 concurrent threads to encrypt network shares, mounted drives, and local files, appending the .HLJkNskO6 extension.'
    ],
    killChainStage: 'Actions on Objectives',
    mitreTechniques: [
      { id: 'T1490', name: 'Inhibit System Recovery: Delete Volume Shadows', tactic: 'Impact' },
      { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' },
      { id: 'T1562.001', name: 'Disable Security Tools: Windows Defender', tactic: 'Defense Evasion' }
    ],
    iocs: [
      { type: 'HASH_SHA256', value: '4f8a129038bca76192834710293847561a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', description: 'LockBit 3.0 Encryptor (Packed PE)', confidence: 'HIGH' },
      { type: 'FILE_PATH', value: 'C:\\ProgramData\\HLJkNskO6.README.txt', description: 'Ransom demand note dropped in all folders', confidence: 'HIGH' }
    ],
    detectionQueries: {
      spl: `index=sec_endpoint sourcetype=sysmon EventCode=1 (CommandLine="*vssadmin*delete*shadows*" OR CommandLine="*bcdedit*recoveryenabled*No*") 
| table _time, host, User, Image, CommandLine`,
      sigma: `title: Volume Shadow Copy Deletion via Vssadmin\nstatus: stable\nlogsource:\n  category: process_creation\n  product: windows\ndetection:\n  selection:\n    CommandLine|contains:\n      - 'vssadmin delete shadows'\n      - 'resize shadowstorage'\n  condition: selection`
    },
    mitigations: [
      'Maintain immutable, air-gapped, write-once-read-many (WORM) offsite backup copies.',
      'Enforce EDR behavioral blocking preventing non-system processes from spawning vssadmin.exe and wmic.exe.',
      'Implement strict network access control (NAC) preventing lateral SMB traversal between employee workstations.'
    ],
    references: [
      { title: 'CISA Alert AA23-075A: Understanding Ransomware Threat Actors: LockBit 3.0', source: 'CISA / FBI / MS-ISAC' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-TTP-002', 'WIKI-ACT-002', 'WIKI-CVE-005']
  },

  // 3. MITRE ATT&CK TECHNIQUES
  {
    id: 'WIKI-TTP-001',
    title: 'T1003.001 - OS Credential Dumping: LSASS Memory',
    category: 'ttp',
    severity: 'CRITICAL',
    riskScore: 96,
    lastUpdated: '2026-09-24T19:00:00Z',
    author: 'Tejax Detection Engineering',
    version: '14.0',
    aliases: ['LSASS Dump', 'Mimikatz', 'sekurlsa', 'Credential Access'],
    tags: ['CredentialAccess', 'LSASS', 'Sysmon10', 'MiniDump', 'PPL'],
    origin: 'MITRE ATT&CK Matrix for Enterprise',
    motivation: 'Privilege Escalation & Domain Dominance',
    targetSectors: ['All Windows Environments'],
    summary: 'Adversaries attempt to access credential material stored in the process memory of the Local Security Authority Subsystem Service (LSASS). After a user logs on, the system generates credential artifacts (NTLM hashes, Kerberos tickets) cached in LSASS.',
    technicalDetails: [
      'Native tools like procdump.exe, comsvcs.dll (MiniDump), and Task Manager can be leveraged by attackers to create minidump files without dropping known malware.',
      'Direct API calls (MiniDumpWriteDump, ReadProcessMemory) from injected shellcode to bypass user-mode API hooking.',
      'GrantedAccess mask 0x1010 (PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_VM_READ) or 0x1410 are classic indicators in Sysmon Event ID 10.',
      'Commonly executed by APT28, Lazarus, FIN7, and nearly all ransomware operators to escalate to Domain Administrator.'
    ],
    killChainStage: 'Exploitation',
    mitreTechniques: [
      { id: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory', tactic: 'Credential Access' }
    ],
    iocs: [
      { type: 'FILE_PATH', value: 'C:\\Windows\\Temp\\lsass.dmp', description: 'Typical staged LSASS minidump file', confidence: 'HIGH' }
    ],
    detectionQueries: {
      spl: `index=sec_endpoint sourcetype=sysmon EventCode=10 TargetImage="*\\lsass.exe" GrantedAccess IN ("0x1010", "0x1410", "0x1F3FFF") 
| eval suspicious=if(match(SourceImage, "(?i)(explorer|powershell|cmd|rundll32|wmic|procdump)\\.exe"), 1, 0)
| where suspicious=1
| stats count by host, SourceImage, GrantedAccess, CallTrace`,
      sigma: `title: Suspicious Process Accessing LSASS Memory\nstatus: stable\nlogsource:\n  category: process_access\n  product: windows\ndetection:\n  selection:\n    TargetImage|endswith: '\\lsass.exe'\n    GrantedAccess:\n      - '0x1010'\n      - '0x1410'\n  filter:\n    SourceImage|endswith:\n      - '\\MsMpEng.exe'\n      - '\\svchost.exe'\n  condition: selection and not filter`
    },
    mitigations: [
      'Enable Credential Guard on all supported Windows 11 and Windows Server 2022 devices.',
      'Enable LSA Protection (RunAsPPL) to require all loaded SSP DLLs to be Microsoft digitally signed.',
      'Block SeDebugPrivilege assignment to standard local administrators.'
    ],
    references: [
      { title: 'MITRE ATT&CK: T1003.001 OS Credential Dumping', source: 'MITRE' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-MAL-002', 'WIKI-ACT-001', 'WIKI-ACT-004']
  },

  {
    id: 'WIKI-TTP-002',
    title: 'T1490 - Inhibit System Recovery: Volume Shadow Copy Deletion',
    category: 'ttp',
    severity: 'CRITICAL',
    riskScore: 94,
    lastUpdated: '2026-09-22T10:00:00Z',
    author: 'Tejax Detection Engineering',
    version: '12.0',
    aliases: ['vssadmin delete shadows', 'bcdedit', 'Shadow Copies Purge'],
    tags: ['Ransomware', 'Impact', 'VSS', 'Sysmon1', 'EDR-Alert'],
    origin: 'MITRE ATT&CK Matrix for Enterprise',
    motivation: 'Maximize Ransomware Leverage by Preventing System Rollback',
    targetSectors: ['All Windows Environments'],
    summary: 'Adversaries delete or disable system recovery mechanisms (Windows Volume Shadow Copies, system restore points, backup catalogs) prior to payload detonation to ensure organizations cannot roll back encrypted drives.',
    technicalDetails: [
      'Command-line utilities executed: vssadmin.exe delete shadows /all /quiet, wmic.exe shadowcopy delete, wbadmin.exe delete catalog.',
      'Adversaries also invoke bcdedit.exe /set {default} bootstatuspolicy ignoreallfailures and bcdedit.exe /set {default} recoveryenabled no to suppress startup repair.',
      'PowerShell command Get-WmiObject Win32_ShadowCopy | ForEach-Object { $_.Delete() } is frequently utilized as a stealth alternative.',
      'Standard precursor event indicating imminent ransomware file encryption within 2-5 minutes.'
    ],
    killChainStage: 'Actions on Objectives',
    mitreTechniques: [
      { id: 'T1490', name: 'Inhibit System Recovery: Volume Shadow Copies', tactic: 'Impact' }
    ],
    iocs: [
      { type: 'FILE_PATH', value: 'C:\\Windows\\System32\\vssadmin.exe', description: 'Abused utility binary', confidence: 'MEDIUM' }
    ],
    detectionQueries: {
      spl: `index=sec_endpoint sourcetype=sysmon EventCode=1 (CommandLine="*vssadmin*delete*shadows*" OR CommandLine="*shadowcopy*delete*" OR CommandLine="*recoveryenabled*no*") 
| stats count, values(CommandLine) by host, User, ParentImage`,
      sigma: `title: Inhibit System Recovery Shadow Copy Deletion\nstatus: stable\nlogsource:\n  category: process_creation\n  product: windows\ndetection:\n  selection:\n    CommandLine|contains:\n      - 'vssadmin delete shadows'\n      - 'shadowcopy delete'\n      - 'wbadmin delete catalog'\n  condition: selection`
    },
    mitigations: [
      'Implement EDR Behavioral Rules that immediately terminate any process executing vssadmin delete shadows.',
      'Configure immutable object storage snapshots that cannot be deleted by local Administrator accounts.'
    ],
    references: [
      { title: 'MITRE ATT&CK: T1490 Inhibit System Recovery', source: 'MITRE' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-MAL-003', 'WIKI-ACT-002']
  },

  // 4. VULNERABILITIES & ZERO-DAYS (CVES)
  {
    id: 'WIKI-CVE-001',
    title: 'CVE-2026-3912 - Spring Boot Cloud Gateway Actuator RCE',
    category: 'cve',
    severity: 'CRITICAL',
    riskScore: 98,
    lastUpdated: '2026-09-25T14:30:00Z',
    author: 'Tejax Vulnerability Intelligence',
    version: '2.0',
    aliases: ['SpringGate RCE', 'Actuator Exploit'],
    tags: ['CISA-KEV', 'Zero-Day', 'RCE', 'Java', 'Spring', 'CVSS-9.8'],
    origin: 'Pivotal / VMware Spring Security Advisory',
    motivation: 'Unauthenticated Remote Code Execution',
    targetSectors: ['Financial Services', 'E-Commerce', 'Cloud Platforms', 'Telecom'],
    summary: 'A critical unauthenticated Remote Code Execution flaw in Spring Cloud Gateway enabled by insecure Actuator routing endpoints. Allows remote attackers to inject custom routing filters leading to arbitrary Java code execution.',
    technicalDetails: [
      'CVSS v3.1 Base Score: 9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H).',
      'Actuator endpoint /actuator/gateway/routes accepts unauthenticated POST requests containing SpEL (Spring Expression Language) expressions inside filter definitions.',
      'Payload execution occurs when the Gateway route cache is refreshed via /actuator/gateway/refresh.',
      'Actively exploited in the wild; cataloged in CISA Known Exploited Vulnerabilities (KEV) Catalog.'
    ],
    killChainStage: 'Exploitation',
    mitreTechniques: [
      { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access' },
      { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'Execution' }
    ],
    iocs: [
      { type: 'URL', value: 'http://*:8080/actuator/gateway/routes/hack_route', description: 'Malicious SpEL route injection URI', confidence: 'HIGH' },
      { type: 'HASH_SHA256', value: '7c8a901234bca8917263540918237465a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', description: 'Automated PoC scanner tool hash', confidence: 'HIGH' }
    ],
    detectionQueries: {
      spl: `index=sec_network sourcetype="cisco:asa" OR sourcetype="paloalto:threat" uri_path="/actuator/gateway/routes*" http_method="POST" 
| stats count by src_ip, dest_ip, status_code, uri_path`,
      sigma: `title: Spring Cloud Gateway SpEL RCE Attempt\nstatus: stable\nlogsource:\n  category: webserver\ndetection:\n  selection:\n    cs_method: 'POST'\n    cs_uri_stem|contains: '/actuator/gateway/routes'\n  condition: selection`
    },
    mitigations: [
      'Upgrade Spring Cloud Gateway to version 4.1.2 or higher immediately.',
      'Disable actuator gateway endpoints via application.yml: management.endpoint.gateway.enabled: false.',
      'Block all external public access to management actuator port (default 8081).'
    ],
    references: [
      { title: 'CISA KEV Catalog: CVE-2026-3912 Spring Cloud Gateway', source: 'CISA' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-ACT-001', 'WIKI-TTP-003']
  },

  {
    id: 'WIKI-CVE-002',
    title: 'CVE-2026-21840 - Windows LSASS RPC Deserialization LPE',
    category: 'cve',
    severity: 'CRITICAL',
    riskScore: 96,
    lastUpdated: '2026-09-24T17:15:00Z',
    author: 'Tejax Vulnerability Intelligence',
    version: '1.4',
    aliases: ['LSASS-RPC-Ghost', 'Windows LPE 2026'],
    tags: ['CISA-KEV', 'PrivilegeEscalation', 'Windows', 'RPC', 'LSASS', 'CVSS-9.6'],
    origin: 'Microsoft Security Response Center (MSRC)',
    motivation: 'Local Privilege Escalation to NT AUTHORITY\\SYSTEM',
    targetSectors: ['All Windows Server & Desktop Environments'],
    summary: 'A critical vulnerability in the Windows Local Security Authority Subsystem Service RPC interface allowing low-privileged authenticated domain users to achieve arbitrary code execution as NT AUTHORITY\\SYSTEM.',
    technicalDetails: [
      'CVSS v3.1 Base Score: 9.6 (CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H).',
      'The flaw resides in LSASS ms-lsad and ms-samr RPC endpoint stub marshalling logic, where improper integer boundary validation triggers a heap memory overwrite.',
      'Threat actors chain this with unauthenticated web exploits to achieve full domain administrator takeover in seconds.',
      'Active weaponized exploits observed in nation-state and ransomware campaigns.'
    ],
    killChainStage: 'Exploitation',
    mitreTechniques: [
      { id: 'T1068', name: 'Exploitation for Privilege Escalation', tactic: 'Privilege Escalation' },
      { id: 'T1003.001', name: 'OS Credential Dumping: LSASS Memory', tactic: 'Credential Access' }
    ],
    iocs: [
      { type: 'HASH_SHA256', value: '3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f', description: 'RPC-LSASS Exploit proof of concept binary', confidence: 'HIGH' }
    ],
    detectionQueries: {
      spl: `index=sec_endpoint sourcetype=sysmon EventCode=1 ParentImage="*\\services.exe" Image="*\\cmd.exe" OR Image="*\\powershell.exe" User="NT AUTHORITY\\\\SYSTEM" 
| stats count by host, CommandLine`,
      sigma: `title: Suspicious System Child Process Spawned from Services\nstatus: stable\nlogsource:\n  category: process_creation\n  product: windows\ndetection:\n  selection:\n    ParentImage|endswith: '\\services.exe'\n    Image|endswith:\n      - '\\cmd.exe'\n      - '\\powershell.exe'\n  condition: selection`
    },
    mitigations: [
      'Apply Microsoft Security Update KB5038912 immediately across all Windows Server domain controllers and member servers.',
      'Restrict RPC endpoint access using Windows Defender Firewall with Advanced Security.'
    ],
    references: [
      { title: 'Microsoft MSRC Security Advisory: CVE-2026-21840', source: 'Microsoft' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-TTP-001', 'WIKI-MAL-002', 'WIKI-ACT-004']
  },

  {
    id: 'WIKI-CVE-003',
    title: 'CVE-2026-4401 - Cisco ASA / AnyConnect SSL VPN Pre-Auth RCE',
    category: 'cve',
    severity: 'CRITICAL',
    riskScore: 99,
    lastUpdated: '2026-09-23T20:00:00Z',
    author: 'Tejax Vulnerability Intelligence',
    version: '3.0',
    aliases: ['AnyConnect Zero-Day', 'VoltTunnel'],
    tags: ['Zero-Day', 'Edge-Device', 'Cisco', 'VPN', 'Pre-Auth', 'CVSS-9.9', 'CISA-KEV'],
    origin: 'Cisco Product Security Incident Response Team (PSIRT)',
    motivation: 'Unauthenticated Remote Code Execution on Perimeter Edge Firewalls',
    targetSectors: ['Critical Infrastructure', 'Government', 'Defense', 'Financial Services', 'Enterprises'],
    summary: 'A pre-authentication buffer overflow in the SSL VPN web server subsystem of Cisco Adaptive Security Appliance (ASA) and Firepower Threat Defense (FTD). Allows remote unauthenticated attackers to execute root shellcode and tunnel into internal networks.',
    technicalDetails: [
      'CVSS v3.1 Base Score: 9.9 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H).',
      'Vulnerability exists in the parsing of HTTP POST requests sent to the /+CSCOE+/webvpn endpoint with crafted session cookie headers.',
      'Memory corruption yields instant execution in root context of the embedded Linux kernel without restarting device services or logging access.',
      'Volt Typhoon and APT28 have actively exploited this flaw to compromise enterprise network perimeters.'
    ],
    killChainStage: 'Exploitation',
    mitreTechniques: [
      { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access' },
      { id: 'T1021.004', name: 'SSH & VPN Tunneling', tactic: 'Lateral Movement' }
    ],
    iocs: [
      { type: 'IP', value: '194.26.29.114', description: 'Scanner IP staging CVE-2026-4401 exploitation probes', confidence: 'HIGH' },
      { type: 'URL', value: 'https://vpn.company.com/+CSCOE+/webvpn', description: 'Vulnerable endpoint URI', confidence: 'HIGH' }
    ],
    detectionQueries: {
      spl: `index=sec_network sourcetype="cisco:asa" message_id IN ("%ASA-3-716001", "%ASA-3-716002", "%ASA-4-722051") 
| stats count by src_ip, dest_ip, message_text`,
      sigma: `title: Cisco ASA WebVPN Memory Corruption Exploit Attempt\nstatus: stable\nlogsource:\n  product: cisco\n  service: asa\ndetection:\n  selection:\n    msg_id: '716001'\n  condition: selection`
    },
    mitigations: [
      'Apply Cisco ASA Software release 9.18.4+ or 9.20.2+ immediately.',
      'Disable clientless SSL VPN mode if not operationally mandatory.',
      'Restrict AnyConnect web access to geofenced or corporate IP access-lists.'
    ],
    references: [
      { title: 'Cisco Security Advisory cisco-sa-asa-ftd-vpn-rce', source: 'Cisco PSIRT' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-ACT-003', 'WIKI-TTP-003']
  },

  // 5. SOC CONCEPTS, FRAMEWORKS & STANDARDS
  {
    id: 'WIKI-CON-001',
    title: 'Diamond Model of Intrusion Analysis',
    category: 'framework',
    severity: 'INFORMATIONAL',
    riskScore: 20,
    lastUpdated: '2026-09-18T10:00:00Z',
    author: 'Tejax CTI Education',
    version: '1.0',
    aliases: ['Diamond Model', 'Intrusion Analysis Standard'],
    tags: ['CTI-Methodology', 'DiamondModel', 'Analysis', 'Framework'],
    origin: 'Center for Cyber Intelligence Analysis and Threat Research (CCIATR)',
    motivation: 'Cognitive Framework for Tracking Adversary Capabilities and Infrastructure',
    targetSectors: ['All SOC & Threat Intel Teams'],
    summary: 'A scientific threat analysis framework establishing the fundamental core relationships of an intrusion activity: Adversary, Capability, Infrastructure, and Victim, linked across two socio-technical axes (Socio-political and Technology).',
    technicalDetails: [
      'Adversary: The threat actor or group behind the campaign (e.g., APT28, Lazarus).',
      'Capability: The malware, tools, exploits, and tradecraft employed by the adversary.',
      'Infrastructure: The physical or logical communication channels, IP addresses, domains, and redirectors connecting Capability to Victim.',
      'Victim: The targeted organization, network, person, or asset being exploited.',
      'Allows analysts to pivot across vertices: given an unknown IP (Infrastructure), identify malware beacon (Capability) and correlate past campaign targets (Victim) to attribute Adversary.'
    ],
    killChainStage: 'Reconnaissance',
    mitreTechniques: [],
    iocs: [],
    detectionQueries: {},
    mitigations: [
      'Integrate the Diamond Model into SOC Incident Ticket workflows to ensure every notable incident identifies all 4 vertices before closing.'
    ],
    references: [
      { title: 'The Diamond Model of Intrusion Analysis (Caltagirone, Pendergast, Betz)', source: 'US DoD / DTIC' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-CON-002', 'WIKI-CON-003']
  },

  {
    id: 'WIKI-CON-002',
    title: 'Traffic Light Protocol (TLP 2.0 Standards)',
    category: 'framework',
    severity: 'INFORMATIONAL',
    riskScore: 10,
    lastUpdated: '2026-09-15T08:00:00Z',
    author: 'Tejax CTI Education',
    version: '2.0',
    aliases: ['TLP Standards', 'FIRST TLP 2.0', 'Information Sharing'],
    tags: ['TLP', 'InformationSharing', 'FIRST', 'Compliance', 'SecurityStandards'],
    origin: 'Forum of Incident Response and Security Teams (FIRST)',
    motivation: 'Standardized Classification for Sensitive Cyber Threat Information Sharing',
    targetSectors: ['Global Information Sharing Communities (ISACs, CERTs, SOCs)'],
    summary: 'The global standard protocol facilitating the controlled sharing of potentially sensitive cyber threat intelligence among organizations, government agencies, and industry partners.',
    technicalDetails: [
      'TLP:RED: For the eyes and ears of named individual recipients only in the specific room or exchange. Never shared with outside teams.',
      'TLP:AMBER+STRICT: Restricted strictly to the recipient organization only; no third-party contractors, subsidiaries, or external service providers.',
      'TLP:AMBER: Restricted to the recipient organization AND their vetted clients or trusted contractors who need-to-know to take defensive action.',
      'TLP:GREEN: Permitted to be shared widely with peers and partner organizations within the security community, but not published openly on public channels.',
      'TLP:CLEAR: Public information that carries minimal or zero risk of harm; may be freely distributed to the world.'
    ],
    killChainStage: 'Reconnaissance',
    mitreTechniques: [],
    iocs: [],
    detectionQueries: {},
    mitigations: [
      'Enforce DLP classification tags adhering to TLP 2.0 on all outgoing CTI advisory PDFs, JSON feeds, and Splunk dispatch emails.'
    ],
    references: [
      { title: 'FIRST Traffic Light Protocol (TLP) Definitions and Usage 2.0', source: 'FIRST.org' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-CON-001', 'WIKI-CON-003']
  },

  {
    id: 'WIKI-CON-003',
    title: 'STIX 2.1 & TAXII 2.1 Threat Sharing Specification',
    category: 'framework',
    severity: 'INFORMATIONAL',
    riskScore: 15,
    lastUpdated: '2026-09-19T14:00:00Z',
    author: 'Tejax CTI Engineering',
    version: '2.1',
    aliases: ['STIX', 'TAXII', 'OASIS Standard', 'Threat Exchange'],
    tags: ['STIX2.1', 'TAXII2.1', 'JSON', 'ThreatSharing', 'OASIS', 'Standards'],
    origin: 'OASIS Cyber Threat Intelligence (CTI) Technical Committee',
    motivation: 'Machine-Readable Standard for Cyber Threat Intelligence Exchange',
    targetSectors: ['All Cyber Security Platforms'],
    summary: 'STIX (Structured Threat Information eXpression) is a standardized JSON graph-based language for cyber threat intelligence, while TAXII (Trusted Automated eXchange of Intelligence Information) is the transport protocol over HTTPS.',
    technicalDetails: [
      'STIX Domain Objects (SDOs): Attack-pattern, campaign, indicator, identity, malware, threat-actor, tool, vulnerability.',
      'STIX Relationship Objects (SROs): Links objects with standardized verbs (indicates, targets, uses, attributed-to).',
      'STIX Cyber Observables (SCOs): Concrete atomic artifacts such as ipv4-addr, domain-name, file:hashes.SHA-256.',
      'TAXII Collections and Channels allow automated pub/sub ingestion into SIEMs and SOAR platforms without human intervention.'
    ],
    killChainStage: 'Reconnaissance',
    mitreTechniques: [],
    iocs: [],
    detectionQueries: {},
    mitigations: [
      'Deploy automated STIX/TAXII 2.1 collector feeds into Splunk ES Threat Intelligence framework.'
    ],
    references: [
      { title: 'OASIS STIX 2.1 Specification Standard', source: 'OASIS Open' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-CON-001', 'WIKI-CON-002']
  },

  // 6. TOOLS & DEFENSE TECHNOLOGIES
  {
    id: 'WIKI-TOOL-001',
    title: 'Sigma Rules: Open Generic Detection Format',
    category: 'tool',
    severity: 'MEDIUM',
    riskScore: 50,
    lastUpdated: '2026-09-22T11:00:00Z',
    author: 'Tejax Detection Engineering',
    version: '1.0',
    aliases: ['SIGMA', 'Generic Signatures', 'pySigma'],
    tags: ['DetectionEngineering', 'Sigma', 'Splunk-SPL', 'KQL', 'YAML', 'OpenSource'],
    origin: 'Florian Roth & Thomas Patzke (Open Source Community)',
    motivation: 'Universal Vendor-Agnostic Detection Rule Definition',
    targetSectors: ['All SOCs & Detection Engineers'],
    summary: 'Sigma is a generic and open signature format that allows analysts to describe relevant log events in a vendor-neutral YAML structure. Rules can be compiled automatically into Splunk SPL, Microsoft Sentinel KQL, QRadar AQL, and Elastic Lucene queries.',
    technicalDetails: [
      'Logsource defines the category (process_creation, image_load, network_connection) and product (windows, linux, aws).',
      'Detection section utilizes condition expressions (selection and not filter) with powerful string transformers (|contains, |endswith, |base64).',
      'Tejax AI SOC natively cross-compiles Sigma definitions directly into running Splunk SPL detection rules in real-time.'
    ],
    killChainStage: 'Exploitation',
    mitreTechniques: [],
    iocs: [],
    detectionQueries: {
      sigma: `title: Suspicious PowerShell Download Cradle\nstatus: stable\nlogsource:\n  category: process_creation\n  product: windows\ndetection:\n  selection:\n    CommandLine|contains:\n      - 'IEX(New-Object Net.WebClient).DownloadString'\n      - 'Invoke-Expression'\n      - 'DownloadFile'\n  condition: selection`
    },
    mitigations: [
      'Maintain an automated CI/CD pipeline synchronizing upstream Sigma rules with active SIEM correlation searches.'
    ],
    references: [
      { title: 'SigmaHQ Official GitHub Repository', source: 'SigmaHQ' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-TTP-001', 'WIKI-MAL-001']
  },

  {
    id: 'WIKI-TOOL-002',
    title: 'YARA: The Pattern Matching Swiss Knife for Malware',
    category: 'tool',
    severity: 'MEDIUM',
    riskScore: 50,
    lastUpdated: '2026-09-21T09:00:00Z',
    author: 'Tejax Malware Analysis Lab',
    version: '4.5.1',
    aliases: ['YARA', 'Malware Rule Engine', 'Victor Alvarez'],
    tags: ['MalwareAnalysis', 'YARA', 'Signatures', 'MemoryInspection', 'DFIR'],
    origin: 'Victor Alvarez (VirusTotal / Google)',
    motivation: 'Multi-Platform File and In-Memory Pattern Matching',
    targetSectors: ['All DFIR & Threat Analysis Labs'],
    summary: 'YARA is a tool aimed at helping malware researchers identify and classify malware samples based on textual or binary patterns, hex wildcards, and regular expressions, evaluated against disk files or active process memory.',
    technicalDetails: [
      'Rule sections include meta (metadata/author/date), strings (hexadecimal, text, regex), and condition (boolean logic).',
      'PE module enables parsing of PE headers: pe.imphash() == "...", pe.sections[0].name == ".text", and digital certificate validation.',
      'Widely integrated into EDR scanners, email gateways, sandbox detonation chambers, and forensic triage scripts.'
    ],
    killChainStage: 'Exploitation',
    mitreTechniques: [],
    iocs: [],
    detectionQueries: {
      yara: `rule Windows_CobaltStrike_Malleable_Profile {\n  meta:\n    author = "Tejax CTI"\n    threat = "Cobalt Strike"\n  strings:\n    $http_get = "/api/v2/telemetry" ascii\n    $ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" ascii\n  condition:\n    uint16(0) == 0x5A4D and all of ($*)\n}`
    },
    mitigations: [
      'Run periodic YARA memory sweeps across high-value Tier-1 Domain Controllers.'
    ],
    references: [
      { title: 'YARA Documentation and VirusTotal Integration', source: 'VirusTotal' }
    ],
    userId: "system", relatedArticleIds: ['WIKI-MAL-001', 'WIKI-ACT-001']
  }
];
