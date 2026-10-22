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

A **JSON-LD 1.1 context**. It attaches meaning to each field in a certificate:

- `event` means a link to an event (from our own `cert:` vocabulary)
- `participant` means a link to a participant
- `issuedBy` maps to `prov:wasAttributedTo` from the W3C PROV-O ontology (who issued it)
- `name`, `email`, `date` map to schema.org terms that everyone already understands

This is what makes the certificate **machine-readable**: any system can parse it without guessing.

### 2. `certificate-shape.ttl` — the checklist

A **W3C SHACL shape**. It defines the rules every certificate must pass:

- exactly one event
- exactly one participant
- exactly one issuer
- one issue date
- one salt (a random string added before hashing, for privacy)
- a hash that is exactly 64 lowercase hexadecimal characters (a SHA-256 fingerprint)

The certificate service runs SHACL validation **before** hashing and sending anything to the blockchain. A certificate that does not conform is rejected — it never reaches the chain.

---

## How these files are used

1. **The certificate service** (owned by Mohammed Ammar) builds each certificate as a JSON-LD document using `context.jsonld`, and validates it against `certificate-shape.ttl` before hashing.
2. **The CI pipeline** (`.github/workflows/ci.yml`) runs the service's test suite on every push and pull request, so any breakage in the schema is caught immediately.
3. **The verification page** (owned by Raghd Alfakavi) reads the same context to display certificate fields to a verifier.

---

## Objectives this folder supports

| Objective | What it measures | Target |
|---|---|---|
| **O4** | Share of issued certificates that pass the SHACL shape | 100% |
| **O5** | Personal data fields written on chain | 0 |

The shape is the gate that enforces both: it blocks malformed certificates (O4) and it forbids personal data fields from being part of a valid certificate (O5). The salt ensures that even the SHA-256 hash cannot be reversed to reveal a name (KVKK compliance, story S8).
