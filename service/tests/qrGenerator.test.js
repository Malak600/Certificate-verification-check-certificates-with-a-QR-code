import test from 'node:test';
import assert from 'node:assert/strict';
import { generateQrBuffer, generateQrDataUrl } from '../src/qrGenerator.js';

test('QR Generator - produces valid PNG buffer matching PNG signature', async () => {
  const url = 'https://certichain.example.com/verify?id=urn:uuid:12345';
  const buffer = await generateQrBuffer(url);

  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 100);

  // Check PNG file magic header: 89 50 4E 47 0D 0A 1A 0A
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(buffer.subarray(0, 8).equals(pngHeader), true);
});

test('QR Generator - produces valid data URL for web rendering', async () => {
  const url = 'https://certichain.example.com/verify?id=urn:uuid:67890';
  const dataUrl = await generateQrDataUrl(url);

  assert.ok(typeof dataUrl === 'string');
  assert.ok(dataUrl.startsWith('data:image/png;base64,'));
});

test('QR Generator - throws when URL is missing', async () => {
  await assert.rejects(
    () => generateQrBuffer(''),
    /Verification URL must be a non-empty string/
  );
});
