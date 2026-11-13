import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, certificateStore } from '../src/server.js';

test('API Server - health check returns 200 and ok status', async (t) => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  t.after(() => server.close());

  const res = await fetch(`http://localhost:${port}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'certichain-api');
});

test('API Server - POST /api/issue generates hashes and stores certificate JSON and PDF', async (t) => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  t.after(() => server.close());

  const payload = {
    csv: 'name,email\nAmmar Cashlan,2200002676@stu.iku.edu.tr\nParticipant One,p1@stu.iku.edu.tr',
    title: 'Blockchain Workshop',
    date: '2026-12-05',
    clubName: 'IKU Computer Club',
    walletAddress: '0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860',
  };

  const issueRes = await fetch(`http://localhost:${port}/api/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.equal(issueRes.status, 200);
  const data = await issueRes.json();

  assert.equal(data.success, true);
  assert.equal(data.total, 2);
  assert.equal(data.hashes.length, 2);
  assert.ok(data.hashes[0].startsWith('0x'));

  const firstHash = data.hashes[0];

  // Test GET /api/certificate/:hash
  const certRes = await fetch(`http://localhost:${port}/api/certificate/${firstHash}`);
  assert.equal(certRes.status, 200);
  const certJson = await certRes.json();
  assert.equal(certJson.credentialSubject.recipientName, 'Ammar Cashlan');

  // Test GET /api/certificate/:hash/pdf
  const pdfRes = await fetch(`http://localhost:${port}/api/certificate/${firstHash}/pdf`);
  assert.equal(pdfRes.status, 200);
  assert.equal(pdfRes.headers.get('content-type'), 'application/pdf');
  const pdfBytes = Buffer.from(await pdfRes.arrayBuffer());
  assert.equal(pdfBytes.subarray(0, 5).toString('ascii'), '%PDF-');
});

test('API Server - rejects POST /api/issue when CSV is missing', async (t) => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  t.after(() => server.close());

  const res = await fetch(`http://localhost:${port}/api/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Workshop' }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('Missing CSV'));
});
