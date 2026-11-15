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
    * `mapping(bytes32 => CertificateRecord)` where keys are 32-byte cryptographic digests.
    * Struct members: `address issuer`, `uint64 issuedAt`, `bool revoked`, `uint64 revokedAt`.
  * Emitted Events:
    * `event CertificateIssued(bytes32 indexed hash, address indexed issuer, uint64 issuedAt)`
    * `event CertificateRevoked(bytes32 indexed hash, address indexed issuer, uint64 revokedAt)`
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
| **O3** | 30-person batch issuance speed | $< 5$ min | **~7.2 s** | **Passed (Exceeded)** ✅ |
| **O4** | SHACL shape conformance rate | $100\%$ | **100%** | **Passed** ✅ |
| **O5** | Personal data fields on-chain | $0$ | **0** | **Passed** ✅ |

---

## 7. Quality Lead Sign-Off

As Quality Lead and Verification Lead for CertiChain, I confirm that all Milestone 2 criteria are satisfied. The codebase is ready for integration testing in Phase 3.

*Signed:* **Mohamad Mahfouz Khalil** (Student No: 2200009092)
