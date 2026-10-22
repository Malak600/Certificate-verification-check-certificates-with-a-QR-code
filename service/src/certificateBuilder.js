import { generateSalt, generateCertificateId } from './utils.js';

/**
 * Builds a W3C Verifiable Credential v2.0 JSON-LD document for an event participation certificate.
 *
 * @param {object} participant - { name: string, email?: string }
 * @param {object} eventDetails - { title: string, date: string, hours?: number, description?: string }
 * @param {object} issuerDetails - { name: string, walletAddress: string, clubName?: string, did?: string }
 * @param {object} [options] - Optional overrides for testing ({ id, salt, validFrom })
 * @returns {object} JSON-LD credential document
 */
export function buildCertificate(participant, eventDetails, issuerDetails, options = {}) {
  if (!participant || !participant.name) {
    throw new Error('Participant with a valid name is required.');
  }
  if (!eventDetails || !eventDetails.title || !eventDetails.date) {
    throw new Error('Event details must include at least title and date.');
  }
  if (!issuerDetails || (!issuerDetails.name && !issuerDetails.clubName)) {
    throw new Error('Issuer details must include club/issuer name.');
  }

  const certificateId = options.id || generateCertificateId();
  const salt = options.salt || generateSalt(16);
  const validFrom = options.validFrom || new Date().toISOString();

  const clubName = issuerDetails.clubName || issuerDetails.name || 'IKU Student Club';
  const walletAddress = issuerDetails.walletAddress || '0x0000000000000000000000000000000000000000';
  const issuerDid = issuerDetails.did || `did:pkh:eip155:11155111:${walletAddress.toLowerCase()}`;

  const credential = {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'http://www.w3.org/ns/prov#',
      {
        certichain: 'https://certichain.iku.edu.tr/schema#',
        ParticipationCertificate: 'certichain:ParticipationCertificate',
        eventTitle: 'certichain:eventTitle',
        eventDate: 'certichain:eventDate',
        hours: 'certichain:hours',
        recipientName: 'certichain:recipientName',
        recipientEmail: 'certichain:recipientEmail',
        salt: 'certichain:salt',
        clubName: 'certichain:clubName',
      },
    ],
    id: certificateId,
    type: ['VerifiableCredential', 'ParticipationCertificate'],
    issuer: {
      id: issuerDid,
      name: clubName,
    },
    validFrom,
    credentialSubject: {
      id: `urn:uuid:${generateSalt(8)}`,
      recipientName: participant.name.trim(),
      recipientEmail: (participant.email || '').trim(),
      eventTitle: eventDetails.title.trim(),
      eventDate: eventDetails.date.trim(),
      hours: Number(eventDetails.hours) || 0,
    },
    wasAttributedTo: {
      id: issuerDid,
    },
    wasGeneratedBy: {
      type: 'prov:Activity',
      name: `${clubName} - ${eventDetails.title}`,
    },
    salt,
  };

  return credential;
}
