import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAttendanceCsv } from '../src/csvParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('CSV Parser - successfully parses valid 3-row CSV', async () => {
  const filePath = path.join(__dirname, 'fixtures', 'sample-attendance-3.csv');
  const content = await fs.readFile(filePath, 'utf8');

  const participants = parseAttendanceCsv(content);
  assert.equal(participants.length, 3);
  assert.equal(participants[0].name, 'Alice Johnson');
  assert.equal(participants[0].email, 'alice@stu.iku.edu.tr');
  assert.equal(participants[1].name, 'Bob Smith');
  assert.equal(participants[2].name, 'Charlie Brown');
});

test('CSV Parser - successfully parses 30-row attendance list (TC3 requirement)', async () => {
  const filePath = path.join(__dirname, 'fixtures', 'sample-attendance-30.csv');
  const content = await fs.readFile(filePath, 'utf8');

  const participants = parseAttendanceCsv(content);
  assert.equal(participants.length, 30);
  assert.equal(participants[0].name, 'Ahmet Yilmaz');
  assert.equal(participants[29].name, 'Derya Aksoy');
});

test('CSV Parser - handles flexible column headers (e.g. FullName, Student_Email)', () => {
  const customCsv = `FullName,Student_Email\nJohn Doe,john@test.com`;
  const participants = parseAttendanceCsv(customCsv);
  assert.equal(participants.length, 1);
  assert.equal(participants[0].name, 'John Doe');
  assert.equal(participants[0].email, 'john@test.com');
});

test('CSV Parser - throws error on empty CSV input (Scenario Absent)', () => {
  assert.throws(() => parseAttendanceCsv(''), /CSV file contains no data/);
  assert.throws(() => parseAttendanceCsv('   \n  '), /CSV file contains no data/);
});

test('CSV Parser - throws error when required name column is missing', () => {
  const noNameCsv = `email,phone\nuser@test.com,555-1234`;
  assert.throws(() => parseAttendanceCsv(noNameCsv), /Missing required "name" column/);
});

test('CSV Parser - throws error when a row has an empty name', () => {
  const blankRowCsv = `name,email\nValid Name,a@b.com\n ,b@b.com`;
  assert.throws(() => parseAttendanceCsv(blankRowCsv), /Row 3: Name is empty or missing/);
});
