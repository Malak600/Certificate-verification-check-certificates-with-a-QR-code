import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hashCertificate, canonicalizeJson } from '../src/certificateHasher.js';
import { processBatch } from '../src/index.js';
import { toPdfText } from '../src/pdfGenerator.js';
import { buildVerificationUrl, DEFAULT_VERIFY_BASE_URL } from '../src/utils.js';

const HASHING_MD = readFileSync(new URL('../../HASHING.md', import.meta.url), 'utf8');

test('HASHING.md section 5 - the published worked example gives the published hash', async () => {
  const canonical = HASHING_MD.match(/```json\n(.*)\n```/)[1];
  const expected = HASHING_MD.match(/```text\n(0x[0-9a-f]{64})\n```/)[1];
  const cert = JSON.parse(canonical);
  assert.equal(canonicalizeJson(cert), canonical, 'canonical form must match HASHING.md byte for byte');
  assert.equal((await hashCertificate(cert)).hash, expected);
});

test('Batch - Arabic and Turkish names produce PDFs instead of failing', async () => {
  const csv = 'name,email\nمحمد علي,m@stu.iku.edu.tr\nAyşe Yılmaz,a@stu.iku.edu.tr\nسارة Ahmed,s@stu.iku.edu.tr\n';
  const { results, errors } = await processBatch(
    csv,
    { title: 'Git Workshop', date: '2026-12-05', hours: 3 },
    { name: 'IKU Computer Club', walletAddress: '0xd954914175f78a0eb7f146d12f4a00fd942f93ae' },
  );
  assert.deepEqual(errors, []);
  assert.equal(results.length, 3);
  for (const r of results) assert.equal(r.pdfBuffer.subarray(0, 5).toString(), '%PDF-');
  // The certificate JSON keeps the name exactly as typed (the hash depends on it).
  assert.equal(results[0].certificate.credentialSubject.recipientName, 'محمد علي');
});

test('toPdfText - keeps Latin words and numbers readable inside an Arabic line', () => {
  assert.equal(toPdfText('Ayşe Yılmaz'), 'Ayşe Yılmaz');
  assert.equal(toPdfText('محمد 12'), 'محمد 21');      // fontkit reverses it back to 12
  assert.equal(toPdfText('سارة Ahmed'), 'سارة demhA'); // fontkit reverses it back to Ahmed
});

test('QR link - points to the public verify page, not a placeholder domain', async () => {
  assert.ok(DEFAULT_VERIFY_BASE_URL.startsWith('https://malak600.github.io/'));
  assert.ok(DEFAULT_VERIFY_BASE_URL.endsWith('/web/verify.html'));
  const hash = '0x' + 'ab'.repeat(32);
  assert.equal(buildVerificationUrl(undefined, hash), `${DEFAULT_VERIFY_BASE_URL}?hash=${hash}`);
  const saved = process.env.VERIFY_BASE_URL;
  delete process.env.VERIFY_BASE_URL;
  const { results } = await processBatch('name,email\nTest User,t@x.com\n',
    { title: 'Git Workshop', date: '2026-12-05', hours: 2 }, { name: 'IKU Computer Club' });
  if (saved !== undefined) process.env.VERIFY_BASE_URL = saved;
  assert.ok(results[0].verificationUrl.startsWith(DEFAULT_VERIFY_BASE_URL + '?hash=0x'));
});
