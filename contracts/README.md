# CertiChain — smart contract (Epic E1)

`CertificateRegistry.sol` stores the **SHA-256 hash** of every issued certificate on Ethereum (Sepolia),
with the wallet that issued it, the time, and whether it was revoked. **No personal data goes on chain.**

Owner: Malak Alfakavi · Second: Mohammed Ammar

## What the contract does

| Function | Who can call | What it does | Story |
|---|---|---|---|
| `issue(hash)` | ISSUER_ROLE | Records one certificate hash | S1 |
| `issueBatch(hashes)` | ISSUER_ROLE | Records a whole event (1–200) in one transaction | S3 |
| `revoke(hash)` | ISSUER_ROLE | Marks a certificate as revoked (it stays on record) | S4 |
| `verify(hash)` | anyone, free | Returns `NotFound` (0), `Valid` (1) or `Revoked` (2) + issuer + times | S6, S7 |
| `grantRole(ISSUER_ROLE, wallet)` | admin | Authorises a new club organiser | S2 |

Rules enforced by the contract:
- Only wallets with `ISSUER_ROLE` can issue or revoke; anyone else is rejected (`AccessControlUnauthorizedAccount`).
- A hash can be issued only once (`AlreadyIssued`) — even after it is revoked.
- An empty hash (`0x00…`) is rejected (`EmptyHash`).
- A batch must have 1–200 hashes (`BadBatchSize`); if one hash fails, **nothing** in the batch is recorded.
- Revoking an unknown or already-revoked certificate fails (`NotIssued`, `AlreadyRevoked`).
- The wallet that deploys the contract becomes admin and the first issuer.

## Run the tests

```bash
cd contracts
npm install
npm test          # 16 tests
npm run coverage  # line coverage (objective O2: target ≥ 90%)
```

Current result: **16 passing, 100% line coverage, 95% branch coverage**.
Gas for a 70-person event in one batch: about **2.0 million gas**.

## Deploy to Sepolia

### Option A — Remix + MetaMask (easiest, no private key in files)
1. Open https://remix.ethereum.org and create `CertificateRegistry.sol`; paste the contract.
2. **Solidity compiler** tab → version `0.8.24` → **Compile**.
3. **Deploy & run** tab → Environment: **Injected Provider – MetaMask** → make sure MetaMask is on **Sepolia**.
4. Contract: `CertificateRegistry` → **Deploy** → confirm in MetaMask.
5. Copy the deployed address and add it to the table below.

### Option B — Hardhat
1. Copy `.env.example` to `.env`, fill in `PRIVATE_KEY` of a **test-only** wallet. Never commit `.env`.
2. `npm run deploy:sepolia`

## Deployments

| Sepolia | 0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860 | 30 Oct 2026 | Malak Alfakavi |
