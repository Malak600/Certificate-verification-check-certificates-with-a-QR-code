import test from 'node:test';
import assert from 'node:assert/strict';
import { hashCertificate, canonicalizeJson } from '../src/certificateHasher.js';
import { sha256 } from '../src/utils.js';

/**
 * Quality Lead / Test Engineer: Mohamad Mahfouz Khalil (2200009092)
 * Epic E4: Credential schema, tests and CI
 * Verification test for HASHING.md specification compliance.
 */

test('HASHING.md Spec - reproduces worked example canonical hash exactly', async () => {
  // Exact JSON from Section 5 of HASHING.md (in mixed key order)
  const cert = {
    id: 'https://certichain.example/c/0001',
    type: 'EventCertificate',
    '@context': 'https://certichain.example/context/v1',
    event: {
      title: 'Git Workshop',
      date: '2026-12-05',
      organiser: 'IKU Computer Club'
    },
    participant: {
      name: 'Ayse Yilmaz'
    },
    issuedBy: {
      wallet: '0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860',
      clubName: 'IKU Computer Club'
    },
    issuedOn: '2026-12-05',
    salt: '9f2c4a1be07d33c85a6e1f40d2b9c7a8'
  };

  const expectedCanonical = '{"@context":"https://certichain.example/context/v1","event":{"date":"2026-12-05","organiser":"IKU Computer Club","title":"Git Workshop"},"id":"https://certichain.example/c/0001","issuedBy":{"clubName":"IKU Computer Club","wallet":"0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860"},"issuedOn":"2026-12-05","participant":{"name":"Ayse Yilmaz"},"salt":"9f2c4a1be07d33c85a6e1f40d2b9c7a8","type":"EventCertificate"}';
  const expectedHash = '0x1cc9450abb434d4132d723e323ae36c72363f5d5b14c4096cc999a7d13c074cc';

  // 1. Canonical form check
  const actualCanonical = canonicalizeJson(cert);
  assert.equal(actualCanonical, expectedCanonical, 'Canonical JSON output must match HASHING.md section 5');

  // 2. Hash computation check
  const result = await hashCertificate(cert);
  assert.equal(result.hash, expectedHash, 'Computed hash must match HASHING.md section 5');
  assert.equal(result.bytes32, expectedHash, 'bytes32 format must match HASHING.md section 5');
});

test('HASHING.md Spec - canonicalization is invariant to key order', async () => {
  const certOrderA = {
    '@context': 'https://certichain.example/context/v1',
    type: 'EventCertificate',
    id: 'https://certichain.example/c/0002',
    event: { title: 'Web3 Security', date: '2026-11-20', organiser: 'IKU' },
    participant: { name: 'Mohamad Khalil' },
    issuedBy: { clubName: 'IKU Computer Club', wallet: '0x1234567890123456789012345678901234567890' },
    issuedOn: '2026-11-20',
    salt: 'a1b2c3d4e5f60718293a4b5c6d7e8f90'
  };

  const certOrderB = {
    salt: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    participant: { name: 'Mohamad Khalil' },
    issuedOn: '2026-11-20',
    event: { organiser: 'IKU', date: '2026-11-20', title: 'Web3 Security' },
    issuedBy: { wallet: '0x1234567890123456789012345678901234567890', clubName: 'IKU Computer Club' },
    type: 'EventCertificate',
    id: 'https://certichain.example/c/0002',
    '@context': 'https://certichain.example/context/v1'
  };

  const hashA = await hashCertificate(certOrderA);
  const hashB = await hashCertificate(certOrderB);

  assert.equal(hashA.canonicalString, hashB.canonicalString);
  assert.equal(hashA.hash, hashB.hash);
});

test('HASHING.md Spec - UTF-8 special / Turkish characters are preserved without escaping', async () => {
  const cert = {
    '@context': 'https://certichain.example/context/v1',
    type: 'EventCertificate',
    id: 'https://certichain.example/c/0003',
    event: { title: 'İleri Seviye Blokzincir ve Akıllı Sözleşmeler', date: '2026-12-01', organiser: 'İKÜ Bilgisayar Kulübü' },
    participant: { name: 'Çağla Şentürk' },
    issuedBy: { clubName: 'İKÜ Bilgisayar Kulübü', wallet: '0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860' },
    issuedOn: '2026-12-01',
    salt: '11223344556677889900aabbccddeeff'
  };

  const canonical = canonicalizeJson(cert);
  // Verify Turkish characters are unescaped UTF-8
  assert.ok(canonical.includes('İleri Seviye Blokzincir'));
  assert.ok(canonical.includes('Çağla Şentürk'));
  assert.ok(canonical.includes('İKÜ Bilgisayar Kulübü'));

  const result = await hashCertificate(cert);
  assert.match(result.hash, /^0x[a-f0-9]{64}$/);
});

test('HASHING.md Spec - Tamper detection (Story S7): 1 character change completely alters the hash', async () => {
  const original = {
    '@context': 'https://certichain.example/context/v1',
    type: 'EventCertificate',
    id: 'https://certichain.example/c/0004',
    event: { title: 'Hardhat Workshop', date: '2026-12-05', organiser: 'IKU' },
    participant: { name: 'Ali Veli' },
    issuedBy: { clubName: 'IKU Computer Club', wallet: '0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860' },
    issuedOn: '2026-12-05',
    salt: 'fedcba9876543210fedcba9876543210'
  };

  const tampered = JSON.parse(JSON.stringify(original));
  tampered.participant.name = 'Ali Vali'; // 1 character tampered

  const hashOriginal = await hashCertificate(original);
  const hashTampered = await hashCertificate(tampered);

  assert.notEqual(hashOriginal.hash, hashTampered.hash);
});
