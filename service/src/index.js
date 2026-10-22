import { parseAttendanceCsv } from './csvParser.js';
import { buildCertificate } from './certificateBuilder.js';
import { hashCertificate } from './certificateHasher.js';
import { validateCertificate } from './shaclValidator.js';
import { generateQrBuffer } from './qrGenerator.js';
import { generateCertificatePdf } from './pdfGenerator.js';
import { buildVerificationUrl } from './utils.js';

export {
  parseAttendanceCsv,
  buildCertificate,
  hashCertificate,
  validateCertificate,
  generateQrBuffer,
  generateCertificatePdf,
  buildVerificationUrl,
};

/**
 * Orchestrates the full batch processing pipeline:
 * 1. Parses attendance CSV
 * 2. Builds W3C VC v2.0 JSON-LD credentials with cryptographic salt
 * 3. Enforces SHACL schema conformance
 * 4. Deterministically computes SHA-256 hashes (for Ethereum Sepolia issueBatch)
 * 5. Generates QR codes pointing to verification URLs
 * 6. Renders tamper-evident PDF certificates
 *
 * @param {string|Buffer} csvContent - Raw CSV file data
 * @param {object} eventDetails - { title: string, date: string, hours?: number }
 * @param {object} issuerDetails - { name: string, walletAddress: string, clubName?: string }
 * @param {object} [options] - Optional settings { verifyBaseUrl, templateBytes, templatePath }
 * @returns {Promise<{
 *   hashes: string[],
 *   certificates: object[],
 *   pdfs: Buffer[],
 *   results: Array<{ participant: object, certificate: object, hash: string, pdfBuffer: Buffer, verificationUrl: string }>,
 *   errors: Array<{ participant: object, errors: Array<{ path: string, message: string }> }>
 * }>}
 */
export async function processBatch(csvContent, eventDetails, issuerDetails, options = {}) {
  const verifyBaseUrl =
    options.verifyBaseUrl || process.env.VERIFY_BASE_URL || 'https://certichain.example.com/verify';

  // Step 1: Parse CSV
  const participants = parseAttendanceCsv(csvContent);

  const hashes = [];
  const certificates = [];
  const pdfs = [];
  const results = [];
  const errors = [];

  // Step 2: Process each participant
  for (const participant of participants) {
    try {
      // Build JSON-LD document
      const cert = buildCertificate(participant, eventDetails, issuerDetails);

      // Validate against SHACL shape
      const valReport = validateCertificate(cert);
      if (!valReport.conforms) {
        errors.push({
          participant,
          errors: valReport.errors,
        });
        continue;
      }

      // Compute deterministic hash (URDNA2015 canonicalization + SHA-256)
      const { hash } = await hashCertificate(cert);

      // Build verification URL
      const verificationUrl = buildVerificationUrl(verifyBaseUrl, cert.id);

      // Generate QR Code PNG Buffer
      const qrPng = await generateQrBuffer(verificationUrl);

      // Render PDF
      const pdfBuffer = await generateCertificatePdf(
        cert,
        qrPng,
        verificationUrl,
        options
      );

      hashes.push(hash);
      certificates.push(cert);
      pdfs.push(pdfBuffer);

      results.push({
        participant,
        certificate: cert,
        hash,
        pdfBuffer,
        verificationUrl,
      });
    } catch (err) {
      errors.push({
        participant,
        errors: [{ path: '@pipeline', message: err.message }],
      });
    }
  }

  return {
    hashes,
    certificates,
    pdfs,
    results,
    errors,
  };
}

export default {
  processBatch,
  parseAttendanceCsv,
  buildCertificate,
  hashCertificate,
  validateCertificate,
  generateQrBuffer,
  generateCertificatePdf,
  buildVerificationUrl,
};
