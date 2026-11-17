import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'node:fs/promises';
import path from 'node:path';

import fontkit from '@pdf-lib/fontkit';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Unicode fonts (DejaVu Sans) so Turkish (ş, ğ, ı, İ ...) and Arabic names
// print correctly. The standard PDF fonts only support WinAnsi and crashed
// the whole batch on an Arabic name ("WinAnsi cannot encode").
/** File name of the certificate JSON embedded in every PDF (read by web/verify.html). */
export const CERTIFICATE_ATTACHMENT_NAME = 'certichain-certificate.json';

const FONT_DIR = path.join(path.dirname(require.resolve('dejavu-fonts-ttf/package.json')), 'ttf');

const ARABIC = /[\u0600-\u06FF\u0750-\u077F]/;
const FIRST_STRONG = /[A-Za-z\u00C0-\u024F\u0600-\u06FF\u0750-\u077F]/;

/**
 * Prepares user text for pdf-lib + fontkit. fontkit already joins Arabic
 * letters and lays out an Arabic line right-to-left, but it also reverses any
 * Latin letters or numbers inside that line ("Ahmed" -> "demhA", "12" -> "21").
 * Pre-reversing those runs cancels that out.
 */
export function toPdfText(text) {
  if (!text) return '';
  const str = String(text);
  const first = str.match(FIRST_STRONG);
  if (!first || !ARABIC.test(first[0])) return str;
  return str.replace(/[^\u0600-\u06FF\u0750-\u077F\s]+/g, run => [...run].reverse().join(''));
}

/**
 * Creates an elegant default certificate page if no external template is provided.
 * Standard A4 Landscape: 841.89 x 595.28 points.
 */
async function createDefaultCertificatePage(pdfDoc) {
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Background subtle cream tint
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.99, 0.99, 0.98),
  });

  // Outer border (Deep Navy / Slate)
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: rgb(0.12, 0.18, 0.28),
    borderWidth: 3,
  });

  // Inner decorative border (Gold accent)
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: rgb(0.80, 0.65, 0.25),
    borderWidth: 1.5,
  });

  // Corner ornamental squares
  const cornerSize = 8;
  const corners = [
    { x: 32, y: 32 },
    { x: width - 32 - cornerSize, y: 32 },
    { x: 32, y: height - 32 - cornerSize },
    { x: width - 32 - cornerSize, y: height - 32 - cornerSize },
  ];
  corners.forEach(c => {
    page.drawRectangle({
      x: c.x,
      y: c.y,
      width: cornerSize,
      height: cornerSize,
      color: rgb(0.80, 0.65, 0.25),
    });
  });

  return page;
}

/**
 * Generates a verifiable PDF certificate with dynamic text and an embedded QR code.
 *
 * @param {object} certificate - The JSON-LD certificate object
 * @param {Buffer|Uint8Array} qrPngBuffer - PNG image buffer of the verification QR code
 * @param {string} [verificationUrl] - The URL encoded in the QR code
 * @param {object} [options] - Optional custom template bytes or paths
 * @returns {Promise<Buffer>} The generated PDF as a Node.js Buffer
 */
export async function generateCertificatePdf(
  certificate,
  qrPngBuffer,
  verificationUrl = '',
  options = {}
) {
  let pdfDoc;

  // Try loading external template if provided or if file exists
  let templateLoaded = false;
  if (options.templateBytes) {
    pdfDoc = await PDFDocument.load(options.templateBytes);
    templateLoaded = true;
  } else if (options.templatePath) {
    try {
      const templateData = await fs.readFile(options.templatePath);
      pdfDoc = await PDFDocument.load(templateData);
      templateLoaded = true;
    } catch (_err) {
      // Fallback to default builder
    }
  }

  if (!templateLoaded) {
    pdfDoc = await PDFDocument.create();
    await createDefaultCertificatePage(pdfDoc);
  }

  // Load fonts: Unicode DejaVu Sans for anything that can contain user text,
  // standard fonts for the fixed English labels.
  pdfDoc.registerFontkit(fontkit);
  const [boldBytes, regularBytes] = await Promise.all([
    fs.readFile(path.join(FONT_DIR, 'DejaVuSans-Bold.ttf')),
    fs.readFile(path.join(FONT_DIR, 'DejaVuSans.ttf')),
  ]);
  const fontTitle = await pdfDoc.embedFont(boldBytes, { subset: true });
  const fontBody = await pdfDoc.embedFont(regularBytes, { subset: true });
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  const pages = pdfDoc.getPages();
  const page = pages[0];
  const { width, height } = page.getSize();

  // Extract certificate attributes (Arabic shaped for display; the certificate JSON is unchanged)
  const recipientName = toPdfText(
    certificate.credentialSubject?.recipientName || 'Valued Participant'
  );
  const eventTitle = toPdfText(
    certificate.credentialSubject?.eventTitle || 'University Workshop'
  );
  const eventDate = toPdfText(
    certificate.credentialSubject?.eventDate ||
      new Date(certificate.validFrom || Date.now()).toLocaleDateString()
  );
  const clubName = toPdfText(
    certificate.issuer?.name || 'Istanbul Kültür University Student Club'
  );
  const certificateId = certificate.id || '';

  // 1. Organization / Club Header
  const orgText = clubName.toUpperCase();
  const orgSize = 14;
  const orgWidth = fontTitle.widthOfTextAtSize(orgText, orgSize);
  page.drawText(orgText, {
    x: (width - orgWidth) / 2,
    y: height - 85,
    size: orgSize,
    font: fontTitle,
    color: rgb(0.2, 0.28, 0.42),
  });

  // 2. Main Title
  const mainTitle = 'CERTIFICATE OF PARTICIPATION';
  const titleSize = 26;
  const titleWidth = fontTitle.widthOfTextAtSize(mainTitle, titleSize);
  page.drawText(mainTitle, {
    x: (width - titleWidth) / 2,
    y: height - 130,
    size: titleSize,
    font: fontTitle,
    color: rgb(0.12, 0.18, 0.28),
  });

  // 3. Subtitle
  const subtitle = 'This certificate is proudly awarded to:';
  const subtitleSize = 13;
  const subtitleWidth = fontItalic.widthOfTextAtSize(subtitle, subtitleSize);
  page.drawText(subtitle, {
    x: (width - subtitleWidth) / 2,
    y: height - 175,
    size: subtitleSize,
    font: fontItalic,
    color: rgb(0.35, 0.4, 0.48),
  });

  // 4. Recipient Name (Prominent)
  const nameSize = 28;
  const nameWidth = fontTitle.widthOfTextAtSize(recipientName, nameSize);
  page.drawText(recipientName, {
    x: (width - nameWidth) / 2,
    y: height - 225,
    size: nameSize,
    font: fontTitle,
    color: rgb(0.08, 0.12, 0.2),
  });

  // Decorative underline under recipient name
  const lineHalfWidth = Math.max(nameWidth / 2 + 30, 160);
  page.drawLine({
    start: { x: width / 2 - lineHalfWidth, y: height - 238 },
    end: { x: width / 2 + lineHalfWidth, y: height - 238 },
    thickness: 1.5,
    color: rgb(0.80, 0.65, 0.25),
  });

  // 5. Completion Description
  const desc = 'for successfully completing and active participation in:';
  const descSize = 13;
  const descWidth = fontBody.widthOfTextAtSize(desc, descSize);
  page.drawText(desc, {
    x: (width - descWidth) / 2,
    y: height - 275,
    size: descSize,
    font: fontBody,
    color: rgb(0.3, 0.35, 0.42),
  });

  // 6. Event Title
  const eventSize = 18;
  const eventTextWidth = fontTitle.widthOfTextAtSize(eventTitle, eventSize);
  page.drawText(eventTitle, {
    x: (width - eventTextWidth) / 2,
    y: height - 310,
    size: eventSize,
    font: fontTitle,
    color: rgb(0.12, 0.18, 0.28),
  });

  // 7. Event Date & Metadata
  const dateText = `Date of Issue: ${eventDate}`;
  const dateSize = 12;
  page.drawText(dateText, {
    x: 80,
    y: height - 380,
    size: dateSize,
    font: fontBody,
    color: rgb(0.3, 0.35, 0.4),
  });

  const authText = 'Authorized Club Signature';
  page.drawLine({
    start: { x: 80, y: height - 425 },
    end: { x: 260, y: height - 425 },
    thickness: 1,
    color: rgb(0.6, 0.65, 0.7),
  });
  page.drawText(authText, {
    x: 80,
    y: height - 440,
    size: 10,
    font: fontItalic,
    color: rgb(0.4, 0.45, 0.5),
  });

  // 8. Embed QR Code (Bottom-Right)
  if (qrPngBuffer) {
    const qrImage = await pdfDoc.embedPng(qrPngBuffer);
    const qrSize = 100;
    const qrX = width - qrSize - 80;
    const qrY = 70;

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    const qrLabel = 'Scan to verify on-chain';
    const qrLabelSize = 9;
    const qrLabelWidth = fontBody.widthOfTextAtSize(qrLabel, qrLabelSize);
    page.drawText(qrLabel, {
      x: qrX + (qrSize - qrLabelWidth) / 2,
      y: qrY - 14,
      size: qrLabelSize,
      font: fontBody,
      color: rgb(0.35, 0.4, 0.48),
    });
  }

  // 9. Footer: Certificate ID & Tamper-proof notice
  const footerText = `CertiChain • ID: ${certificateId}`;
  page.drawText(footerText, {
    x: 80,
    y: 50,
    size: 8.5,
    font: fontMono,
    color: rgb(0.5, 0.55, 0.6),
  });

  if (verificationUrl) {
    // The full GitHub Pages link is too long for one line; the QR code holds
    // the link, so print the certificate hash (which verify.html accepts) and
    // only fall back to the URL when no hash is in it.
    const hashParam = (verificationUrl.match(/[?&]hash=(0x[0-9a-fA-F]{64})/) || [])[1];
    const urlDisplay = hashParam ? `Certificate hash: ${hashParam}` : `Verify: ${verificationUrl}`;
    page.drawText(urlDisplay, {
      x: 80,
      y: 38,
      size: 7.5,
      font: fontMono,
      color: rgb(0.5, 0.55, 0.6),
    });
  }

  // Story S7: embed the certificate JSON inside the PDF, so a verifier can
  // upload the PDF itself on web/verify.html. The page re-hashes this JSON
  // (canonical JSON + SHA-256, see HASHING.md) and checks the hash on chain;
  // an edited file gives a different hash and shows "Not found".
  const issuedDate = new Date(certificate.validFrom || Date.now());
  await pdfDoc.attach(Buffer.from(JSON.stringify(certificate, null, 2), 'utf8'), CERTIFICATE_ATTACHMENT_NAME, {
    mimeType: 'application/json',
    description: 'CertiChain certificate data. SHA-256 of its canonical JSON is the on-chain hash.',
    creationDate: issuedDate,
    modificationDate: issuedDate,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
