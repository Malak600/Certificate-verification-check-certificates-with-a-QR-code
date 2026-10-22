import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processBatch } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('End-to-End Pipeline - issues batch for 3 participants', async () => {
  const csvPath = path.join(__dirname, 'fixtures', 'sample-attendance-3.csv');
  const csvContent = await fs.readFile(csvPath, 'utf8');

  const eventDetails = {
    title: 'Ethereum Smart Contract Security',
    date: '2026-10-22',
    hours: 3,
  };

  const issuerDetails = {
    name: 'IKU Computer Club',
    walletAddress: '0x1234567890123456789012345678901234567890',
  };

  const batchResult = await processBatch(csvContent, eventDetails, issuerDetails);

  assert.equal(batchResult.errors.length, 0);
  assert.equal(batchResult.hashes.length, 3);
  assert.equal(batchResult.certificates.length, 3);
  assert.equal(batchResult.pdfs.length, 3);
  assert.equal(batchResult.results.length, 3);

  // Check each hash is a valid bytes32 hex string
  for (const hash of batchResult.hashes) {
    assert.match(hash, /^0x[a-f0-9]{64}$/);
  }

  // Ensure all hashes are distinct
  const uniqueHashes = new Set(batchResult.hashes);
  assert.equal(uniqueHashes.size, 3);

  // Verify all PDFs start with PDF signature
  for (const pdf of batchResult.pdfs) {
    assert.equal(pdf.subarray(0, 5).toString('ascii'), '%PDF-');
  }
});

test('End-to-End Pipeline - Story S3 & TC3: 30-participant batch issuing in seconds', async () => {
  const csvPath = path.join(__dirname, 'fixtures', 'sample-attendance-30.csv');
  const csvContent = await fs.readFile(csvPath, 'utf8');

  const eventDetails = {
    title: 'Solidity & Web3 Developer Bootcamp',
    date: '2026-10-22',
    hours: 6,
  };

  const issuerDetails = {
    name: 'IKU Computer Club',
    walletAddress: '0x1234567890123456789012345678901234567890',
  };

  const startTime = Date.now();
  const batchResult = await processBatch(csvContent, eventDetails, issuerDetails);
  const durationMs = Date.now() - startTime;

  // Objective O3 requires 30-person batch in under 5 minutes (300,000ms).
  // Here it executes in a few seconds!
  assert.ok(durationMs < 30000, `Batch completed in ${durationMs}ms, well below 5-minute target`);

  assert.equal(batchResult.errors.length, 0);
  assert.equal(batchResult.hashes.length, 30);
  assert.equal(batchResult.certificates.length, 30);
  assert.equal(batchResult.pdfs.length, 30);

  // 30 distinct hashes
  const uniqueHashes = new Set(batchResult.hashes);
  assert.equal(uniqueHashes.size, 30);
});

test('End-to-End Pipeline - Story S8 & Objective O5: KVKK compliance, zero personal data in hashes', async () => {
  const csvContent = 'name,email\nSuleyman Polat,suleyman.polat@stu.iku.edu.tr\n';
  const eventDetails = { title: 'Blockchain 101', date: '2026-10-22' };
  const issuerDetails = { name: 'IKU Club', walletAddress: '0x0000000000000000000000000000000000000001' };

  const batchResult = await processBatch(csvContent, eventDetails, issuerDetails);
  const hash = batchResult.hashes[0];

  // The hash should only contain hex digits, zero plain text substrings
  assert.equal(hash.toLowerCase().includes('suleyman'), false);
  assert.equal(hash.toLowerCase().includes('polat'), false);
  assert.equal(hash.toLowerCase().includes('iku.edu.tr'), false);
});
