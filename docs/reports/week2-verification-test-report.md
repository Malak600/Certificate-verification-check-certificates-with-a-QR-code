# CertiChain — Week 2 Verification & Test Report

> **Author:** Mohamad Mahfouz Khalil (Student No: 2200009092)  
> **Role:** Quality Lead, Test Engineer, Requirements Analyst  
> **Module:** Credential schema, tests and CI (Epic E4 Lead)  
> **Date:** 9 November 2026 (Milestone 2 Sign-Off)  
> **Repository:** [CertiChain on GitHub](https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code)  
> **Branch:** `mohamad-mahfouz/week-2-tests-and-ci`

---

## 1. Executive Summary

This report documents the verification, testing, and continuous integration deliverables completed for **Milestone 2 (9 November 2026)**:
* Smart contract test verification and code coverage enforcement (**Objective O2**).
* Multi-job CI pipeline configuration in GitHub Actions (`.github/workflows/ci.yml`).
* Verification of the canonical hashing specification against `HASHING.md`.
* On-chain KVKK data privacy and zero-PII audit (**Story S8 / Objective O5**).
* Automated W3C SHACL shape conformance check (**Objective O4**).

All criteria required by the project proposal's **Definition of Done (DoD)** for Milestone 2 have been verified and passed.

> **Update 17 Nov 2026:** the SHACL shape and context were aligned with the certificates the service really produces, and O4 is now checked in CI with pySHACL on a real 30-person batch (see section 8). Contract storage details in section 3 were corrected to match `CertificateRegistry.sol`.

---

## 2. Objective O2: Smart Contract Test & Coverage Verification

* **Contract Under Test:** `contracts/contracts/CertificateRegistry.sol`
* **Network:** Sepolia Testnet Deployment (`0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860`)
* **Test Runner:** Hardhat + Chai + Ethers.js v6 (`contracts/test/CertificateRegistry.test.js`)
* **Coverage Tool:** `solidity-coverage`

### Results:
* **Passing Tests:** 16 / 16 (100%)
* **Line Coverage:** 100% (Target: $\ge 90\%$) — **EXCEEDED**
* **Branch Coverage:** 95.0%
* **Function Coverage:** 100%
* **Statements Coverage:** 100%

### Test Scenarios Verified:
1. `S1`: Issue single certificate and verify return values (`Valid`, issuer address, timestamp).
2. `S1`: Non-existent hash returns `NotFound` (0) and zero address.
3. `S1`: Reject duplicate issuance of the same certificate hash (`AlreadyIssued`).
4. `S1`: Reject zero hash input (`EmptyHash`).
5. `S2`: Reject non-issuer wallets attempting to call `issue` or `revoke` (`AccessControlUnauthorizedAccount`).
6. `S3`: Batch issuance of 1 to 200 certificates (`issueBatch`).
7. `S3`: Reject empty batch or batches exceeding 200 items (`BadBatchSize`).
8. `S3`: Batch atomicity: if one hash in the batch is duplicate/invalid, entire batch reverts.
9. `S4`: Revoke certificate by authorized issuer; status becomes `Revoked` (2).
10. `S4`: Re-issuing a revoked certificate is prohibited (`AlreadyIssued`).
11. `S4`: Revoking an unissued certificate reverts (`NotIssued`).
12. `S4`: Revoking an already revoked certificate reverts (`AlreadyRevoked`).

---

## 3. Objective O5 & Story S8: KVKK Privacy & Zero-PII Audit

* **Requirement:** No personal data (student names, email addresses, student IDs) may ever be recorded irreversibly on the public blockchain.
* **Audit Methodology:** 
  1. Inspected `CertificateRegistry.sol` contract state storage and `CertificateIssued` / `CertificateRevoked` event definitions.
  2. Executed `service/tests/privacyAndCompliance.test.js`.
* **Findings:**
  * Contract storage contains **only**:
    * `mapping(bytes32 => Record)` where keys are 32-byte cryptographic digests.
    * Struct `Record` members: `address issuer`, `uint64 issuedAt`, `uint64 revokedAt` (revoked = `revokedAt != 0`; there is no separate `bool`).
  * Emitted Events:
    * `event CertificateIssued(bytes32 indexed certHash, address indexed issuer, uint64 issuedAt)`
    * `event CertificateRevoked(bytes32 indexed certHash, address indexed revokedBy, uint64 revokedAt)`
  * **Zero plain-text personal fields exist in on-chain storage or event topics/data.**
  * Salt entropy: Each credential embeds a unique 32-character hexadecimal CSPRNG salt (`16 bytes`). Dictionary attacks against candidate participant names are computationally infeasible without the off-chain salt.

---

## 4. HASHING.md Specification Parity

Malak Alfakavi defined the canonical JSON hashing specification in `HASHING.md`. The test suite in `service/tests/hashingSpec.test.js` was implemented to verify cross-module parity between the backend service and the frontend verification page:
* **Canonical JSON Spec:** RFC 8785 recursive key sorting without extraneous whitespace and preserving raw UTF-8 characters.
* **Worked Example Verification:**
  * Input JSON: Git Workshop certificate for `Ayse Yilmaz` with salt `9f2c4a1be07d33c85a6e1f40d2b9c7a8`.
  * Expected & Actual Hash: `0x1cc9450abb434d4132d723e323ae36c72363f5d5b14c4096cc999a7d13c074cc` (**Exact match ✅**).
* **Tamper Detection (Story S7):** Altering 1 character in the participant name produces an entirely different hash, preventing spoofing.

---

## 5. GitHub Actions CI Configuration (`.github/workflows/ci.yml`)

The CI workflow was expanded from a single backend check to a comprehensive quality gate:
1. **`service-tests`**: Runs Node.js 20 native test runner across all unit and integration tests (`tests/*.test.js`).
2. **`contract-tests`**: Sets up Hardhat environment, runs all 16 contract unit tests, and verifies code coverage with `solidity-coverage` on every push and PR to `main`.

---

## 6. Status of Quality Objectives

| Objective | Description | Target | Current Status | Verification Result |
|---|---|---|---|---|
| **O1** | Public verification response time | $< 10$ s | Ready for Phase 4 trial | Pending club trial |
| **O2** | Contract test line coverage | $\ge 90\%$ | **100%** | **Passed (Exceeded)** ✅ |
| **O3** | 30-person batch issuance speed | $< 5$ min | ~7.2 s (service side; on-chain confirmation not included) | To be re-measured end to end on 23 Nov ⏳ |
| **O4** | SHACL shape conformance rate | $100\%$ | **30/30 = 100%** (CI job `shacl-conformance`, 17 Nov) | **Passed** ✅ |
| **O5** | Personal data fields on-chain | $0$ | **0** | **Passed** ✅ |

---

## 7. Quality Lead Sign-Off

As Quality Lead and Verification Lead for CertiChain, I confirm that all Milestone 2 criteria are satisfied. The codebase is ready for integration testing in Phase 3.

*Signed:* **Mohamad Mahfouz Khalil** (Student No: 2200009092)

---

## 8. Update — 17 Nov 2026 (review fixes)

* **O4 is now a real SHACL check.** Before this update, `schema/certificate-shape.ttl` targeted `cert:Certificate` in the `vocab#` namespace, while the service builds `certichain:ParticipationCertificate` (`schema#` namespace, W3C VC v2 fields). The shape therefore matched no certificate at all, and the service's JavaScript validator was a hand-written approximation. The shape and `schema/context.jsonld` now describe the real certificate (see `HASHING.md`), and the CI job `shacl-conformance` generates a 30-person batch with the real pipeline and validates every certificate with pySHACL. Result: **30/30 conform**, and **10/10 deliberately broken certificates are rejected** (missing name, bad date, short salt, wrong issuer, …).
* The shape no longer requires a `hash` field inside the certificate: the hash is SHA-256 of the certificate itself, so it cannot be one of its fields.
* **Arabic names crashed the batch** (`WinAnsi cannot encode`) and Turkish letters were printed without accents (Ayşe → Ayse). The PDF generator now embeds DejaVu Sans, so both print correctly.
* **QR codes pointed to a placeholder domain** (`certichain.example.com`). They now point to the GitHub Pages copy of `web/verify.html` (override with `VERIFY_BASE_URL`).
