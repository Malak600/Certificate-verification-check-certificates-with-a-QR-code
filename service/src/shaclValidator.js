import { isValidIsoDate } from './utils.js';

/**
 * Validates a certificate document against the CertiChain SHACL shape rules.
 *
 * @param {object} certificate - The JSON-LD certificate document
 * @returns {{ conforms: boolean, errors: Array<{ path: string, message: string }> }}
 */
export function validateCertificate(certificate) {
  const errors = [];

  if (!certificate || typeof certificate !== 'object') {
    return {
      conforms: false,
      errors: [{ path: '@root', message: 'Certificate must be a non-null object.' }],
    };
  }

  // 1. Check ID
  if (!certificate.id || typeof certificate.id !== 'string') {
    errors.push({ path: 'id', message: 'Certificate must specify a valid URI identifier (id).' });
  }

  // 2. Check Type
  const types = Array.isArray(certificate.type) ? certificate.type : [certificate.type];
  if (!types.includes('VerifiableCredential')) {
    errors.push({
      path: 'type',
      message: 'Certificate type must include "VerifiableCredential".',
    });
  }

  // 3. Check Issuer
  if (!certificate.issuer) {
    errors.push({ path: 'issuer', message: 'Certificate must specify an issuer.' });
  } else if (typeof certificate.issuer === 'object') {
    if (!certificate.issuer.name && !certificate.issuer.id) {
      errors.push({
        path: 'issuer',
        message: 'Issuer must have a name or an identifier.',
      });
    }
  } else if (typeof certificate.issuer !== 'string') {
    errors.push({ path: 'issuer', message: 'Issuer must be a string URI or an object.' });
  }

  // 4. Check validFrom
  if (!certificate.validFrom) {
    errors.push({ path: 'validFrom', message: 'Certificate must have a validFrom timestamp.' });
  } else if (!isValidIsoDate(certificate.validFrom)) {
    errors.push({
      path: 'validFrom',
      message: 'validFrom must be a valid ISO-8601 dateTime string.',
    });
  }

  // 5. Check Salt (KVKK privacy requirement)
  if (!certificate.salt) {
    errors.push({
      path: 'salt',
      message: 'Certificate must have a cryptographic salt for KVKK privacy.',
    });
  } else if (typeof certificate.salt !== 'string' || certificate.salt.length < 16) {
    errors.push({
      path: 'salt',
      message: 'Cryptographic salt must be a string of at least 16 characters.',
    });
  }

  // 6. Check CredentialSubject
  const subject = certificate.credentialSubject;
  if (!subject || typeof subject !== 'object') {
    errors.push({
      path: 'credentialSubject',
      message: 'Certificate must include a credentialSubject object.',
    });
  } else {
    // recipientName
    if (!subject.recipientName || typeof subject.recipientName !== 'string' || subject.recipientName.trim().length < 2) {
      errors.push({
        path: 'credentialSubject.recipientName',
        message: 'Recipient must have a non-empty name of at least 2 characters.',
      });
    }
    // eventTitle
    if (!subject.eventTitle || typeof subject.eventTitle !== 'string' || subject.eventTitle.trim().length < 2) {
      errors.push({
        path: 'credentialSubject.eventTitle',
        message: 'Event title must be specified and at least 2 characters.',
      });
    }
    // eventDate
    if (!subject.eventDate || typeof subject.eventDate !== 'string' || subject.eventDate.trim().length === 0) {
      errors.push({
        path: 'credentialSubject.eventDate',
        message: 'Event date must be specified.',
      });
    }
  }

  return {
    conforms: errors.length === 0,
    errors,
  };
}

/**
 * Asserts that a certificate conforms to SHACL rules, throwing an Error if not.
 * @param {object} certificate
 * @throws {Error}
 */
export function assertValidCertificate(certificate) {
  const result = validateCertificate(certificate);
  if (!result.conforms) {
    const details = result.errors.map(e => `[${e.path}] ${e.message}`).join('; ');
    throw new Error(`SHACL Validation Failed: ${details}`);
  }
}
