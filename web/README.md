# CertiChain — Web pages

Owner: **Raghd Alfakavi** (issuer dashboard and verification page)

Plain HTML and JavaScript pages, using [ethers.js v6](https://docs.ethers.org/v6/) from a CDN. There is no build step: each page is a single file.

| Page | Who uses it | What it does |
|---|---|---|
| [`verify.html`](verify.html) | Anyone (employer, university, club) | Checks a certificate on Sepolia and shows ✅ Valid, ⚠️ Revoked or ❌ Not found. No wallet needed. |
| [`issue.html`](issue.html) | The club's event organiser | Issues a whole event's certificates in one batch, and revokes a certificate issued by mistake. Needs MetaMask and the local certificate service. |
| [`index.html`](index.html) | Team (setup check) | First page of the project: connects MetaMask, checks that it is on Sepolia and shows the balance. Not used by the app. |

## Verify a certificate (`verify.html`)

**Live page:** https://malak600.github.io/Certificate-verification-check-certificates-with-a-QR-code/web/verify.html

There are three ways to check a certificate:

1. **Scan the QR code** on the PDF. It opens `verify.html?hash=0x…` and the page checks it automatically.
2. **Paste the certificate hash.** It is printed at the bottom of the PDF.
3. **Upload the certificate PDF** (or its `.json`). Every PDF carries the certificate data as an embedded file (`certichain-certificate.json`). The page reads it, computes its SHA-256 hash in the browser (see [`HASHING.md`](../HASHING.md)) and checks that hash. An edited file gives a different hash, so it shows ❌ Not found. The file is not uploaded anywhere.

On ✅ Valid or ⚠️ Revoked, the page also shows the name, event and date from the verified data, so the verifier can compare them with what is printed on the PDF.

The page reads the contract through a free public RPC (`RPC_URL`), so it needs no wallet and costs nothing.

## Issue and revoke certificates (`issue.html`)

1. Start the certificate service (see [`service/README.md`](../service/README.md)): `cd service`, `npm install`, `npm start`. It must show `listening on http://localhost:3001`.
2. Open `web/issue.html` with VS Code **Live Server**.
3. **Connect MetaMask** on **Sepolia**, with a wallet that has the issuer role (`ISSUER_ROLE`).
4. **1. Event details:** title, date and club name.
5. **2. Attendance list:** upload a CSV with the columns `name,email`. Rows with a problem (missing name, invalid e-mail) are marked and are not issued; fix them in the file and upload again. An empty file is rejected.
6. **3. Issue:** press **Issue certificates** and confirm in MetaMask. The page sends the list to the service (certificates, hashes and PDFs), records all hashes with one `issueBatch` transaction, shows the Etherscan link, and lets you download every PDF as a ZIP.
7. **4. Revoke a certificate:** paste the hash of a certificate issued by mistake and press **Revoke certificate**. The page first checks the certificate's status on Sepolia, asks for confirmation, then calls `revoke`. This cannot be undone.

Clear messages are shown for the usual problems: wrong network, wallet without the issuer role, certificate already issued or already revoked, cancelled in MetaMask, service not running.

## Settings in the pages

| Constant | Page | Value |
|---|---|---|
| `CONTRACT_ADDRESS` | `issue.html`, `verify.html` | `0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860` (CertificateRegistry on Sepolia) |
| `SERVICE_URL` | `issue.html` | `http://localhost:3001` |
| `RPC_URL` | `verify.html` | `https://ethereum-sepolia-rpc.publicnode.com` |
| `ISSUER_NAMES` | `verify.html` | Wallet address → club name shown as "Issued by" |

## Tested

- Live end-to-end test on Sepolia on 20 Nov 2026: a 5-person batch was issued, then verified by QR scan and by PDF upload (✅ Valid), and one certificate was revoked (⚠️ Revoked). Transactions: [issue](https://sepolia.etherscan.io/tx/0xa9eaf81cdb29cb161c4cab6c60622740bc391e8432abf389cdad6a1158f1f9a4), [revoke](https://sepolia.etherscan.io/tx/0x73cd25d01cc15d01292e4002eac1f5dc0a37090266486ad08a1d571d239f9034).
- Phone timing test (objective O1) on 23 Nov 2026: median 0.61 s in Chrome; target under 10 s.
