import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processBatch } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDemo() {
  const outputDir = path.join(__dirname, 'output');
  await fs.mkdir(outputDir, { recursive: true });

  const sampleCsv = `name,email
Asmaa ComputerClub,asmaa@stu.iku.edu.tr
Ammar Cashlan,2200002676@stu.iku.edu.tr
`;

  const eventDetails = {
    title: 'Blockchain & Smart Contracts 101',
    date: '2026-10-22',
    hours: 4,
  };

  const issuerDetails = {
    name: 'IKU Computer Club',
    clubName: 'Istanbul Kültür University Computer Club',
    walletAddress: '0x2200002676000000000000000000000000000000',
  };

  console.log('Issuing demo batch with CertiChain service...');
  const result = await processBatch(sampleCsv, eventDetails, issuerDetails);

  console.log(`\nIssued ${result.certificates.length} certificates:`);
  for (let i = 0; i < result.results.length; i++) {
    const item = result.results[i];
    console.log(`\n[#${i + 1}] Recipient: ${item.participant.name}`);
    console.log(`     Certificate ID: ${item.certificate.id}`);
    console.log(`     On-chain Hash (bytes32): ${item.hash}`);
    console.log(`     Verification Link: ${item.verificationUrl}`);

    // Save JSON-LD
    const jsonPath = path.join(outputDir, `certificate-${i + 1}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(item.certificate, null, 2), 'utf8');

    // Save PDF
    const pdfPath = path.join(outputDir, `certificate-${i + 1}.pdf`);
    await fs.writeFile(pdfPath, item.pdfBuffer);

    console.log(`     Saved JSON-LD: ${jsonPath}`);
    console.log(`     Saved PDF:     ${pdfPath}`);
  }

  console.log('\n✅ Demo batch complete! All files saved in service/examples/output/');
}

runDemo().catch(console.error);
