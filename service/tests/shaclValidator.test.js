import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCertificate, assertValidCertificate } from '../src/shaclValidator.js';
import { buildCertificate } from '../src/certificateBuilder.js';

test('SHACL Validator - accepts fully compliant certificate (Objective O4)', () => {
  const cert = buildCertificate(
    { name: 'Ahmet Yilmaz', email: 'ahmet@stu.iku.edu.tr' },
    { title: 'Intro to Smart Contracts', date: '2026-10-22' },
    { name: 'IKU Computer Club', walletAddress: '0x1234567890123456789012345678901234567890' }
  );

  const report = validateCertificate(cert);
  assert.equal(report.conforms, true);
  assert.equal(report.errors.length, 0);

  // Does not throw
  assert.doesNotThrow(() => assertValidCertificate(cert));
});

test('SHACL Validator - rejects certificate missing VerifiableCredential type', () => {
  const cert = buildCertificate(
    { name: 'Ahmet' },
    { title: 'Workshop', date: '2026-10-22' },
    { name: 'Club' }
  );
  cert.type = ['JustAnEvent'];

  const report = validateCertificate(cert);
  assert.equal(report.conforms, false);
  assert.ok(report.errors.some(e => e.path === 'type'));
});

test('SHACL Validator - rejects certificate missing issuer', () => {
  const cert = buildCertificate(
    { name: 'Ahmet' },
    { title: 'Workshop', date: '2026-10-22' },
    { name: 'Club' }
  );
  delete cert.issuer;

  const report = validateCertificate(cert);
  assert.equal(report.conforms, false);
  assert.ok(report.errors.some(e => e.path === 'issuer'));
});

test('SHACL Validator - rejects certificate with short salt (< 16 chars)', () => {
  const cert = buildCertificate(
    { name: 'Ahmet' },
    { title: 'Workshop', date: '2026-10-22' },
    { name: 'Club' },
    { salt: 'tooshort' }
  );

  const report = validateCertificate(cert);
  assert.equal(report.conforms, false);
  assert.ok(report.errors.some(e => e.path === 'salt'));
});

test('SHACL Validator - rejects certificate with missing recipient name in subject', () => {
  const cert = buildCertificate(
    { name: 'Ahmet' },
    { title: 'Workshop', date: '2026-10-22' },
    { name: 'Club' }
  );
  cert.credentialSubject.recipientName = ' ';

  const report = validateCertificate(cert);
  assert.equal(report.conforms, false);
  assert.ok(report.errors.some(e => e.path === 'credentialSubject.recipientName'));
});
