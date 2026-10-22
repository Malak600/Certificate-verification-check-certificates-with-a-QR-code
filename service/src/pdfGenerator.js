import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Normalizes text to ensure compatibility with standard WinAnsi PDF fonts.
 * Transliterates Turkish and other accented characters.
 */
function toWinAnsiCompatibleText(text) {
  if (!text) return '';
  return String(text)
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U');
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

  // Load standard fonts
  const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontBody = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  const pages = pdfDoc.getPages();
  const page = pages[0];
  const { width, height } = page.getSize();

  // Extract certificate attributes with character normalization for WinAnsi PDF encoding
  const recipientName = toWinAnsiCompatibleText(
    certificate.credentialSubject?.recipientName || 'Valued Participant'
  );
  const eventTitle = toWinAnsiCompatibleText(
    certificate.credentialSubject?.eventTitle || 'University Workshop'
  );
  const eventDate = toWinAnsiCompatibleText(
    certificate.credentialSubject?.eventDate ||
      new Date(certificate.validFrom || Date.now()).toLocaleDateString()
  );
  const clubName = toWinAnsiCompatibleText(
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
    const urlDisplay = `Verify: ${verificationUrl}`;
    page.drawText(urlDisplay, {
      x: 80,
      y: 38,
      size: 7.5,
      font: fontMono,
      color: rgb(0.5, 0.55, 0.6),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
