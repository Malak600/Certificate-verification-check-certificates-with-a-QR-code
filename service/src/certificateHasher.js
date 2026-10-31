import { sha256 } from './utils.js';

/**
 * Deterministically canonicalizes a JSON object following RFC 8785 rules.
 * Sorts object keys recursively and formats without extraneous whitespace.
 * Exactly matches the hashing logic used in web/verify.html.
 *
 * @param {*} value
 * @returns {string} Canonical JSON string
 */
export function canonicalizeJson(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeJson).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  const pairs = keys.map(k => `${JSON.stringify(k)}:${canonicalizeJson(value[k])}`);
  return `{${pairs.join(',')}}`;
}

/**
 * Computes a deterministic canonical representation and SHA-256 hash for a certificate.
 * Uses pure RFC 8785 canonical JSON directly (no remote context fetches), guaranteeing
 * instant execution and 100% exact parity with browser verification in web/verify.html.
 *
 * @param {object} certificate - The JSON-LD certificate document
 * @returns {Promise<{ hash: string, bytes32: string, canonicalString: string, salt: string }>}
 */
export async function hashCertificate(certificate) {
  if (!certificate || typeof certificate !== 'object') {
    throw new Error('Valid certificate object is required for hashing.');
  }

  const salt = certificate.salt;
  if (!salt || typeof salt !== 'string') {
    throw new Error('Certificate must contain a cryptographic salt string.');
  }

  // Pure deterministic RFC 8785 canonical JSON
  const canonicalString = canonicalizeJson(certificate);
  const hash = sha256(canonicalString);

  return {
    hash,
    bytes32: hash,
    canonicalString,
    salt,
  };
}
