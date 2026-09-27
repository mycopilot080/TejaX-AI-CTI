import { SIEMLogEvent } from '../types/cti';

const now = Date.now();
const minute = 60 * 1000;

// DEV INSTANCE LOG EVENTS (STAGING & TEST)
export const DEV_SIEM_LOGS: SIEMLogEvent[] = [
  {
    _time: new Date(now - 1 * minute).toISOString(),
    _raw: '2026-09-24T09:21:00Z index=dev-winlogs host=DEV-WIN-HOST-01 sourcetype=sysmon EventCode=10 TargetImage="C:\\Windows\\System32\\lsass.exe" SourceImage="C:\\TestTools\\mimikatz_test.exe" GrantedAccess="0x1010" user="DEV-DOMAIN\\test_analyst"',
    host: 'DEV-WIN-HOST-01',
    sourcetype: 'sysmon',
    source: 'XmlWinEventLog:Microsoft-Windows-Sysmon/Operational',
    user: 'DEV-DOMAIN\\test_analyst',
    src_ip: '10.0.99.12',
    process_name: 'mimikatz_test.exe',
    parent_process: 'cmd.exe',
    command_line: 'mimikatz_test.exe "privilege::debug" exit',
    event_id: 10,
    status: 'SUSPICIOUS',
    risk_score: 90,
    signature: '[DEV TEST] Synthetic LSASS Memory Dump'
  },
  {
    _time: new Date(now - 4 * minute).toISOString(),
    _raw: '2026-09-24T09:18:00Z index=dev-hec sourcetype=hec:raw channel=HEC-DEV-TOKEN-9942 status="SUCCESS" bytes_received=1420 eps=120 message="Synthetic burst payload test via HEC collector"',
    host: 'HEC-DEV-COLLECTOR',
    sourcetype: 'hec:raw' as any,
    source: 'http:hec_dev_stream',
    user: 'hec_service_account',
    src_ip: '10.0.99.50',
    status: 'SUCCESS',
    risk_score: 10,
    signature: '[DEV TEST] HEC Endpoint Payload Stream'
  },
  {
    _time: new Date(now - 7 * minute).toISOString(),
    _raw: '2026-09-24T09:15:00Z index=dev-netlogs host=DEV-SCADA-PLC-01 sourcetype=cisco:asa dest_port=502 protocol="TCP" modbus_function=15 action="permitted" src_ip="10.0.99.88"',
    host: 'DEV-SCADA-PLC-01',
    sourcetype: 'cisco:asa',
    source: 'udp:514',
    src_ip: '10.0.99.88',
    dest_ip: '172.16.40.99',
    dest_port: 502,
    status: 'SUSPICIOUS',
    risk_score: 80,
    signature: '[DEV TEST] Modbus Coil Force Simulation'
  },
  {
    _time: new Date(now - 12 * minute).toISOString(),
    _raw: '2026-09-24T09:10:00Z index=dev-cloudlogs host=DEV-OKTA-STAGING sourcetype=okta:system eventType="app.oauth2.as.grant_consent" actor="dev_tester@enterprise.com" client_id="0oa_test_9912" app_title="Dev Test SaaS App"',
    host: 'DEV-OKTA-STAGING',
    sourcetype: 'okta:system',
    source: 'Okta:TestAPI',
    user: 'dev_tester@enterprise.com',
    src_ip: '198.51.100.99',
    status: 'SUSPICIOUS',
    risk_score: 75,
    signature: '[DEV TEST] Staging OAuth App Consent Grant'
  }
];

// PROD INSTANCE LOG EVENTS (PRODUCTION ENTERPRISE SOC)
export const PROD_SIEM_LOGS: SIEMLogEvent[] = [
  {
    _time: new Date(now - 2 * minute).toISOString(),
    _raw: '2026-09-24T09:20:12Z index=winlogs host=DC-GLOBAL-01 sourcetype=sysmon EventCode=10 TargetImage="C:\\Windows\\System32\\lsass.exe" SourceImage="C:\\Users\\Public\\Downloads\\mimikatz.exe" GrantedAccess="0x1010" CallTrace="C:\\Windows\\SYSTEM32\\ntdll.dll+9d12a" user="GLOBAL\\s_admin"',
    host: 'DC-GLOBAL-01',
    sourcetype: 'sysmon',
    source: 'XmlWinEventLog:Microsoft-Windows-Sysmon/Operational',
    user: 'GLOBAL\\s_admin',
    src_ip: '10.0.4.12',
    process_name: 'mimikatz.exe',
    parent_process: 'cmd.exe',
    command_line: 'mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" exit',
    event_id: 10,
    status: 'SUSPICIOUS',
    risk_score: 95,
    signature: 'LSASS Process Memory Dump Attempt'
  },
  {
    _time: new Date(now - 5 * minute).toISOString(),
    _raw: '2026-09-24T09:17:00Z index=winlogs host=FINANCE-WS-09 sourcetype=WinEventLog:Security EventCode=4688 NewProcessName="C:\\Windows\\System32\\vssadmin.exe" ProcessCommandLine="vssadmin.exe delete shadows /all /quiet" SubjectUserName="m_chen" SubjectDomainName="GLOBAL"',
    host: 'FINANCE-WS-09',
    sourcetype: 'WinEventLog:Security',
    source: 'WinEventLog:Security',
    user: 'GLOBAL\\m_chen',
    src_ip: '192.168.1.104',
    process_name: 'vssadmin.exe',
    parent_process: 'powershell.exe',
    command_line: 'vssadmin.exe delete shadows /all /quiet',
    event_id: 4688,
    status: 'SUSPICIOUS',
    risk_score: 92,
    signature: 'Ransomware Shadow Copy Deletion'
  },
  {
    _time: new Date(now - 8 * minute).toISOString(),
    _raw: '2026-09-24T09:14:22Z index=winlogs host=FINANCE-WS-09 sourcetype=WinEventLog:Security EventCode=4625 TargetUserName="m_chen" TargetDomainName="GLOBAL" Status="0xC000006D" SubStatus="0xC000006A" WorkstationName="FINANCE-WS-09" LogonType=3 IpAddress="192.168.1.104"',
    host: 'FINANCE-WS-09',
    sourcetype: 'WinEventLog:Security',
    source: 'WinEventLog:Security',
    user: 'm_chen',
    src_ip: '192.168.1.104',
    event_id: 4625,
    status: 'FAILURE',
    risk_score: 45,
    signature: 'Anomalous Logon Failure'
  },
  {
    _time: new Date(now - 18 * minute).toISOString(),
    _raw: '2026-09-24T09:04:10Z index=netlogs host=FW-CORE-01 sourcetype=cisco:asa %ASA-6-302013: Built outbound TCP connection 89124012 for VPN-SSL:185.220.101.5/4433 (185.220.101.5/4433) to OT-SUBNET:10.100.2.14/22 (10.100.2.14/22)',
    host: 'FW-CORE-01',
    sourcetype: 'cisco:asa',
    source: 'udp:514',
    user: 'vpn_ext_user',
    src_ip: '185.220.101.5',
    dest_ip: '10.100.2.14',
    dest_port: 22,
    action: 'built',
    status: 'SUSPICIOUS',
    risk_score: 88,
    signature: 'Volt Typhoon Tunneling to OT Subnet'
  },
  {
    _time: new Date(now - 35 * minute).toISOString(),
    _raw: '2026-09-24T08:47:18Z index=cloudlogs host=AWS-PROD-CT sourcetype=aws:cloudtrail eventName="StopLogging" eventSource="cloudtrail.amazonaws.com" user="arn:aws:iam::410368832386:user/dev_deployer" sourceIPAddress="45.154.255.82"',
    host: 'AWS-PROD-CT',
    sourcetype: 'aws:cloudtrail',
    source: 'aws:cloudtrail:prod',
    user: 'dev_deployer',
    src_ip: '45.154.255.82',
    action: 'StopLogging',
    status: 'SUSPICIOUS',
    risk_score: 90,
    signature: 'AWS CloudTrail Disabled'
  },
  {
    _time: new Date(now - 45 * minute).toISOString(),
    _raw: '2026-09-24T08:37:44Z index=cloudlogs host=OKTA-TENANT-PROXY sourcetype=okta:system eventType="app.oauth2.as.grant_consent" actor="e_brown@enterprise.com" client_id="0oag1920aa912" app_title="ShadowSaaS Reader v2" result="SUCCESS"',
    host: 'OKTA-TENANT-PROXY',
    sourcetype: 'okta:system',
    source: 'Okta:API:Logs',
    user: 'e_brown@enterprise.com',
    src_ip: '198.51.100.41',
    status: 'SUSPICIOUS',
    risk_score: 78,
    signature: 'Unverified OAuth App Consent Granted'
  }
];

export const INITIAL_SIEM_LOGS: SIEMLogEvent[] = [...PROD_SIEM_LOGS, ...DEV_SIEM_LOGS];
