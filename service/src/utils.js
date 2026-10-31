import crypto from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a cryptographically secure random salt as a hex string.
 * @param {number} bytes - Number of random bytes (default 16 -> 32 hex chars)
 * @returns {string} Hex-encoded salt
 */
export function generateSalt(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generates a unique URN for a certificate.
 * @returns {string} urn:uuid:...
 */
export function generateCertificateId() {
  return `urn:uuid:${uuidv4()}`;
}

/**
 * Computes SHA-256 hash of a string or buffer.
 * @param {string|Buffer} data
 * @returns {string} 0x-prefixed 64-char hex string (Solidity bytes32)
 */
export function sha256(data) {
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `0x${hash}`;
}

/**
 * Builds the verification URL for a given certificate ID or hash.
 * Supports both ?hash= (for web/verify.html auto-check) and ?id= parameters.
 *
 * @param {string} baseUrl
 * @param {string} identifier - Certificate hash or ID
 * @param {string} [paramName='hash'] - 'hash' or 'id'
 * @returns {string}
 */
export function buildVerificationUrl(baseUrl, identifier, paramName = 'hash') {
  const cleanBase = (baseUrl || 'https://certichain.example.com/verify').replace(/\/+$/, '');
  const cleanParam = encodeURIComponent(identifier);
  return `${cleanBase}?${paramName}=${cleanParam}`;
}

/**
 * Validates whether an Ethereum address is properly formatted.
 * @param {string} address
 * @returns {boolean}
 */
export function isValidEthereumAddress(address) {
  return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates ISO-8601 date string.
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isValidIsoDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const d = new Date(dateStr);
  return !Number.isNaN(d.getTime());
}
