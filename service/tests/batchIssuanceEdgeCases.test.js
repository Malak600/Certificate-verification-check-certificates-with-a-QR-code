import test from 'node:test';
import assert from 'node:assert/strict';
import { processBatch } from '../src/index.js';
import { parseAttendanceCsv } from '../src/csvParser.js';

/**
 * Quality Lead / Test Engineer: Mohamad Mahfouz Khalil (2200009092)
 * Feature: Dashboard and certificate service issue a test batch end to end (Epic E2 / Story S3)
 * Automated Edge-Case & Error-Handling Test Suite for Batch Issuance.
 */

test('Batch Issuance Edge Cases - rejects completely empty CSV', async () => {
  await assert.rejects(
    async () => {
      await parseAttendanceCsv('');
    },
    /empty/i,
    'Empty CSV must be rejected with an informative error'
  );
});

test('Batch Issuance Edge Cases - rejects CSV missing required headers', async () => {
  const badCsv = 'student_name,contact\nAli Yilmaz,ali@example.com\n';
  await assert.rejects(
    async () => {
      await parseAttendanceCsv(badCsv);
    },
    /header/i,
    'CSV missing "name" or "email" column must be rejected'
  );
});

test('Batch Issuance Edge Cases - reports row errors for missing participant names', async () => {
  const mixedCsv = 'name,email\n,missingname@stu.iku.edu.tr\nValid User,valid@stu.iku.edu.tr\n';
  const eventDetails = { title: 'Web3 Workshop', date: '2026-11-23', hours: 2 };
  const issuerDetails = { name: 'IKU Computer Club', walletAddress: '0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860' };

  const batch = await processBatch(mixedCsv, eventDetails, issuerDetails);

  assert.equal(batch.errors.length, 1, 'Invalid row must be reported in errors list');
  assert.equal(batch.results.length, 1, 'Valid row must still be processed');
  assert.equal(batch.hashes.length, 1);
  assert.equal(batch.pdfs.length, 1);
});

test('Batch Issuance Edge Cases - whitespace trimming on CSV entries', async () => {
  const messyCsv = 'name , email \n  Zeynep Kaya  ,  zeynep@stu.iku.edu.tr  \n';
  const eventDetails = { title: 'Smart Contracts 101', date: '2026-11-23' };
  const issuerDetails = { name: 'IKU Computer Club', walletAddress: '0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860' };

  const batch = await processBatch(messyCsv, eventDetails, issuerDetails);

  assert.equal(batch.errors.length, 0);
  assert.equal(batch.results.length, 1);
  assert.equal(batch.results[0].certificate.credentialSubject.recipientName, 'Zeynep Kaya');
  assert.equal(batch.results[0].certificate.credentialSubject.recipientEmail, 'zeynep@stu.iku.edu.tr');
});

test('Batch Issuance End-to-End - all generated hashes are distinct and valid bytes32', async () => {
  const csv = 'name,email\nUser A,a@stu.iku.edu.tr\nUser B,b@stu.iku.edu.tr\nUser C,c@stu.iku.edu.tr\n';
  const eventDetails = { title: 'Sepolia Deployment Event', date: '2026-11-23' };
  const issuerDetails = { name: 'IKU Computer Club', walletAddress: '0x7B40B303bD39685Ed6f7A236ff7E8F21D5D6B860' };

  const batch = await processBatch(csv, eventDetails, issuerDetails);

  assert.equal(batch.hashes.length, 3);
  for (const h of batch.hashes) {
    assert.match(h, /^0x[a-f0-9]{64}$/, 'Hash must strictly be a 64-char lowercase hex string prefixed with 0x');
  }
  const uniqueHashes = new Set(batch.hashes);
  assert.equal(uniqueHashes.size, 3, 'Every participant must receive a unique hash');
});
