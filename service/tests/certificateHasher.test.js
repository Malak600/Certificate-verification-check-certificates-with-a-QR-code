import test from 'node:test';
import assert from 'node:assert/strict';
import { hashCertificate } from '../src/certificateHasher.js';
import { buildCertificate } from '../src/certificateBuilder.js';

test('Certificate Hasher - produces valid Solidity bytes32 hex string', async () => {
  const cert = buildCertificate(
    { name: 'Alice' },
    { title: 'Git Workshop', date: '2026-10-22' },
    { name: 'IKU Club', walletAddress: '0x1111111111111111111111111111111111111111' },
    { id: 'urn:uuid:11111111-1111-1111-1111-111111111111', salt: '0123456789abcdef0123456789abcdef' }
  );

  const result = await hashCertificate(cert);
  assert.ok(typeof result.hash === 'string');
  assert.equal(result.hash.startsWith('0x'), true);
  assert.equal(result.hash.length, 66); // 0x + 64 hex chars = 32 bytes
  assert.match(result.hash, /^0x[a-f0-9]{64}$/);
});

test('Certificate Hasher - is deterministic regardless of key order', async () => {
  const certA = {
    id: 'urn:uuid:test',
    type: ['VerifiableCredential'],
    issuer: { name: 'Club' },
    salt: 'abcdef0123456789abcdef0123456789',
    credentialSubject: { recipientName: 'Alice', eventTitle: 'Solidity' },
  };

  // Same content, reversed property key order
  const certB = {
    credentialSubject: { eventTitle: 'Solidity', recipientName: 'Alice' },
    salt: 'abcdef0123456789abcdef0123456789',
    issuer: { name: 'Club' },
    type: ['VerifiableCredential'],
    id: 'urn:uuid:test',
  };

  const hashA = await hashCertificate(certA);
  const hashB = await hashCertificate(certB);

  assert.equal(hashA.hash, hashB.hash);
});

test('Certificate Hasher - detects tampering (Story S7 test case)', async () => {
  const cert = buildCertificate(
    { name: 'Alice' },
    { title: 'Git Workshop', date: '2026-10-22' },
    { name: 'IKU Club' },
    { salt: '0123456789abcdef0123456789abcdef' }
  );

  const original = await hashCertificate(cert);

  // Tamper with recipient name
  const tampered = JSON.parse(JSON.stringify(cert));
  tampered.credentialSubject.recipientName = 'Bob';

  const tamperedHash = await hashCertificate(tampered);

  assert.notEqual(original.hash, tamperedHash.hash);
});

test('Certificate Hasher - different salts produce distinct hashes for identical data (KVKK)', async () => {
  const cert1 = buildCertificate(
    { name: 'Alice' },
    { title: 'Git Workshop', date: '2026-10-22' },
    { name: 'IKU Club' },
    { salt: '11111111111111111111111111111111' }
  );

  const cert2 = buildCertificate(
    { name: 'Alice' },
    { title: 'Git Workshop', date: '2026-10-22' },
    { name: 'IKU Club' },
    { salt: '22222222222222222222222222222222' }
  );

  const hash1 = await hashCertificate(cert1);
  const hash2 = await hashCertificate(cert2);

  assert.notEqual(hash1.hash, hash2.hash);
});
