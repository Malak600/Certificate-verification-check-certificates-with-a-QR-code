import jsonld from 'jsonld';
import crypto from 'node:crypto';
import { sha256 } from './utils.js';

/**
 * Deterministically canonicalizes a JSON object following RFC 8785 rules.
 * Sorts object keys recursively and formats without extraneous whitespace.
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
 * Uses W3C URDNA2015 RDF dataset canonicalization where available, falling back to RFC 8785
 * canonical JSON to ensure zero failure in offline/airgapped environments.
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

  let canonicalString;
  try {
    // Attempt W3C URDNA2015 canonicalization
    canonicalString = await jsonld.canonize(certificate, {
      algorithm: 'URDNA2015',
      format: 'application/n-quads',
      skipExpansion: false,
    });
    // If empty N-Quads returned due to local synthetic contexts, fallback to canonical JSON
    if (!canonicalString || canonicalString.trim().length === 0) {
      canonicalString = canonicalizeJson(certificate);
    }
  } catch (_err) {
    // Deterministic fallback (RFC 8785 Canonical JSON)
    canonicalString = canonicalizeJson(certificate);
  }

  const hash = sha256(canonicalString);

  return {
    hash,
    bytes32: hash,
    canonicalString,
    salt,
  };
}
