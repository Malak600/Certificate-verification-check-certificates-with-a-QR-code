import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, PDFName, PDFDict, PDFArray, decodePDFRawStream } from 'pdf-lib';
import { processBatch } from '../src/index.js';
import { hashCertificate } from '../src/certificateHasher.js';
import { CERTIFICATE_ATTACHMENT_NAME } from '../src/pdfGenerator.js';

// Reads the embedded certificate JSON the same way web/verify.html does.
async function embeddedJson(pdfBuffer) {
  const doc = await PDFDocument.load(pdfBuffer, { updateMetadata: false });
  const tree = doc.catalog.lookup(PDFName.of('Names'), PDFDict).lookup(PDFName.of('EmbeddedFiles'), PDFDict);
  const names = tree.lookup(PDFName.of('Names'), PDFArray);
  assert.equal(names.lookup(0).decodeText(), CERTIFICATE_ATTACHMENT_NAME);
  const stream = names.lookup(1, PDFDict).lookup(PDFName.of('EF'), PDFDict).lookup(PDFName.of('F'));
  return JSON.parse(new TextDecoder().decode(decodePDFRawStream(stream).decode()));
}

test('Story S7 - every PDF embeds its certificate JSON, and that JSON hashes to the on-chain hash', async () => {
  const { results, errors } = await processBatch(
    'name,email\nAyşe Yılmaz,a@stu.iku.edu.tr\nمحمد علي,m@stu.iku.edu.tr\n',
    { title: 'Git Workshop', date: '2026-12-05', hours: 3 },
    { name: 'IKU Computer Club', walletAddress: '0xd954914175f78a0eb7f146d12f4a00fd942f93ae' },
  );
  assert.deepEqual(errors, []);
  for (const r of results) {
    const cert = await embeddedJson(r.pdfBuffer);
    assert.deepEqual(cert, r.certificate);
    assert.equal((await hashCertificate(cert)).hash, r.hash);
  }
});

test('Story S7 - editing the embedded data changes the hash (tamper detection)', async () => {
  const { results } = await processBatch(
    'name,email\nAli Celik,ali@stu.iku.edu.tr\n',
    { title: 'Git Workshop', date: '2026-12-05', hours: 3 },
    { name: 'IKU Computer Club', walletAddress: '0xd954914175f78a0eb7f146d12f4a00fd942f93ae' },
  );
  const cert = await embeddedJson(results[0].pdfBuffer);
  cert.credentialSubject.recipientName = 'Someone Else';
  assert.notEqual((await hashCertificate(cert)).hash, results[0].hash);
});
