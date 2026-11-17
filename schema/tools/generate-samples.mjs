// Runs the REAL certificate pipeline (service/src/index.js processBatch) on a
// test attendance list and writes every certificate JSON to an output folder,
// so CI can check them against schema/certificate-shape.ttl with pySHACL.
//
// Usage (from the repo root, after `npm install` in service/):
//   node schema/tools/generate-samples.mjs <outDir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { processBatch } from '../../service/src/index.js';

const outDir = process.argv[2] || 'schema-samples';
mkdirSync(outDir, { recursive: true });

// 30 attendees = the batch size in objective O3; includes Turkish/Arabic names.
const names = ['Ayşe Yılmaz', 'Mehmet Öztürk', 'محمد علي', 'Zeynep Kaya', 'Ali Çelik'];
let csv = 'name,email\n';
for (let i = 0; i < 30; i++) {
  csv += `${names[i % names.length]} ${i + 1},student${i + 1}@stu.iku.edu.tr\n`;
}

const { results, errors } = await processBatch(
  csv,
  { title: 'Git Workshop', date: '2026-12-05', hours: 3 },
  {
    name: 'IKU Computer Club',
    clubName: 'IKU Computer Club',
    walletAddress: '0xD954914175f78A0EB7F146D12f4A00fD942f93AE',
  },
);

results.forEach((r, i) => {
  writeFileSync(join(outDir, `certificate-${String(i + 1).padStart(2, '0')}.json`), JSON.stringify(r.certificate, null, 2));
});

console.log(`Generated ${results.length} certificates in ${outDir} (${errors.length} pipeline errors)`);
if (errors.length) {
  console.error(JSON.stringify(errors, null, 2));
  process.exit(1);
}
