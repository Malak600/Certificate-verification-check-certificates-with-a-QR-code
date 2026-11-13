# CertiChain — Certificate Generator & Storage API Service

> **Developer:** Ammar Cashlan (Student No: 2200002676)  
> **Role:** Backend Developer, Data Engineer, Work-Log Steward  
> **Module:** Certificate generator and storage service (Epic E2 Lead, E1/E4 Support)  
> **Course:** SEN0401 Special Topics: Blockchain · Istanbul Kültür University  
> **GitHub Repository:** [CertiChain on GitHub](https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code)

---

## 1. Executive Summary & Purpose

The `service` module is the off-chain core engine of the CertiChain system. It automates the full lifecycle of university workshop credentials:
1. Ingests and validates event attendance rosters from CSV files via programmatic function or REST API (`POST /api/issue`).
2. Constructs standards-compliant **W3C Verifiable Credentials (VC v2.0)** with **PROV-O** provenance tracking.
3. Gates all credentials through automated **W3C SHACL shape validation** before any hashing or blockchain commitment.
4. Performs deterministic **RFC 8785 canonical JSON** serialization and generates salted **SHA-256 (`bytes32`)** digests matching the team spec in `HASHING.md`.
5. Renders print-ready, high-resolution **tamper-evident PDF certificates** with embedded QR codes linking to instant on-chain verification (`?hash=0x...`).
6. Guarantees **KVKK (Turkish Data Protection Law)** compliance: zero personally identifiable information (PII) is ever written to the public blockchain.

---

## 2. API Endpoints

The service includes a built-in HTTP server (`src/server.js`) with CORS enabled for direct connection with the frontend (`web/issue.html`):

### `POST /api/issue`
Uploads attendance CSV and event metadata, generates certificates, returns hashes for MetaMask and PDF download URLs.

**Request Body (JSON):**
```json
{
  "csv": "name,email\nAmmar Cashlan,2200002676@stu.iku.edu.tr\nParticipant One,p1@stu.iku.edu.tr",
  "title": "Git Workshop",
  "date": "2026-12-05",
  "clubName": "IKU Computer Club",
  "walletAddress": "0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860"
}
```

**Response (JSON):**
```json
{
  "success": true,
  "total": 2,
  "hashes": [
    "0x56f851b19ae2ed14bad6f99a93c4d8f4e649cd56018c7acf4574a585860b8230",
    "0x43f4673ed13b4beac0d8ee74bb83e0e50b4f224b208cc5038bb2215d613856ea"
  ],
  "items": [
    {
      "name": "Ammar Cashlan",
      "email": "2200002676@stu.iku.edu.tr",
      "hash": "0x56f851...",
      "verificationUrl": "https://certichain.example.com/verify?hash=0x56f851...",
      "pdfDownloadUrl": "/api/certificate/0x56f851.../pdf"
    }
  ]
}
```

### `GET /api/certificate/:hash`
Returns the full stored W3C VC v2.0 JSON-LD document for the certificate.

### `GET /api/certificate/:hash/pdf`
Downloads the rendered certificate PDF with embedded QR code.

### `GET /api/health`
Health check endpoint (`{ "status": "ok", "service": "certichain-api" }`).

---

## 3. Directory Structure

```
service/
├── .env.example                       # Environment configuration template
├── package.json                       # ESM project configuration, scripts & deps
├── README.md                          # Comprehensive documentation (this file)
├── src/
│   ├── server.js                      # REST API server (POST /api/issue, GET /api/certificate/:hash)
│   ├── index.js                       # Main orchestrator & public API (processBatch)
│   ├── utils.js                       # Crypto, salts, IDs, and URL helpers
│   ├── csvParser.js                   # Attendance CSV ingestion & validation
│   ├── certificateBuilder.js          # W3C VC JSON-LD credential builder
│   ├── certificateHasher.js           # Deterministic canonical JSON & SHA-256 hasher
│   ├── shaclValidator.js              # SHACL validation gate (enforces schema/)
│   ├── qrGenerator.js                 # QR code generator (PNG Buffer / Data URL)
│   └── pdfGenerator.js                # PDF certificate renderer (pdf-lib)
├── tests/
│   ├── fixtures/
│   │   ├── sample-attendance-3.csv    # 3-row test dataset
│   │   └── sample-attendance-30.csv   # 30-row test dataset (TC3 requirement)
│   ├── server.test.js                 # REST API endpoints unit & integration tests
│   ├── csvParser.test.js              # CSV ingestion & edge case tests
│   ├── certificateBuilder.test.js     # VC structure & provenance tests
│   ├── certificateHasher.test.js      # Canonicalization, determinism & tamper tests
│   ├── shaclValidator.test.js          # Schema constraints & violation tests
│   ├── qrGenerator.test.js            # QR buffer, PNG header & error correction tests
│   ├── pdfGenerator.test.js           # PDF rendering & QR embedding tests
│   └── integration.test.js            # End-to-end batch, TC3 & KVKK privacy tests
└── examples/
    ├── demo.js                        # Demo execution script
    └── output/                        # Sample generated JSON-LD & PDF files
```

---

## 4. Quickstart

### Installation
```bash
npm install
```

### Run All 29 Tests
```bash
npm test
```
All **29 unit and integration tests** pass in ~1.4 seconds.

### Start the API Server
```bash
npm start
```
Starts the API service on `http://localhost:3001`.
