# Security Specification

## 1. Data Invariants
- Threat Feed Advisories can be read by anyone (public/authenticated CTI stream).
- Creating or updating Threat Feed Advisories requires authenticated users with valid feed payload structures (title, cveId, source, cvssScore, summary).
- Asset inventory and contact records can be queried and read by authenticated SOC users and analysts.
- Updates to vulnerabilities or assets require valid property types and bounded lengths.

## 2. Dirty Dozen Test Cases (Negative Validation Payload Verification)
1. Injecting 10MB string into advisory title -> REJECTED (max 512 chars).
2. Missing required field cveId -> REJECTED.
3. Unauthenticated write to threat_feeds -> REJECTED.
4. Setting non-numeric CVSS score -> REJECTED.
5. Injecting malicious scripts into asset hostname -> REJECTED.
6. Path variable injection with >128 length ID -> REJECTED.
7. Modifying immutable createdAt/publishedAt improperly on asset -> REJECTED.
8. Unauthenticated delete operation on contacts -> REJECTED.
9. Oversized array injection into targetSectors (>100 elements) -> REJECTED.
10. Anonymous asset creation without auth -> REJECTED.
11. Invalid status field on contact detail -> REJECTED.
12. Attempting shadow fields injection on threat_feeds write -> REJECTED.
