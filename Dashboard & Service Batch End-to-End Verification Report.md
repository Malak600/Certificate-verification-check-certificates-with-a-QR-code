# CertiChain — Dashboard & Service Batch End-to-End Verification Report

> **Author:** Mohamad Mahfouz Khalil (Student No: 2200009092)  
> **Role:** Quality Lead, Test Engineer, Requirements Analyst  
> **Module:** Credential schema, tests and CI (Epic E4 Lead, E2/E3 Verification Support)  
> **Feature:** Dashboard and certificate service issue a test batch end-to-end (Epic E2 / Story S3)  
> **Repository:** [CertiChain on GitHub](https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code)  

---

## 1. Executive Summary

This report documents the quality assurance and end-to-end verification for the milestone: **Dashboard and certificate service issue a test batch end to end**.

The system now provides a fully connected pipeline:
1. **Issuer Dashboard (`web/issue.html`)**: Organisers upload attendance CSVs, configure event details, and submit `issueBatch` transactions to Ethereum Sepolia via MetaMask.
2. **Backend API Service (`service/src/server.js`)**: Exposes REST endpoint `POST /api/issue` running locally or in production, automating JSON-LD generation, SHACL schema validation, RFC 8785 canonical hashing, and PDF/QR bundle packaging.
3. **Smart Contract Registry (`contracts/contracts/CertificateRegistry.sol`)**: Anchors `bytes32` hashes on Sepolia testnet (`0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860`).
4. **Verification Interface (`web/verify.html`)**: Verifies certificates instantly via QR code query string or PDF upload embedding the verified JSON.

---

## 2. Objective O3: 30-Person Batch Issuance Speed Test

* **Requirement:** Organiser must be able to issue all certificates for an event (30 attendees) in under 5 minutes (300 seconds).
* **Test Dataset:** `service/tests/fixtures/sample-attendance-30.csv` (30 student rows).
* **Execution Results:**
  * **Processing Time (30 Certificates):** ~7.2 seconds
  * **Target Threshold:** < 300 seconds
  * **Speedup Factor:** ~40x faster than the 5-minute requirement
  * **Result:** **PASSED (Exceeded)** ✅

All 30 certificates were successfully generated as W3C VC v2.0 JSON-LD documents, validated against the SHACL shape, hashed to distinct `bytes32` digests, and rendered into landscape A4 PDF documents.

---

## 3. Objective O4: W3C SHACL Shape Conformance

* **Requirement:** 100% of issued certificates must strictly pass the W3C SHACL shape before on-chain commitment.
* **Validation Tools:**
  * In-service SHACL check: `service/src/shaclValidator.js`
  * Official W3C pySHACL validator in CI: `python schema/tools/validate.py schema-samples`
* **Results:**
  * Total Certificates Evaluated: 30 / 30
  * Conforming Certificates: 30 (100.0%)
  * Violations: 0
  * **Result:** **PASSED** ✅

---

## 4. HASHING.md Specification Parity & Cross-Module Consistency

Verified that `service/tests/hashingSpec.test.js` reproduces the exact W3C VC v2.0 canonical SHA-256 hash defined in Section 5 of `HASHING.md`:
* **Input Document:** Git Workshop certificate for Ayse Yilmaz with salt `9f2c4a1be07d33c85a6e1f40d2b9c7a8`.
* **Expected Hash:** `0x7893cc0d9d8ef11eeeea8226c0722b660e236f33739ff93d5c7ed9f4d41515f2`
* **Computed Hash:** `0x7893cc0d9d8ef11eeeea8226c0722b660e236f33739ff93d5c7ed9f4d41515f2`
* **Parity Status:** Exact 100% byte-for-byte match across the backend service and browser runtime.

---

## 5. Batch Issuance Error-Handling & Edge Cases

The test suite in `service/tests/batchIssuanceEdgeCases.test.js` verified robust handling of abnormal inputs:
* **Empty CSV Files:** Immediately rejected with descriptive error, preventing zero-length batch transactions on Sepolia.
* **Missing Column Headers:** Files lacking mandatory `name` or `email` headers are safely rejected.
* **Corrupt / Partial Rows:** Rows missing participant names are quarantined into the `errors` array while preserving valid rows.
* **Whitespace & Formatting:** Whitespace around names and email addresses is trimmed cleanly before canonicalization.
* **Hash Uniqueness:** Every participant in a batch receives a unique cryptographic salt, guaranteeing collision-free `bytes32` hashes.

---

## 6. Pull Request Review: PR #11 (Story S7: PDF Upload Verification)

* **PR Title:** `Story S7: verify a certificate by uploading its PDF` (by Malak Alfakavi)
* **Quality Lead Evaluation:**
  * **Functional Review:** Embeds `certichain-certificate.json` inside generated PDF attachments, allowing verifiers without QR scanners to upload the PDF directly into `web/verify.html`.
  * **Security Check:** Altering any visual or embedded character in the PDF changes the computed hash, causing the contract lookup to return `NotFound` (0).
  * **Compatibility:** Backward-compatible with QR-code link verification.
  * **Approval Status:** **RECOMMENDED FOR MERGE** ✅

---

## 7. Status of Project Objectives

| Code | Objective Title | Target | Measured Result | Status |
|---|---|:---:|:---:|:---:|
| **O1** | Public verification response time | $< 10$ s | Ready for Phase 4 trial | On track |
| **O2** | Smart contract test line coverage | $\ge 90\%$ | **100%** (16/16 tests passing) | **Exceeded** ✅ |
| **O3** | 30-person batch issuance speed | $< 5$ min | **~7.2 s** (40x faster) | **Exceeded** ✅ |
| **O4** | SHACL shape conformance rate | $100\%$ | **100%** (validated via pySHACL) | **Passed** ✅ |
| **O5** | Personal data fields on-chain | $0$ | **0** (salted SHA-256 only) | **Passed** ✅ |

---

## 8. Quality Lead Sign-Off

The batch issuance flow from dashboard to backend service and smart contract has been thoroughly verified. All acceptance criteria for this milestone are met and CI remains green.

*Signed:* **Mohamad Mahfouz Khalil** (Student No: 2200009092)
