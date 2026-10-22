import { parse } from 'csv-parse/sync';

/**
 * Parses and validates an attendance CSV file.
 *
 * @param {string|Buffer} csvInput - Raw CSV string or buffer
 * @returns {Array<{ name: string, email: string, rowNumber: number }>}
 * @throws {Error} If CSV is empty, malformed, or missing required columns
 */
export function parseAttendanceCsv(csvInput) {
  if (!csvInput) {
    throw new Error('CSV file contains no data.');
  }

  const rawText = Buffer.isBuffer(csvInput) ? csvInput.toString('utf8') : String(csvInput);
  const trimmed = rawText.trim();
  if (trimmed.length === 0) {
    throw new Error('CSV file contains no data.');
  }

  let records;
  try {
    records = parse(trimmed, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    throw new Error(`CSV parsing error: ${err.message}`);
  }

  if (!records || records.length === 0) {
    throw new Error('CSV contains no data rows.');
  }

  // Find column names case-insensitively
  const firstRow = records[0];
  const keys = Object.keys(firstRow);

  const nameKey = keys.find(k => /^(name|fullname|recipient_?name|student_?name)$/i.test(k));
  const emailKey = keys.find(k => /^(email|e_?mail|recipient_?email|student_?email)$/i.test(k));

  if (!nameKey) {
    throw new Error(
      `Missing required "name" column. Found columns: ${keys.join(', ') || 'none'}`
    );
  }

  const participants = [];
  const errors = [];

  records.forEach((row, idx) => {
    const rowNum = idx + 2; // +1 for 1-based, +1 for header
    const name = (row[nameKey] || '').trim();
    const email = emailKey ? (row[emailKey] || '').trim() : '';

    if (!name) {
      errors.push(`Row ${rowNum}: Name is empty or missing.`);
      return;
    }

    participants.push({
      name,
      email,
      rowNumber: rowNum,
    });
  });

  if (errors.length > 0) {
    throw new Error(`Invalid attendance CSV:\n${errors.join('\n')}`);
  }

  if (participants.length === 0) {
    throw new Error('No valid participant entries found in CSV.');
  }

  return participants;
}
