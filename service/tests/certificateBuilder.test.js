import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCertificate } from '../src/certificateBuilder.js';

test('Certificate Builder - creates valid W3C VC v2.0 JSON-LD document', () => {
  const participant = { name: 'Ahmet Yilmaz', email: 'ahmet@stu.iku.edu.tr' };
  const eventDetails = { title: 'Introduction to Blockchain', date: '2026-10-22', hours: 4 };
  const issuerDetails = {
    name: 'IKU Computer Club',
    walletAddress: '0x1234567890123456789012345678901234567890',
  };

  const cert = buildCertificate(participant, eventDetails, issuerDetails);

  // Validate W3C VC v2 structure
  assert.ok(cert['@context'].includes('https://www.w3.org/ns/credentials/v2'));
  assert.ok(cert.id.startsWith('urn:uuid:'));
  assert.deepEqual(cert.type, ['VerifiableCredential', 'ParticipationCertificate']);
  assert.equal(cert.issuer.name, 'IKU Computer Club');
  assert.ok(cert.issuer.id.includes('0x1234567890123456789012345678901234567890'));

  // Validate Subject
  assert.equal(cert.credentialSubject.recipientName, 'Ahmet Yilmaz');
  assert.equal(cert.credentialSubject.eventTitle, 'Introduction to Blockchain');
  assert.equal(cert.credentialSubject.eventDate, '2026-10-22');

  // Validate Privacy Salt (KVKK requirement)
  assert.ok(typeof cert.salt === 'string');
  assert.ok(cert.salt.length >= 32);

  // Validate PROV-O provenance
  assert.ok(cert.wasAttributedTo);
  assert.ok(cert.wasGeneratedBy);
});

test('Certificate Builder - throws when participant name is missing', () => {
  assert.throws(
    () => buildCertificate({}, { title: 'Event', date: '2026-10-22' }, { name: 'Club' }),
    /Participant with a valid name is required/
  );
});

test('Certificate Builder - throws when event title or date is missing', () => {
  assert.throws(
    () => buildCertificate({ name: 'Alice' }, { date: '2026-10-22' }, { name: 'Club' }),
    /Event details must include at least title and date/
  );
});
