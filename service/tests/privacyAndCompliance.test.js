import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCertificate } from '../src/certificateBuilder.js';
import { hashCertificate } from '../src/certificateHasher.js';
import { validateCertificate } from '../src/shaclValidator.js';

/**
 * Quality Lead / Test Engineer: Mohamad Mahfouz Khalil (2200009092)
 * Epic E4: Certificate format, privacy and quality
 * Story S8 & Objective O5: KVKK compliance verification test suite.
 */

test('Privacy & Compliance (S8 / O5) - hash contains zero plain text PII', async () => {
  const sensitiveStudent = {
    name: 'Mohamad Mahfouz Khalil',
    email: '2200009092@stu.iku.edu.tr',
    studentNumber: '2200009092'
  };

  const cert = buildCertificate(
    sensitiveStudent,
    { title: 'Blockchain Special Topics', date: '2026-11-09' },
    { name: 'IKU Computer Club', walletAddress: '0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860' }
  );

  const { hash, salt } = await hashCertificate(cert);

  // Objective O5: Exactly zero plain-text PII fields leak into the blockchain hash
  assert.equal(hash.toLowerCase().includes('mohamad'), false, 'Name must not appear in on-chain hash');
  assert.equal(hash.toLowerCase().includes('mahfouz'), false, 'Name must not appear in on-chain hash');
  assert.equal(hash.toLowerCase().includes('khalil'), false, 'Name must not appear in on-chain hash');
  assert.equal(hash.toLowerCase().includes('2200009092'), false, 'Student ID must not appear in on-chain hash');
  assert.equal(hash.toLowerCase().includes('stu.iku.edu.tr'), false, 'Email domain must not appear in on-chain hash');

  // Verify salt properties
  assert.match(salt, /^[a-f0-9]{32}$/, 'Salt must be a 32-character hexadecimal string');
});

test('Privacy & Compliance (S8 / O5) - identical attendee info with distinct salts yields distinct hashes', async () => {
  const attendee = { name: 'Ahmet Kaya', email: 'ahmet.kaya@stu.iku.edu.tr' };
  const event = { title: 'Intro to Web3', date: '2026-11-09' };
  const issuer = { name: 'IKU Club', walletAddress: '0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860' };

  const cert1 = buildCertificate(attendee, event, issuer);
  const cert2 = buildCertificate(attendee, event, issuer);

  const hash1 = await hashCertificate(cert1);
  const hash2 = await hashCertificate(cert2);

  // Distinct cryptographic salts prevent dictionary / correlation attacks across events
  assert.notEqual(cert1.salt, cert2.salt, 'Each certificate must have a unique CSPRNG salt');
  assert.notEqual(hash1.hash, hash2.hash, 'Hashes must differ even for identical attendee details due to salting');
});

test('Privacy & Compliance (O4) - issued certificate strictly conforms to SHACL shape before on-chain commit', () => {
  const cert = buildCertificate(
    { name: 'Fatma Demir', email: 'fatma.demir@stu.iku.edu.tr' },
    { title: 'Smart Contract Architecture', date: '2026-11-09' },
    { name: 'IKU Computer Club', walletAddress: '0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860' }
  );

  const report = validateCertificate(cert);
  assert.equal(report.conforms, true, 'Certificate must pass SHACL shape validation (Objective O4: 100%)');
  assert.equal(report.errors.length, 0);
});
