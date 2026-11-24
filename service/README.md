# CertiChain — Certificate Generator & Storage API Service

> **Developer:** Ammar Kaşlan (Student No: 2200002676)  
> **Role:** Backend Developer, Data Engineer, Work-Log Steward  
> **Module:** Certificate generator and storage service (Epic E2 Lead, E1/E4 Support)  
> **Course:** SEN0401 Special Topics: Blockchain · Istanbul Kültür University  
> **GitHub Repository:** [CertiChain on GitHub](https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code)

---

## 1. How to Run (Step-by-Step)

Follow these simple steps to run the certificate service locally and connect it with the frontend.

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: installed automatically with Node.js

---

### Step 1: Open Terminal & Navigate to `service/`
```bash
cd service
```

### Step 2: Install Dependencies
```bash
npm install
```
*(Installs `csv-parse`, `pdf-lib`, `qrcode`, `uuid`, `dejavu-fonts-ttf`, and `@pdf-lib/fontkit`)*

### Step 3: Start the API Server
```bash
npm start
```
You will see:
```text
CertiChain Certificate Service API listening on http://localhost:3001
```

### Step 4: Verify It Is Running
Open your browser or run:
```bash
curl http://localhost:3001/api/health
```
**Expected response:**
```json
{"status":"ok","service":"certichain-api"}
```

---

### Step 5: Connect with Frontend (`web/issue.html`)
1. Keep the API server running in your terminal (`npm start`).
2. Open `web/issue.html` in your browser (or serve it with Live Server).
3. Connect your **MetaMask** wallet (Sepolia testnet) — the issuer wallet address is detected automatically.
4. Fill in the event info (**Title**, **Date**, **Club Name**).
5. Upload an attendance CSV (for example: `tests/fixtures/sample-attendance-30.csv`).
6. Click **Issue certificates**.
   - The frontend automatically calls `http://localhost:3001/api/issue`.
   - The backend validates the CSV, generates W3C VC JSON-LD credentials, checks SHACL shapes, hashes canonical JSON with SHA-256, and builds PDFs with verification QR codes.
   - The frontend receives the `bytes32` hashes and prompts MetaMask to confirm the on-chain batch transaction.
   - Download the generated PDFs directly from the UI or via `http://localhost:3001/api/certificate/<hash>/pdf`.

---

### Step 6: (Optional) Run Tests
Run all automated tests:
```bash
npm test
```
Runs all unit and integration tests (CSV parsing, canonical RFC 8785 hashing, SHACL schema gate, PDF generator, and REST API endpoints).

---

## 2. API Endpoints Reference

The service includes a built-in HTTP server (`src/server.js`) with CORS enabled for direct connection with the frontend (`web/issue.html`):

### `POST /api/issue`
Uploads attendance CSV and event metadata, generates certificates, returns hashes for MetaMask and PDF download URLs.

**Request Body (JSON):**
```json
{
  "csv": "name,email\nAmmar Kaşlan,2200002676@stu.iku.edu.tr\nParticipant One,p1@stu.iku.edu.tr",
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
      "name": "Ammar Kaşlan",
      "email": "2200002676@stu.iku.edu.tr",
      "hash": "0x56f851...",
      "verificationUrl": "https://malak600.github.io/Certificate-verification-check-certificates-with-a-QR-code/web/verify.html?hash=0x56f851...",
      "pdfDownloadUrl": "/api/certificate/0x56f851.../pdf"
    }
  ]
}
```

### `GET /api/certificate/:hash`
Returns the stored W3C VC v2.0 JSON-LD document for the given certificate hash.

### `GET /api/certificate/:hash/pdf`
Downloads the rendered certificate PDF with embedded QR code.

### `GET /api/health`
Health check endpoint: `{ "status": "ok", "service": "certichain-api" }`.

---

## 3. Directory Structure

```
service/
├── package.json                       # ESM project configuration, scripts & deps
├── README.md                          # Comprehensive documentation (this file)
├── src/
│   ├── server.js                      # REST API server (POST /api/issue, GET /api/certificate/:hash)
│   ├── index.js                       # Main orchestrator & public API (processBatch)
│   ├── utils.js                       # Crypto, salts, IDs, and URL helpers
│   ├── csvParser.js                   # Attendance CSV ingestion & validation
│   ├── certificateBuilder.js          # W3C VC JSON-LD credential builder
│   ├── certificateHasher.js           # Deterministic canonical JSON & SHA-256 hasher (RFC 8785)
│   ├── shaclValidator.js              # SHACL validation gate (enforces schema/)
│   ├── qrGenerator.js                 # QR code generator (PNG Buffer / Data URL)
│   └── pdfGenerator.js                # PDF certificate renderer (pdf-lib + Unicode font)
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

## 4. Compliance & Privacy (KVKK)
- **Zero Student PII on-chain**: Names, emails, and student numbers stay off-chain in private W3C VC JSON-LD documents.
- **Cryptographic Hashes**: Only salted SHA-256 digests (`bytes32`) are committed to the Sepolia smart contract.
- **Verifiable**: Any certificate can be independently verified on-chain via its embedded QR code linking to `web/verify.html?hash=0x...`.
