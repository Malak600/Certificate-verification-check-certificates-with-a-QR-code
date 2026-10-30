const { expect } = require("chai");
const { ethers } = require("hardhat");

// Status values returned by verify()
const NOT_FOUND = 0n, VALID = 1n, REVOKED = 2n;

// A certificate hash is the SHA-256 of the certificate JSON (made by Ammar's service).
const certHash = (text) => ethers.sha256(ethers.toUtf8Bytes(text));

describe("CertificateRegistry", function () {
  let registry, admin, organiser, outsider;

  beforeEach(async function () {
    [admin, organiser, outsider] = await ethers.getSigners();
    registry = await ethers.deployContract("CertificateRegistry");
    // the admin authorises the club organiser's wallet
    await registry.grantRole(await registry.ISSUER_ROLE(), organiser.address);
  });

  // ---------- S1: record the hash when issuing ----------
  it("S1: issues a certificate and verify() returns Valid with issuer and time", async function () {
    const h = certHash("certificate of Alice, Git workshop");
    await expect(registry.connect(organiser).issue(h))
      .to.emit(registry, "CertificateIssued")
      .withArgs(h, organiser.address, (t) => t > 0n);

    const [status, issuer, issuedAt, revokedAt] = await registry.verify(h);
    expect(status).to.equal(VALID);
    expect(issuer).to.equal(organiser.address);
    expect(issuedAt).to.be.greaterThan(0n);
    expect(revokedAt).to.equal(0n);
  });

  it("returns NotFound for a hash that was never issued (e.g. an edited PDF)", async function () {
    const [status, issuer] = await registry.verify(certHash("edited certificate"));
    expect(status).to.equal(NOT_FOUND);
    expect(issuer).to.equal(ethers.ZeroAddress);
  });

  it("rejects issuing the same certificate twice", async function () {
    const h = certHash("cert-1");
    await registry.connect(organiser).issue(h);
    await expect(registry.connect(organiser).issue(h))
      .to.be.revertedWithCustomError(registry, "AlreadyIssued").withArgs(h);
  });

  it("rejects an empty hash", async function () {
    await expect(registry.connect(organiser).issue(ethers.ZeroHash))
      .to.be.revertedWithCustomError(registry, "EmptyHash");
  });

  // ---------- S3: a whole event in one transaction ----------
  it("S3: issues 30 certificates in one batch transaction", async function () {
    const hashes = Array.from({ length: 30 }, (_, i) => certHash("attendee " + i));
    await registry.connect(organiser).issueBatch(hashes);
    for (const h of hashes) {
      const [status] = await registry.verify(h);
      expect(status).to.equal(VALID);
    }
  });

  it("rejects an empty batch (empty CSV)", async function () {
    await expect(registry.connect(organiser).issueBatch([]))
      .to.be.revertedWithCustomError(registry, "BadBatchSize").withArgs(0);
  });

  it("rejects the whole batch if one hash is a duplicate (nothing is recorded)", async function () {
    const a = certHash("a"), b = certHash("b");
    await registry.connect(organiser).issue(b);
    await expect(registry.connect(organiser).issueBatch([a, b]))
      .to.be.revertedWithCustomError(registry, "AlreadyIssued");
    const [status] = await registry.verify(a);
    expect(status).to.equal(NOT_FOUND);
  });

  // ---------- S2: only authorised club wallets ----------
  it("S2: a wallet without ISSUER_ROLE cannot issue", async function () {
    await expect(registry.connect(outsider).issue(certHash("fake")))
      .to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
  });

  it("S2: a wallet without ISSUER_ROLE cannot revoke", async function () {
    const h = certHash("cert-2");
    await registry.connect(organiser).issue(h);
    await expect(registry.connect(outsider).revoke(h))
      .to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
  });

  it("S2: an outsider cannot make themselves an issuer", async function () {
    const role = await registry.ISSUER_ROLE();
    await expect(registry.connect(outsider).grantRole(role, outsider.address))
      .to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
  });

  // ---------- S4: revoke a certificate issued by mistake ----------
  it("S4: revokes a certificate and verify() returns Revoked with the time", async function () {
    const h = certHash("wrong certificate");
    await registry.connect(organiser).issue(h);
    await expect(registry.connect(organiser).revoke(h))
      .to.emit(registry, "CertificateRevoked");

    const [status, , , revokedAt] = await registry.verify(h);
    expect(status).to.equal(REVOKED);
    expect(revokedAt).to.be.greaterThan(0n);
  });

  it("cannot revoke a certificate that was never issued", async function () {
    const h = certHash("never issued");
    await expect(registry.connect(organiser).revoke(h))
      .to.be.revertedWithCustomError(registry, "NotIssued").withArgs(h);
  });

  it("cannot revoke twice, and a revoked certificate cannot be issued again", async function () {
    const h = certHash("cert-3");
    await registry.connect(organiser).issue(h);
    await registry.connect(organiser).revoke(h);
    await expect(registry.connect(organiser).revoke(h))
      .to.be.revertedWithCustomError(registry, "AlreadyRevoked");
    await expect(registry.connect(organiser).issue(h))
      .to.be.revertedWithCustomError(registry, "AlreadyIssued");
  });

  // ---------- S8: no personal data on chain ----------
  it("S8: stores only the hash — the issued event contains no personal data", async function () {
    const h = certHash('{"name":"Alice Johnson","email":"alice@example.com"}');
    const tx = await registry.connect(organiser).issue(h);
    const receipt = await tx.wait();
    const raw = JSON.stringify(receipt.logs.map((l) => l.data + l.topics.join("")));
    expect(raw.toLowerCase()).to.not.include(Buffer.from("Alice").toString("hex"));
  });
});

describe("CertificateRegistry limits", function () {
  it("rejects a batch larger than MAX_BATCH (200)", async function () {
    const registry = await ethers.deployContract("CertificateRegistry");
    const hashes = Array.from({ length: 201 }, (_, i) => ethers.sha256(ethers.toUtf8Bytes("x" + i)));
    await expect(registry.issueBatch(hashes))
      .to.be.revertedWithCustomError(registry, "BadBatchSize").withArgs(201);
  });

  it("gas: issuing a 70-person event in one batch", async function () {
    const registry = await ethers.deployContract("CertificateRegistry");
    const hashes = Array.from({ length: 70 }, (_, i) => ethers.sha256(ethers.toUtf8Bytes("p" + i)));
    const receipt = await (await registry.issueBatch(hashes)).wait();
    console.log("      gas used for 70 certificates:", receipt.gasUsed.toString());
    expect(receipt.gasUsed).to.be.lessThan(30_000_000n);
  });
});
