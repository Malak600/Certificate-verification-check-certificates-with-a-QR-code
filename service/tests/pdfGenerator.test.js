import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCertificatePdf } from '../src/pdfGenerator.js';
import { buildCertificate } from '../src/certificateBuilder.js';
import { generateQrBuffer } from '../src/qrGenerator.js';

test('PDF Generator - generates valid PDF buffer with embedded QR code', async () => {
  const cert = buildCertificate(
    { name: 'Fatma Celik', email: 'fatma@stu.iku.edu.tr' },
    { title: 'Web3 & Decentralized Apps', date: '2026-10-22' },
    { name: 'IKU Computer Club', walletAddress: '0x1234567890123456789012345678901234567890' }
  );

  const verificationUrl = `https://certichain.example.com/verify?id=${encodeURIComponent(cert.id)}`;
  const qrBuffer = await generateQrBuffer(verificationUrl);

  const pdfBuffer = await generateCertificatePdf(cert, qrBuffer, verificationUrl);

  assert.ok(Buffer.isBuffer(pdfBuffer));
  assert.ok(pdfBuffer.length > 5000);

  // PDF header signature "%PDF-"
  const header = pdfBuffer.subarray(0, 5).toString('ascii');
  assert.equal(header, '%PDF-');
});

test('PDF Generator - works even without QR code image', async () => {
  const cert = buildCertificate(
    { name: 'Ali Ozturk' },
    { title: 'Rust for Solidity Devs', date: '2026-10-22' },
    { name: 'IKU Computer Club' }
  );

  const pdfBuffer = await generateCertificatePdf(cert, null);
  assert.ok(Buffer.isBuffer(pdfBuffer));
  assert.equal(pdfBuffer.subarray(0, 5).toString('ascii'), '%PDF-');
});
