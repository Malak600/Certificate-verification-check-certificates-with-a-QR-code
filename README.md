# CertiChain

**Verifiable blockchain certificates for university club events**

> SEN0401 Special Topics: Blockchain · Istanbul Kültür University · 2026–2027 Fall  
> Status: ✅ **Implemented & Verified** on Ethereum Sepolia Testnet

---

## Live Deployment (Ethereum Sepolia)

- **Smart Contract:** `CertificateRegistry.sol` (Solidity `v0.8.34`, OpenZeppelin `AccessControl`)
- **Contract Address:** [`0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860`](https://sepolia.etherscan.io/address/0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860#code)
- **Verification Status:** Verified Source Code & ABI on Sepolia Etherscan ✅
- **Test Coverage:** 100% Line Coverage · 95.45% Branch Coverage (Hardhat)

---

## The Problem

Student clubs at IKU give out workshop and event certificates as plain PDF files. Anyone with a PDF editor can change the name or date, and the fake looks exactly like the real one. When an employer or internship coordinator wants to check a certificate, the only option is to ask the club and wait. After the board graduates, the records are often gone.

Our customer, the **IKU Computer Club**, issues about **150–200 certificates per semester** (50–70 per event). Today, checking one certificate means searching Excel files and Google Drive by hand, which takes **1–2 days**.

---

## Our Solution

CertiChain lets a club issue certificates that **anyone can verify in seconds**, without contacting the club or trusting a central server:

1. The **event organiser** uploads the attendance list (CSV) and event metadata via the Issuer Dashboard (`issue.html`).
2. The backend service builds each certificate as a **W3C JSON-LD** credential, validates it against a **SHACL** shape, computes its canonical **SHA-256 hash** (see [HASHING.md](HASHING.md)), and embeds a verification **QR code** into a downloadable PDF.
3. The organiser anchors the batch of SHA-256 hashes onto **Ethereum Sepolia** via **MetaMask** (`issueBatch`).
4. A **verifier** scans the QR code or uploads the PDF/JSON-LD on the Verification Page (`verify.html`) and immediately sees **✅ Valid**, **⚠️ Revoked**, or **❌ Not found**.

Only cryptographic hashes go on chain. **No personal data is stored on the blockchain** (KVKK compliant).

---

## Architecture & Workflow

```mermaid
flowchart LR
    O[Event organiser] -->|CSV + event info| D[Issuer dashboard<br/>web/issue.html]
    D -->|POST /api/batches| S[Certificate service<br/>Node.js · JSON-LD + SHACL + PDF/QR]
    S -->|SHA-256 hashes + PDFs| D
    D -->|issueBatch via MetaMask| C[(CertificateRegistry<br/>Sepolia Testnet)]
    S -->|PDF with QR| H[Certificate holder]
    H -->|shares QR / PDF| V[Verifier]
    V --> P[Verification page<br/>web/verify.html]
    P -->|verify hash · free RPC read| C