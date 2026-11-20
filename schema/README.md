# CertiChain — Certificate Schema

> **Developer:** Mohamad Mahfouz Khalil (Student No: 2200009092)  
> **Role:** Test Engineer, Requirements Analyst, Quality Lead  
> **Module:** Credential schema, tests and CI (Epic E4 Lead)  
> **Course:** SEN0401 Special Topics: Blockchain · Istanbul Kültür University  
> **GitHub Repository:** [CertiChain on GitHub](https://github.com/Malak600/Certificate-verification-check-certificates-with-a-QR-code)

---

## What this folder is

This folder holds the **data model** for CertiChain certificates. It defines **what a valid certificate looks like** — the meaning of each field, and the rules each certificate must pass before its hash is written to the Ethereum Sepolia testnet.

Without these two files, a certificate would just be a random JSON document. With them, any system (the certificate service, the CI pipeline, the verification page) can read a certificate, understand it, and check it against the rules.

---

## The files

### 1. `context.jsonld` — the dictionary

A **JSON-LD 1.1 context** that gives every field of the certificate built by `service/src/certificateBuilder.js` a meaning:

- `type`, `issuer`, `validFrom`, `credentialSubject` → W3C Verifiable Credentials v2 terms
- `wasAttributedTo`, `wasGeneratedBy` → W3C PROV-O (who issued it, which event produced it)
- `recipientName`, `recipientEmail`, `eventTitle`, `eventDate`, `hours`, `salt` → our own `certichain:` terms (`https://certichain.iku.edu.tr/schema#`)
- `name` → `schema:name`

This is what makes the certificate **machine-readable**: any system can parse it without guessing.

### 2. `certificate-shape.ttl` — the checklist

A **W3C SHACL shape** for `certichain:ParticipationCertificate`. Every certificate must:

- also be a W3C `VerifiableCredential`
- have exactly one issuer, written as a Sepolia `did:pkh` with a lowercase wallet address, and with a club name
- have `wasAttributedTo` pointing to that same issuer
- have exactly one `validFrom` timestamp (`xsd:dateTime`)
- have one `credentialSubject` with a non-empty recipient name, a non-empty event title and an event date (`YYYY-MM-DD`)
- name the event activity (`wasGeneratedBy`)
- carry one salt of exactly 32 lowercase hex characters (16 random bytes)

The hash is **not** a field: it is SHA-256 of the certificate itself (see `HASHING.md`), so it cannot be inside it.

### 3. `tools/` — the real check (objective O4)

- `generate-samples.mjs` runs the real service pipeline on a 30-person attendance list (Turkish and Arabic names included) and saves every certificate JSON.
- `validate.py` checks each certificate against the shape with **pySHACL**, then runs 10 negative tests (broken certificates that must be rejected).

```bash
npm install --prefix service
pip install pyshacl
node schema/tools/generate-samples.mjs schema-samples
python schema/tools/validate.py schema-samples
# O4 SHACL conformance: 30/30 = 100.0%
# Negative tests: 10/10 broken certificates rejected
```

The CI job `shacl-conformance` runs these two commands on every push and pull request.

> Note: the certificate's own `@context` lists `http://www.w3.org/ns/prov#`, which is a namespace, not a JSON-LD context document, so a generic JSON-LD tool cannot expand it online. `validate.py` therefore expands the certificate with `context.jsonld`, which maps the same fields to the same IRIs offline. Changing the certificate's `@context` would change every hash, so it was left as is.

---

## How these files are used

1. **The certificate service** (owned by Mohammed Ammar) builds each certificate as a JSON-LD document and checks it with a fast JavaScript validator (`service/src/shaclValidator.js`) before hashing.
2. **The CI pipeline** (`.github/workflows/ci.yml`) runs the service tests and the real pySHACL check against `certificate-shape.ttl` on every push and pull request, so any certificate that drifts from the schema is caught immediately.
3. **The verification page** (owned by Raghd Alfakavi) recomputes the hash of the same certificate JSON in the browser (see `HASHING.md`) and checks it on Sepolia.

---

## Objectives this folder supports

| Objective | What it measures | Target |
|---|---|---|
| **O4** | Share of issued certificates that pass the SHACL shape | 100% |
| **O5** | Personal data fields written on chain | 0 |

The shape is the gate that enforces both: it blocks malformed certificates (O4) and it forbids personal data fields from being part of a valid certificate (O5). The salt ensures that even the SHA-256 hash cannot be reversed to reveal a name (KVKK compliance, story S8).

---

## Week 2 Verification & CI Update (Milestone 2 Sign-Off)

* **CI Pipeline Integration:** The GitHub Actions pipeline ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) now verifies both `service/` and `contracts/` tests with automated coverage checking.
* **Specification Compliance:** Verified exact alignment with `HASHING.md` canonical JSON formatting and test vectors in [`service/tests/hashingSpec.test.js`](../service/tests/hashingSpec.test.js).
* **KVKK Privacy Verification:** Automated audit in [`service/tests/privacyAndCompliance.test.js`](../service/tests/privacyAndCompliance.test.js) verifies that zero personal data fields are exposed to the public blockchain.
* **Full Report:** See [`docs/reports/week2-verification-test-report.md`](../docs/reports/week2-verification-test-report.md).
