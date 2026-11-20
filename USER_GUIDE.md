# CertiChain User Guide & December Trial Plan

**For:** IKU Computer Club Organisers & Certificate Verifiers  
**Course:** SEN0401 Special Topics: Blockchain · Istanbul Kültür University  
**Public Verification Page:** https://malak600.github.io/Certificate-verification-check-certificates-with-a-QR-code/web/verify.html  
**Sepolia Smart Contract (`CertificateRegistry`):** `0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860`

---

## Part 1: Guide for Event Organisers (Issuing Certificates)

CertiChain lets the IKU Computer Club issue an entire workshop's certificates (up to **200 attendees per batch**) in one transaction while storing only cryptographic SHA-256 hashes on Ethereum Sepolia—no personal data is ever placed on the blockchain (KVKK compliant).

### What You Need Before Starting
1. **Node.js** installed on the laptop running the certificate service.
2. **Google Chrome** (or another Chromium browser) with the **MetaMask** extension installed.
3. A MetaMask wallet switched to the **Ethereum Sepolia** testnet with a small amount of free Sepolia test ETH.
4. **Issuer permission (`ISSUER_ROLE`)** granted to your wallet address on the `CertificateRegistry` contract (ask the team lead if your wallet has not been authorised yet).
5. An attendance **CSV file** with two columns: `name,email` (one attendee per line).

**Example `attendance.csv`:**

    name,email
    Ayşe Yılmaz,ayse.yilmaz@stu.iku.edu.tr
    Mehmet Demir,mehmet.demir@stu.iku.edu.tr

### Step-by-Step: How to Issue a Batch of Certificates

1. **Start the local Certificate Service**
   Open a terminal in the project folder and run:

       cd service
       npm install
       npm start

   Confirm you see: `CertiChain Certificate Service API listening on http://localhost:3001`. Keep this terminal window open while issuing.

2. **Open the Issuer Dashboard (`web/issue.html`)**
   Open `web/issue.html` using a local web server (for example, right-click `web/issue.html` in VS Code and select **Open with Live Server**). *(Opening via a local server is required so MetaMask can connect to the page.)*

3. **Connect Your Authorised MetaMask Wallet**
   - Click **Connect MetaMask** in the top-right corner.
   - Approve the connection in MetaMask and verify the status next to the button shows **`Sepolia ✅`**.

4. **Fill In Section 1 — Event Details**
   - **Event title:** Enter the workshop name (e.g., `Git & GitHub Workshop`).
   - **Event date:** Select the workshop date.
   - **Club name:** Keep `IKU Computer Club` (pre-filled by default).

5. **Upload Section 2 — Attendance List**
   - Click the file picker and select your `name,email` CSV file.
   - Check the preview table:
     - Green **`✔`** means the row is valid.
     - Red rows indicate `Missing name` or `Invalid e-mail`—fix them in your CSV and upload again before issuing.
   - Confirm the status says **`X attendees ready.`**

6. **Issue Certificates (Section 3 — Issue)**
   - Click **Issue certificates**.
   - The dashboard sends the CSV to the local service (`http://localhost:3001/api/issue`), generates the W3C JSON-LD credentials, runs SHACL validation, and builds each QR-stamped PDF.
   - When MetaMask pops up asking to confirm the `issueBatch` transaction on Sepolia, click **Confirm**.
   - Wait a few seconds for blockchain confirmation. You will see **`✅ X certificates issued`** along with a **View on Etherscan** link.

7. **Download and Distribute the PDFs**
   - Click **Download all PDFs (ZIP)** to save `CertiChain_Certificates.zip`, or click **Download PDF** next to any individual attendee.
   - Send each attendee their PDF certificate via email or your usual club channel.

### Common Organiser Troubleshooting

| Message Shown | Cause & Fix |
|---|---|
| `Cannot connect to Certificate Service (is port 3001 running?)` | Start the backend first with `cd service && npm start`. |
| `This wallet is not an authorised club issuer` | Switch to an authorised club MetaMask account or ask the contract admin to grant `ISSUER_ROLE`. |
| `Wrong network – switch to Sepolia` | Switch MetaMask to the **Sepolia** test network. |
| `Already issued` | One or more hashes in the batch were already recorded on-chain. |
| `The file is empty. Nothing to issue.` | Ensure your CSV is saved as UTF-8 with a `name,email` header and at least one attendee row. |

### Revoking a Certificate (If Issued in Error)
If a certificate must be invalidated (for example, due to a typo or wrong attendee), an authorised `ISSUER_ROLE` wallet calls `revoke(bytes32 certHash)` on the `CertificateRegistry` contract. The record remains publicly visible on-chain with status **⚠️ Revoked** and a revocation timestamp.

---

## Part 2: Guide for Verifiers (Checking a Certificate)

Anyone—employers, internship coordinators, university staff, or students—can verify an IKU Computer Club certificate in **under 10 seconds**. **No MetaMask wallet, account, or fee is needed.**

### Three Ways to Verify

1. **Option A — Scan the QR Code (Fastest)**
   - Point any smartphone camera at the QR code printed on the certificate PDF and tap the link.
   - The public verification page (`web/verify.html?hash=0x...`) opens, fills in the hash automatically, and checks the Ethereum Sepolia contract immediately.

2. **Option B — Upload the Certificate File (PDF or `.json`)**
   - Open the [Public Verification Page](https://malak600.github.io/Certificate-verification-check-certificates-with-a-QR-code/web/verify.html).
   - Under **Upload the certificate (PDF or .json)**, select the certificate file.
   - Your browser reads the embedded `certichain-certificate.json` data locally (the file is never uploaded to any server), computes its canonical SHA-256 hash, and checks the Sepolia blockchain.
   - When verified, the page also displays **Name on certificate**, **Event**, and **Event date** from the embedded data so you can visually compare them with what is printed on the PDF.

3. **Option C — Paste the Certificate Hash Manually**
   - Paste the 64-character `0x...` hash into the **Certificate hash** field and click **Verify**.

### Understanding the Three Verification Results

| Result | What It Means | What to Check |
|---|---|---|
| **✅ Valid** | The certificate hash is anchored on Ethereum Sepolia and has not been revoked. | Check **Issued by** (`IKU Computer Club`), **Issued on**, and (when uploading a PDF) confirm that the **Name on certificate**, **Event**, and **Event date** shown on screen match the printed PDF. |
| **⚠️ Revoked** | The certificate was legitimately issued earlier, but was later revoked by the club. | Do not accept it as active. Review the **Issued on** and **Revoked on** timestamps shown. |
| **❌ Not found** | No certificate with this hash exists on the blockchain. | Double-check the hash or QR link. Note: **Changing the embedded certificate data changes the hash, so the page shows Not found. The page also shows the name, event and date so the verifier can compare them with the printed PDF.** |

---

## Part 3: December Workshop Trial Plan (IKU Computer Club)

In our customer interview, **Asmaa (Events Organization Coordinator, IKU Computer Club)** confirmed that the club hosts workshops in December before final exams (~50–70 attendees per event, 150–200 certificates per semester) and currently spends **1–2 days** checking certificates manually through Excel and Google Drive.

### Trial Objectives & Success Metrics
- **Target Date:** December 2026 workshop (Milestone target: **7 December 2026**).
- **Issuance Speed (Objective O3):** Issue the full workshop roster (~50–70 attendees) in a single batch in **under 5 minutes**.
- **Verification Speed (Objective O1):** Verify a certificate via QR scan or PDF upload in **under 10 seconds** (down from 1–2 days).
- **Reliability & Character Support:** 100% of attendees—including Turkish characters (`ç, ğ, ı, İ, ö, ş, ü`)—render cleanly on PDFs and pass verification on mobile phones.

### Trial Schedule

| Phase | Timing | Activities | Owner |
|---|---|---|---|
| **1. Preparation** | 2–3 days before workshop | Confirm which laptop runs `service` (`localhost:3001`), verify the club organiser's MetaMask wallet has `ISSUER_ROLE` + Sepolia ETH, and run a 5-person dry run. | CertiChain Team + Asmaa |
| **2. Live Issuance** | End of workshop (same day) | Export attendance sheet as `name,email` CSV, upload to `web/issue.html`, record batch on Sepolia via MetaMask, time the full process, and download the ZIP of PDFs. | IKU Computer Club Organiser (supported by Team) |
| **3. Distribution & Spot Check** | Within 24 hours of workshop | Send PDF certificates to attendees. Ask 5–10 attendees and 1 club board member to scan their QR code on their phone and upload their PDF on `verify.html`. | Club Organiser + Attendees |
| **4. Feedback & Evaluation** | Within 48 hours of workshop | Collect responses using the feedback form below, record actual timing metrics, and summarize results for the v1.0 release report (16 Dec 2026). | Ujala + CertiChain Team |

---

## Part 4: Workshop Trial Feedback Form

*(Can be shared as a short Google Form or printed sheet right after the December workshop.)*

### Section A — For the Club Organiser (Issuer)
1. **Your role in the club:** `________________________`
2. **Number of certificates issued in this batch:** `______`
3. **Total time taken from CSV upload to ZIP download:** `______ minutes`
4. **How easy was it to issue certificates using CertiChain?**  
   - [ ] 1 (Very difficult) · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 (Very easy)
5. **Did you encounter any errors or confusing steps (MetaMask, CSV format, downloading ZIP)?**  
   `__________________________________________________________________`
6. **Would you use CertiChain for future IKU Computer Club workshops?**  
   - [ ] Yes · [ ] Maybe · [ ] No — Why? `_______________________________`

### Section B — For Attendees & Verifiers
1. **How did you verify the certificate?**  
   - [ ] Scanned QR code on phone · [ ] Uploaded PDF file · [ ] Pasted hash manually
2. **Did the page clearly show `✅ Valid` and match your name, event, and date?**  
   - [ ] Yes · [ ] No (please explain): `__________________________________`
3. **Roughly how many seconds did verification take?**  
   - [ ] Under 5 seconds · [ ] 5–10 seconds · [ ] Over 10 seconds
4. **How clear and trustworthy did the verification page feel?**  
   - [ ] 1 (Not clear) · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 (Very clear)
5. **Any suggestions to improve the certificate PDF or verification page?**  
   `__________________________________________________________________`
