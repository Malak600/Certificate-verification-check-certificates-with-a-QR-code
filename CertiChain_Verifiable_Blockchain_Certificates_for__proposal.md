# CertiChain: Verifiable Blockchain Certificates for University Club Events

SEN0401 Special Topics: Blockchain · 2026-2027 Fall · Proposal · Method: BRSF software-development profile · Self-assessed grade 100/100

## Team, roles and work distribution

| Member | Student number | E-mail | Administrative roles | Development roles | Planned share |
| --- | --- | --- | --- | --- | --- |
| Malak Alfakavi | 2200002701 | 2200002701@stu.iku.edu.tr | Team lead, Repository and release manager | Smart-contract developer, Architect | 25% |
| Raghd Alfakavi | 2200002698 | 2200002698@stu.iku.edu.tr | Customer liaison | Front-end developer, Interaction and game designer | 20% |
| Mohammed Ammar | 2200002676 | 2200002676@stu.iku.edu.tr | Work-log steward | Back-end developer, Data engineer | 20% |
| Mohamad Mahfouz Khalil | 2200009092 | 2200009092@stu.iku.edu.tr | Quality lead | Test engineer, Requirements analyst | 20% |
| Ujala Ali Qureshi | 2400003598 | 2400003598@stu.iku.edu.tr | Documentation lead | Test engineer, Interaction and game designer | 15% |

### Modules and features

| Module or feature | Kind | What it does | Delivers epic | Responsible member | Second member |
| --- | --- | --- | --- | --- | --- |
| Certificate registry smart contract | Module | Solidity contract that stores certificate hashes, issuer roles and revocations on the Sepolia testnet. | E1 On-chain certificate registry | Malak Alfakavi · 2200002701 | Mohammed Ammar · 2200002676 |
| Issuer dashboard | Module | Web page where the club's event organiser uploads the participant list and issues or revokes certificates with MetaMask. | E2 Certificate issuing for organisers | Raghd Alfakavi · 2200002698 | Malak Alfakavi · 2200002701 |
| Certificate generator and storage service | Module | Node.js service that builds each certificate as a JSON-LD document, computes its SHA-256 hash and renders the PDF with a QR code. | E2 Certificate issuing for organisers | Mohammed Ammar · 2200002676 | Malak Alfakavi · 2200002701 |
| Public verification page | Feature | Page opened from the QR code or by uploading the PDF; it recomputes the hash and checks it against the contract. | E3 Public verification | Raghd Alfakavi · 2200002698 | Mohamad Mahfouz Khalil · 2200009092 |
| Credential schema, tests and CI | Feature | SHACL shape for the certificate, contract and end-to-end tests, and the GitHub Actions pipeline. | E4 Certificate format, privacy and quality | Mohamad Mahfouz Khalil · 2200009092 | Mohammed Ammar · 2200002676 |
| End-to-end tests and user guide | Feature | Full-flow tests (CSV to service to contract to QR verification) with screenshots, failure cases (edited PDF, revoked certificate, empty CSV, Turkish characters), a phone timing test, and a short guide for the club organiser and verifiers. | E4 Certificate format, privacy and quality | Ujala Ali Qureshi · 2400003598 | Mohamad Mahfouz Khalil · 2200009092 |

### Process leads

- Stakeholder needs and requirements: Raghd Alfakavi
- System/software requirements definition: Mohamad Mahfouz Khalil
- Architecture definition: Malak Alfakavi
- Implementation: Mohammed Ammar
- Verification: Mohamad Mahfouz Khalil
- Design definition: Raghd Alfakavi
- Validation: Raghd Alfakavi

### Work log

28 entries; chain intact; head fingerprint 29a1312fc9b09b9e1c4798ddd80a097c025b61b98c222888c7ff2f52ac55509a.

| No. | Time (UTC) | Member | Process | Hours | What | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-17 12:29 | Malak Alfakavi | Implementation | 2 | Created the GitHub repository, invited the team and the instructor, and wrote the README | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code |
| 2 | 2026-10-17 12:31 | Raghd Alfakavi | Stakeholder needs and requirements | 1 | Contacted the club president on WhatsApp to agree on being our customer and asked about their certificates | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code |
| 3 | 2026-10-17 12:32 | Mohammed Ammar | Architecture definition | 1.5 | Researched Node.js libraries for PDF and QR generation and planned the certificate service structure | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code |
| 4 | 2026-10-17 12:35 | Mohamad Mahfouz Khalil | System/software requirements definition | 1.5 | Reviewed all user stories and acceptance criteria and checked each one has a matching test case | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code |
| 5 | 2026-11-15 22:33 | Malak Alfakavi | System analysis | 2 | On 13 Nov wrote HASHING.md with canonical JSON rules, salt handling and a worked example hash | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/pull/3 |
| 6 | 2026-11-15 22:33 | Malak Alfakavi | Architecture definition | 3 | On 15 Nov verified the CertificateRegistry source on Sepolia Etherscan and reached 100 percent line coverage in Hardhat | https://sepolia.etherscan.io/address/0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860#code |
| 7 | 2026-11-15 22:34 | Malak Alfakavi | Implementation | 2 | On 15 Nov updated the README and HASHING.md to match the real W3C VC schema and API endpoint | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/pull/6 |
| 8 | 2026-11-15 22:34 | Mohammed Ammar | Architecture definition | 2 | On 13 Nov implemented the HTTP server and API tests for POST /api/issue and certificate download | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/pull/4 |
| 9 | 2026-11-15 22:35 | Mohamad Mahfouz Khalil | System/software requirements definition | 1 | On 13 and 15 Nov added week 2 tests, the verification test report and the CI pipeline | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/pull/5 |
| 10 | 2026-11-15 22:35 | Raghd Alfakavi | Architecture definition | 2 | On 15 Nov connected issue.html to the certificate service API and added ZIP download of the certificates | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/tree/main/web |
| 11 | 2026-11-15 22:37 | Mohammed Ammar | Implementation | 2 | Correction to entry 8: this work was implementation of the HTTP server and API tests, not architecture definition | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/pull/4 |
| 12 | 2026-11-15 22:38 | Mohamad Mahfouz Khalil | Implementation | 1 | On 13 and 15 Nov added week 2 tests, the verification test report and the CI pipeline | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/pull/5 |
| 13 | 2026-11-15 22:38 | Raghd Alfakavi | Implementation | 2 | On 15 Nov connected issue.html to the certificate service API and added ZIP download of the certificates | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/tree/main/web |
| 14 | 2026-11-17 17:43 | Malak Alfakavi | Verification | 2 | On 17 Nov reviewed the team’s 13–16 Nov work (with AI assistance) and opened PR #9: SHACL shape now validates real certificates in CI (30/30), Arabic names no longer crash the PDF batch, QR codes point to the real verify page, test report corrected. CI 3/3 green, merged after Ammar’s approval. | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/pull/9 |
| 15 | 2026-11-17 17:44 | Malak Alfakavi | Transition | 0.5 | On 17 Nov enabled GitHub Pages so the public verify page is online and every certificate QR code opens it. | https://malak600.github.io/Certificate-verification-check-certificates-with-a-QR-code/web/verify.html |
| 16 | 2026-11-17 17:45 | Malak Alfakavi | Implementation | 0.5 | On 17 Nov fixed the README (PR #10): the architecture diagram did not render and several sections were lost on 16 Nov; restored them, updated the team and roadmap, added a Quick Start. | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/pull/10 |
| 17 | 2026-11-20 08:27 | Mohamad Mahfouz Khalil | Implementation | 1 | Correction to entry 12: duplicate of entry 9, the same work should be counted only once |  |
| 18 | 2026-11-20 08:32 | Raghd Alfakavi | Implementation | 0.25 | Correction to entry 13: duplicate of entry 10, the same work should be counted only once | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/tree/main/web |
| 19 | 2026-11-20 08:42 | Ujala Ali Qureshi | Transition | 2 | On 20 Nov wrote USER_GUIDE.md with an organiser guide and a verifier guide for the club trial | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/commit/d11a671 |
| 20 | 2026-11-20 08:44 | Ujala Ali Qureshi | Transition | 0.5 | On 20 Nov ran the contract and service tests, local end-to-end checks and drafted the test report with screenshots | https://sepolia.etherscan.io/tx/0xa9eaf81cdb29cb161c4cab6c60622740bc391e8432abf389cdad6a1158f1f9a4 |
| 21 | 2026-11-20 08:45 | Raghd Alfakavi | Verification | 1.5 | On 20 Nov I ran the first live end-to-end test on Sepolia. I issued a 5-person batch from issue.html with MetaMask, downloaded the PDFs, and verified a certificate by scanning the QR code and by uploading the PDF. Both showed Valid. My first try used an old copy of the repo, so I downloaded the latest version and issued again. | https://sepolia.etherscan.io/tx/0xa9eaf81cdb29cb161c4cab6c60622740bc391e8432abf389cdad6a1158f1f9a4 |
| 22 | 2026-11-20 09:01 | Raghd Alfakavi | Verification | 0.5 | On 20 Nov I ran the live revoke test on Sepolia. I revoked one test certificate from the same batch through Etherscan, then checked it on the verify page, which showed Revoked with the revoke time. | https://sepolia.etherscan.io/tx/0x73cd25d01cc15d01292e4002eac1f5dc0a37090266486ad08a1d571d239f9034 |
| 23 | 2026-11-20 09:15 | Raghd Alfakavi | Stakeholder needs and requirements | 0.25 | Correction to entry 2: the customer contact was Asmaa, the events organization coordinator of the IKU Computer Club, not the club president. |  |
| 24 | 2026-11-20 12:01 | Raghd Alfakavi | Implementation | 1 | On 20 Nov added section 4 “Revoke a certificate” to issue.html (with AI assistance): the organiser pastes the certificate hash, the page checks its status on Sepolia first, asks for confirmation, then calls revoke through MetaMask and shows the Etherscan link. | https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code/commit/94e8ea3 |
| 25 | 2026-11-20 12:02 | Raghd Alfakavi | Implementation | 0.25 | Entry 23 is the correction of entry 2; it was saved with the wrong kind. |  |
| 26 | 2026-11-20 12:03 | Mohammed Ammar | Implementation | 0.25 | Entry 11 is a correction of entry 8, not new work; its hours should not be counted. |  |
| 27 | 2026-11-20 12:03 | Mohamad Mahfouz Khalil | Implementation | 0.25 | Entry 17 is a correction of entry 12, not new work; its hours should not be counted. |  |
| 28 | 2026-11-23 14:01 | Malak Alfakavi | Implementation | 0.5 | On 23 Nov updated the proposal to match the implementation: plain HTML pages instead of React, the real contract data model (Record with revokedAt), the ZIP download and the real issue sequence. |  |

## 1. Mission

### Customer

| Customer (organisation or role) | Contact person or role | How and when you reached them | Relation | What they get from it |
| --- | --- | --- | --- | --- |
| IKU Computer Club (Istanbul Kültür University student club) | Asmaa, events organization coordinator of the IKU Computer Club | WhatsApp: we sent our questions on 17 October 2026 at about 17:00; she answered all of them on 22 October 2026 and agreed to a trial at the club's December workshops | Owner of the system | A free, tamper-proof way to issue participation certificates for its workshops and events that anyone can check in seconds, without the club searching Excel and Google Drive files to answer verification requests. |

### End users

| User group (short name) | Who exactly | What they do with the system | How often | Device or channel |
| --- | --- | --- | --- | --- |
| Event organiser | Club board member who runs a workshop or event | Uploads the attendance list after an event, issues the certificates and revokes one issued by mistake | Monthly | Laptop browser with the MetaMask wallet |
| Certificate holder | IKU student who attended a club event | Downloads the PDF certificate, adds it to a CV or LinkedIn profile and shares the verification link | Occasionally | Phone or laptop browser |
| Verifier | Employer, internship coordinator or another university's staff member | Scans the QR code or uploads the PDF to check that the certificate is genuine and not revoked | Occasionally | Phone camera or laptop browser, no wallet needed |

### Problem

The IKU Computer Club hands out participation certificates for its workshops and events as plain PDF or printed files. According to the club's events organization coordinator, the club issues about 150 to 200 certificates per semester, and a single workshop or large event gives out 50 to 70 certificates to attendees. These files are made from a shared template, so anyone with a PDF editor can change a name, a date or an event title in a few minutes, and the result looks identical to a genuine certificate. When a company asks whether a certificate is real, the club has to search by hand through the Excel files and Google Drive folders linked to that event to find the person's name; the club reports that this takes about 1 to 2 days before they can reply. Once a board graduates, these files are easily lost. As a result, certificate holders cannot prove that their certificate is real, verifiers either trust the file blindly or ignore it, and the club cannot withdraw a certificate that was issued by mistake. The club has no budget for a paid certificate platform, so the solution must run at zero cost. The problem is not storing the file, which the club already does, but giving third parties an independent proof that the club issued it and has not revoked it.

### Mission statement

CertiChain lets an IKU student club issue event certificates whose authenticity anyone can check in seconds. The event organiser issues certificates from a simple dashboard; each certificate's fingerprint is recorded on a public blockchain. Every certificate holder gets a PDF with a QR code, and any verifier can confirm it is genuine and not revoked without contacting the club or trusting a central server.

Origin: Session drafted

### Outcome

Once CertiChain exists, a certificate holder can send a single link that proves their certificate is genuine, a verifier can check it in under ten seconds without e-mailing anyone, and the club can revoke a wrong certificate publicly, even after the board that issued it has graduated.

## 2. Scope

### Areas

| Area | Where it lives | How big it is today |
| --- | --- | --- |
| On-chain certificate registry | Solidity smart contract on the Ethereum Sepolia testnet | Does not exist today; 0 certificates on chain |
| Issuer application | Issuer dashboard (HTML and ethers.js) and Node.js certificate service | Today certificates are made by hand from a Word/Canva template |
| Public verification | Public web page opened from the QR code | Today verification is done by e-mail to the club |
| Credential data model | JSON-LD context and SHACL shape in the repository | No agreed certificate format today |

### Deliverables

| Deliverable | Area | Layer | Kind |
| --- | --- | --- | --- |
| CertificateRegistry contract with issue, revoke and verify functions and issuer roles | On-chain certificate registry | Product layer | Functional |
| Contract deployed and verified on Sepolia with a public address | On-chain certificate registry | Work layer | Functional |
| Only authorised issuer wallets can write to the registry | On-chain certificate registry | Product layer | Non-functional |
| Dashboard to upload a CSV attendance list and issue certificates in one batch | Issuer application | Product layer | Functional |
| PDF certificate generation with an embedded QR verification link | Issuer application | Product layer | Functional |
| Verification page that checks a certificate by QR link or PDF upload and shows valid, revoked or unknown | Public verification | Product layer | Functional |
| Verification answers in under 10 seconds on a phone without a wallet | Public verification | Product layer | Non-functional |
| JSON-LD certificate context and SHACL shape that every issued certificate passes | Credential data model | Product layer | Non-functional |

### Exclusions

| Left out | Why |
| --- | --- |
| Deployment to Ethereum mainnet or any network that costs real money | The club has no budget; the Sepolia testnet shows the same mechanism at zero cost. |
| Storing personal data (names, student numbers) on the blockchain | On-chain data cannot be deleted, which conflicts with KVKK; only a salted hash goes on chain. |
| Certificates for official university diplomas or transcripts | Those belong to the Registrar's Office and need legal approval far outside a one-term project. |
| Native mobile apps | A responsive web page with a QR code covers phone users without app-store work. |

### Domain entities

| Entity | What it is | Created? | Used? | Retired? |
| --- | --- | --- | --- | --- |
| Certificate | A record that a named participant attended a specific club event, issued as a JSON-LD document and PDF whose SHA-256 hash is stored on chain. | Created — yes | Used — yes | Retired — yes |
| Issuer | A club wallet address authorised by the contract owner to issue and revoke certificates. | Created — yes | Used — yes | Retired — yes |
| Event | A workshop, bootcamp or competition run by the club, with a title, date and organiser. | Created — yes | Used — yes | Retired — no |
| Participant | The certificate holder: an attendee identified off chain by name and e-mail; on chain only through a salted hash. | Created — yes | Used — yes | Retired — no |
| Revocation | An on-chain record that a certificate is no longer valid, with the time and the issuer who revoked it. | Created — yes | Used — yes | Retired — no |

### Project kinds

Provenance and trust › Blockchain-anchored provenance. Stack layers they need: Identifiers and publishing, Provenance and metadata.

### Semantic technologies, by stack layer

- Data model: RDFLib
- Identifiers and publishing: Stable IRI and negotiation practice
- Provenance and metadata: PROV-O provenance ontology
- Serialisation: JSON-LD 1.1 contexts, RDFLib
- Validation: SHACL shapes

JSON-LD 1.1 contexts give each certificate a machine-readable format that follows the W3C Verifiable Credentials data model, so other systems can read it, and its canonical form is what we hash. PROV-O describes who issued the certificate, for which event and when, so the provenance chain is explicit. SHACL shapes check every certificate before it is issued, so a malformed certificate never reaches the chain; RDFLib with pySHACL-style validation runs those checks in our test suite. Stable IRI practice gives every certificate a permanent verification URL that the QR code points to. Outside the semantic stack we use Solidity with OpenZeppelin AccessControl, Hardhat for testing and deployment, ethers.js in the browser, plain HTML and JavaScript for the pages (hosted on GitHub Pages) and Node.js for the PDF and QR service.

## 3. Goals

| Goal | Facing | Covers area | Why this goal |
| --- | --- | --- | --- |
| Any verifier can confirm that a certificate is genuine and not revoked without contacting the club | Mission-facing | Public verification | This is the mission itself: if it holds, the problem of unverifiable certificates is solved. |
| The registry contract issues, revokes and verifies certificates and is deployed on Sepolia | Scope-facing | On-chain certificate registry | Without the contract there is no tamper-proof record to check against. |
| The organiser can issue a whole event's certificates from the dashboard in one batch | Scope-facing | Issuer application | If issuing is harder than the current template, the club will not use the system. |
| Every certificate follows one JSON-LD format and passes the SHACL shape before issue | Scope-facing | Credential data model | A single checked format keeps hashes reproducible and certificates readable by others. |
| No work goes into features outside the four areas, and no personal data is written on chain | Containment-facing | On-chain certificate registry | Keeps a one-term team effort focused and keeps the project KVKK-safe. |

### Specification

The system has three parts. A CertificateRegistry smart contract on Sepolia keeps a mapping from a certificate hash to its issuer, issue time and revocation status; only wallets holding the ISSUER role may call issue or revoke, and anyone may call verify for free. The issuer dashboard lets an event organiser connect MetaMask, enter event details and upload a CSV of participants; the certificate service builds one JSON-LD certificate per participant, validates it against the SHACL shape, salts and hashes it with SHA-256, and the dashboard submits all hashes in one batch transaction. The service then produces a PDF per participant with a QR code linking to the verification page. The verification page, needing no wallet, reads the certificate ID from the link or recomputes the hash from an uploaded file, queries the contract through a public RPC endpoint and shows Valid, Revoked or Not found, with the issuing club and date. Names and student numbers stay off chain.

### Test scenarios

| Kind | Scenario (Given / When / Then) |
| --- | --- |
| Nominal | Given a certificate issued by the club for the Git workshop, when a verifier scans its QR code, then the page shows Valid with the club name and issue date. |
| Rejection | Given a certificate PDF whose participant name was edited after issue, when a verifier uploads it, then the recomputed hash is not found and the page shows Not found. |
| Rejection | Given a wallet without the ISSUER role, when it calls issue on the contract, then the transaction reverts and no certificate is recorded. |
| Boundary | Given a certificate that the organiser has revoked, when a verifier checks it, then the page shows Revoked with the revocation date instead of Valid. |
| Absent | Given an empty CSV attendance file, when the organiser starts issuing, then the dashboard stops with an error and sends no transaction. |

### Use cases

Actors: Event organiser (issue batch, revoke certificate, add issuer), Certificate holder (download certificate, share link), Verifier (verify by QR, verify by upload), Contract owner (grant or remove issuer role).

## 4. Objectives

| Objective | Goal | Measured by | How exactly it is measured | Now | Target | Direction |
| --- | --- | --- | --- | --- | --- | --- |
| Time for a verifier to check one certificate | Any verifier can confirm that a certificate is genuine and not revoked without contacting the club | Counted | Stopwatch from opening the QR link to the result, median of 10 checks on a phone over mobile data | 1-2 days of manual search in Excel and Google Drive (club's answer, 22 Oct 2026) | Under 10 seconds | Decrease |
| Share of contract functions covered by passing Hardhat tests | The registry contract issues, revokes and verifies certificates and is deployed on Sepolia | Derived | solidity-coverage report on the CertificateRegistry contract in CI | 0% | At least 90% line coverage, all tests passing | Increase |
| Time for the organiser to issue certificates for a 30-person event | The organiser can issue a whole event's certificates from the dashboard in one batch | Counted | Stopwatch during a trial with the club's organiser, from CSV upload to all PDFs ready | Made by hand from a template; time to be measured at the club's first December workshop | Under 5 minutes | Decrease |
| Share of issued certificates that pass the SHACL shape | Every certificate follows one JSON-LD format and passes the SHACL shape before issue | Derived | Validation run over all issued JSON-LD files in CI, conforming / total | No format exists (0%) | 100% | Hold |
| Personal data fields written on chain | No work goes into features outside the four areas, and no personal data is written on chain | Counted | Review of contract storage and event logs for names, e-mails or student numbers | 0 | 0 | Hold |

### Activity model

1. The organiser runs the event and exports the attendance list as CSV. 2. The organiser connects MetaMask to the dashboard; if the wallet has no ISSUER role, the flow stops with an error. 3. The organiser enters event details and uploads the CSV; if the file is empty or malformed, the dashboard rejects it. 4. The service builds and SHACL-validates one certificate per row; invalid rows are listed for correction. 5. The dashboard sends one batch transaction; on failure nothing is recorded and the organiser may retry. 6. The organiser downloads the PDFs with QR codes as one ZIP file and shares them with the attendees . 7. A verifier opens the QR link; the page queries the contract and branches to Valid, Revoked or Not found.

### Sequence model

Organiser → Dashboard: upload CSV and event details. Dashboard → Certificate service: POST /api/issue. Certificate service: builds one certificate per row, validates it, hashes it and renders its PDF with a QR code. Service → Dashboard: hashes and PDFs. Dashboard → MetaMask: request signature for issueBatch(hashes). MetaMask → Registry contract: transaction. Contract → Dashboard: CertificateIssued events; dashboard shows the Etherscan link and the ZIP download. Verifier → Verification page: open QR link with the hash, or upload the PDF. Page → Public RPC → Registry contract: verify(hash). Contract → Page: status, issuer, issue and revoke time. Page → Verifier: Valid, Revoked or Not found.

## 5. Backlog

Kind of development: Initial development

### Epics

| Epic | Pursues objective |
| --- | --- |
| E1 On-chain certificate registry | Share of contract functions covered by passing Hardhat tests |
| E2 Certificate issuing for organisers | Time for the organiser to issue certificates for a 30-person event |
| E3 Public verification | Time for a verifier to check one certificate |
| E4 Certificate format, privacy and quality | Share of issued certificates that pass the SHACL shape |

### Stories

| Epic | As a | I want | So that | Acceptance (Given / When / Then) | Category | Design concern | Value 1–10 | Time 1–10 | Risk 1–10 | Size 1–10 | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E1 On-chain certificate registry | Event organiser (end user) | to record each certificate's hash on the blockchain when I issue it | nobody can later claim the club did not issue it | Given my wallet has the ISSUER role, when I issue a certificate, then its hash, my address and the time are stored and a CertificateIssued event is emitted | New capability | Data | 9 | 8 | 8 | 5 | 5 |
| E1 On-chain certificate registry | Event organiser (end user) | only authorised club wallets to be able to issue or revoke | outsiders cannot create fake club certificates | Given a wallet without the ISSUER role, when it calls issue or revoke, then the transaction reverts with an access error | New capability | Security | 9 | 7 | 9 | 3 | 8.3 |
| E2 Certificate issuing for organisers | Event organiser (end user) | to upload the attendance CSV and issue all certificates of an event at once | issuing takes minutes instead of an hour | Given a valid CSV with 30 participants, when I confirm the batch, then 30 certificates are recorded in one transaction and 30 PDFs are ready to download | New capability | Interaction | 8 | 6 | 5 | 5 | 3.8 |
| E2 Certificate issuing for organisers | Event organiser (end user) | to revoke a certificate issued by mistake | a wrong certificate stops being shown as valid | Given an issued certificate, when I revoke it and the transaction confirms, then verify returns revoked with the revocation time | New capability | Data | 6 | 4 | 6 | 2 | 8 |
| E2 Certificate issuing for organisers | Certificate holder (end user) | to download my certificate as a PDF with a QR code | I can attach it to my CV and anyone can check it | Given I attended an event and my certificate was issued, when I open my download link, then I get a PDF showing my name, the event and a QR code to the verification page | New capability | User interface | 7 | 5 | 3 | 3 | 5 |
| E3 Public verification | Verifier (end user) | to scan the QR code and see at once whether the certificate is genuine | I do not have to e-mail the club and wait | Given a valid issued certificate, when I open its QR link on my phone, then within 10 seconds the page shows Valid with the club name and issue date | New capability | User interface | 10 | 7 | 6 | 3 | 7.7 |
| E3 Public verification | Verifier (end user) | to upload a certificate PDF and have it checked | an edited copy is detected even without the QR link | Given a PDF whose content was changed after issue, when I upload it, then the page shows Not found and warns that the file does not match any issued certificate | New capability | Security | 8 | 5 | 7 | 5 | 4 |
| E4 Certificate format, privacy and quality | Certificate holder (end user) | my name and student number to stay off the public blockchain | my personal data cannot be read or copied by anyone | Given any issued certificate, when the contract storage and events are inspected, then only a salted hash appears and no personal field is readable | Compliance | Security | 7 | 6 | 9 | 3 | 7.3 |

### Definition of done

| Criterion | How it is checked |
| --- | --- |
| Code is merged to main through a reviewed pull request | GitHub shows at least one approving review from another member |
| All unit and contract tests pass in CI | GitHub Actions run is green on the merge commit |
| The story's acceptance criterion is demonstrated on the Sepolia deployment | Transaction hash or screen recording linked in the work log |
| No personal data is written on chain | Reviewer checks contract storage and events in the pull request |

### Class model

CertificateRegistry (contract): uses OpenZeppelin AccessControl with ISSUER_ROLE; records: mapping(bytes32 => Record); functions issue(bytes32), issueBatch(bytes32[]) (at most 200 hashes), revoke(bytes32), verify(bytes32) returns (status, issuer, issuedAt, revokedAt) where status is NotFound, Valid or Revoked; errors EmptyHash, AlreadyIssued, NotIssued, AlreadyRevoked, BadBatchSize. Record (struct): issuer: address; issuedAt: uint64; revokedAt: uint64 (0 while the certificate is valid). Certificate (off chain, W3C VC JSON-LD): id: URI; issuer: Issuer; validFrom: dateTime; credentialSubject: recipientName, recipientEmail, eventTitle, eventDate, hours; wasGeneratedBy: Event; salt: string. Its SHA-256 hash of the canonical JSON is the bytes32 key; the hash is not a field of the certificate. Event: title, date. Issuer: club name, wallet address (did:pkh). Relations: an Event has many Certificates; a Certificate belongs to one Participant and one Issuer; a Record stores the hash of exactly one Certificate.

### Test cases

| For story | Test case | Test data |
| --- | --- | --- |
| to record each certificate's hash on the blockchain when I issue it | Issue a certificate from an ISSUER wallet and read it back with verify | Hardhat local network, issuer account #1, hash of sample certificate |
| only authorised club wallets to be able to issue or revoke | Call issue and revoke from a wallet without the role and expect a revert | Hardhat account #5 without ISSUER_ROLE |
| to upload the attendance CSV and issue all certificates of an event at once | Upload a 30-row CSV and check that one transaction records 30 hashes and 30 PDFs are produced | sample_attendance_30.csv |
| to revoke a certificate issued by mistake | Revoke an issued certificate and check that verify returns revoked with a timestamp | Previously issued sample certificate |
| to download my certificate as a PDF with a QR code | Download a certificate PDF and decode its QR code to the expected verification URL | Issued certificate for test participant |
| to scan the QR code and see at once whether the certificate is genuine | Open the QR link on a phone over mobile data and time the result | Certificate issued on Sepolia, Android phone |
| to upload a certificate PDF and have it checked | Edit one character in a certificate PDF, upload it and expect Not found | Tampered copy of sample certificate |
| my name and student number to stay off the public blockchain | Scan contract storage and all CertificateIssued events for plain-text personal fields | Sepolia deployment after the test batch |
| to upload the attendance CSV and issue all certificates of an event at once | Run the full flow with a 5-row CSV: issue in the dashboard, anchor with MetaMask, scan the QR code and expect Valid; then edit the PDF and expect Not found | 5-row CSV including Turkish characters, Sepolia contract, one phone and one laptop |

### Data — Class diagram

Class diagram: CertificateRegistry holds a mapping from bytes32 hash to Record (issuer, issuedAt, revokedAt). Off chain, the Certificate (W3C VC JSON-LD) links Event, Participant and Issuer; only the SHA-256 hash of its salted canonical JSON crosses to the chain.HA-256 hash crosses to the chain.

### Interaction — Sequence diagram

Sequence diagram: Organiser uploads CSV to Dashboard; Dashboard asks the service to build and validate certificates; MetaMask signs issueBatch; the contract emits events; Verifier opens the QR link; the page calls verify through a public RPC and shows the result.

### Security — State machine diagram

State machine for a certificate hash: Unknown → Issued (issue by ISSUER_ROLE only) → Revoked (revoke by ISSUER_ROLE only). Revoked is final; issuing an existing hash is refused; any call from a wallet without the role is refused in every state.

### User interface — design model

Mockups for three screens: dashboard event form with CSV upload and batch preview; certificate PDF layout with QR code; verification page with a large green Valid, orange Revoked or red Not found result and the issuer details below.

## 6. Course-specific

### Blockchain design

We use the Ethereum Sepolia testnet so the system costs nothing and is still public and independent of us; the contract could later move to a cheap layer-2 such as Polygon without changes. A Solidity CertificateRegistry contract, using OpenZeppelin AccessControl, stores only the SHA-256 hash of each salted JSON-LD certificate with its issuer and time, plus a revocation flag; verifying is a free read call. A blockchain is needed because the verifier must not have to trust the club or our server: a normal database run by the club could be edited or disappear when the board graduates, while the on-chain record is append-only, timestamped and publicly readable by anyone. Personal data stays off chain to respect KVKK.

Link to the course chapters. Chapter 1: the trust argument above is the problem a public, tamper-evident ledger solves, and Sepolia lets us use it without real money. Chapters 2 and 6: an issuer sends one transaction, issueBatch, that records many certificate hashes at once, so the cost and the waiting time are shared by the whole event. Chapter 4: the certificate hash is a commitment; the salt keeps the hash from being guessed and the contract never sees the certificate itself. Chapters 7 and 8: only wallets with the issuer role may write, and each write is authorised by a digital signature made in the issuer's MetaMask wallet, so the registry cannot be changed by anyone else. Verification needs no wallet, because it only reads the chain. Bitcoin-specific topics (Script, UTXOs, running Bitcoin Core) are not used, since Ethereum accounts and smart contracts replace them; we state this choice on purpose.

## Plan and risks

| Date | Deliverable | Lead |
| --- | --- | --- |
| 2026-10-26 | Proposal submitted, repository set up, customer meeting notes committed | Malak Alfakavi |
| 2026-11-09 | CertificateRegistry contract with tests deployed on Sepolia | Malak Alfakavi |
| 2026-11-23 | Issuer dashboard and certificate service issue a test batch end to end | Mohammed Ammar |
| 2026-11-30 | End-to-end test report with screenshots and failure-case results; first draft of the organiser and verifier user guide | Ujala Ali Qureshi |
| 2026-12-07 | Verification page done; trial at the IKU Computer Club's December workshop with the organiser and three verifiers | Raghd Alfakavi |
| 2026-12-16 | Tagged release v1.0, test report and final submission | Malak Alfakavi |

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Sepolia faucet limits or RPC outages slow down testing | Medium | Medium | Develop on a local Hardhat network, keep two RPC providers and request test ETH early. |
| The customer club is not available for the trial in December | Medium | High | Agree the trial date at the first meeting; fall back to another club event or a mock event with real club members. |
| Smart-contract bug lets a non-issuer write or blocks revocation | Low | High | Use audited OpenZeppelin AccessControl, aim for 90% test coverage and review every contract change. |
| Team members overloaded by capstone and other courses | High | Medium | Keep scope to the four areas, every module has a second member, and weekly 30-minute check-ins. |
| Personal data accidentally leaks on chain | Low | High | Only salted hashes on chain; DoD criterion and test S8 check every release. |

Repository: https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code — Confirmed on GitHub 2026-10-17 (public, created 2026-10-17)

## References

1. [1] S. Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System," 2008. https://bitcoin.org/bitcoin.pdf
2. [2] V. Buterin, "Ethereum Whitepaper: A Next-Generation Smart Contract and Decentralized Application Platform," 2014. https://ethereum.org/en/whitepaper/
3. [3] W3C, "Verifiable Credentials Data Model v2.0," W3C Recommendation, 2025. https://www.w3.org/TR/vc-data-model-2.0/
4. [4] W3C, "JSON-LD 1.1," W3C Recommendation, 2020. https://www.w3.org/TR/json-ld11/
5. [5] W3C, "PROV-O: The PROV Ontology," W3C Recommendation, 2013. https://www.w3.org/TR/prov-o/
6. [6] W3C, "Shapes Constraint Language (SHACL)," W3C Recommendation, 2017. https://www.w3.org/TR/shacl/
7. [7] A. Grech and A. F. Camilleri, "Blockchain in Education," JRC Science for Policy Report, European Commission, 2017. doi:10.2760/60649
8. [8] Blockcerts, "The Open Standard for Blockchain Credentials." https://www.blockcerts.org/
9. [9] OpenZeppelin, "Contracts: Access Control" documentation. https://docs.openzeppelin.com/contracts/access-control
10. [10] Hardhat documentation, Nomic Foundation. https://hardhat.org/docs

## Self-assessment

| Part | Weight | Grade | Criteria met |
| --- | --- | --- | --- |
| Team and work | 10% | 100/100 | 12 of 12 |
| Mission | 20% | 100/100 | 7 of 7 |
| Scope | 15% | 100/100 | 8 of 8 |
| Goal | 15% | 100/100 | 7 of 7 |
| Objective | 10% | 100/100 | 3 of 3 |
| Backlog | 20% | 100/100 | 10 of 10 |
| Course-specific | 5% | 100/100 | 1 of 1 |
| Plan and references | 5% | 100/100 | 3 of 3 |
| Overall | 100% | 100/100 |  |

### Member grades (Proposal)

Project grade 100 (60%), team grade 100 (20%), individual contribution (20%).

| Member | Student number | Individual | Member grade |
| --- | --- | --- | --- |
| Malak Alfakavi | 2200002701 | 100 | 100 |
| Raghd Alfakavi | 2200002698 | 100 | 100 |
| Mohammed Ammar | 2200002676 | 100 | 100 |
| Mohamad Mahfouz Khalil | 2200009092 | 100 | 100 |
| Ujala Ali Qureshi | 2400003598 | 78 | 95.6 |

