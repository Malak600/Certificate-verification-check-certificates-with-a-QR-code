import QRCode from 'qrcode';

/**
 * Generates a PNG QR code buffer for the specified verification URL.
 *
 * @param {string} verificationUrl - The full verification URL
 * @param {object} [options] - Custom options for QR generation
 * @returns {Promise<Buffer>} PNG image buffer
 */
export async function generateQrBuffer(verificationUrl, options = {}) {
  if (!verificationUrl || typeof verificationUrl !== 'string') {
    throw new Error('Verification URL must be a non-empty string.');
  }

  const qrOptions = {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    type: 'png',
    margin: options.margin !== undefined ? options.margin : 1,
    width: options.width || 300,
    color: {
      dark: options.darkColor || '#0f172a',
      light: options.lightColor || '#ffffff',
    },
  };

  return await QRCode.toBuffer(verificationUrl, qrOptions);
}

/**
 * Generates a Base64 Data URL for the QR code (useful for web display).
 *
 * @param {string} verificationUrl
 * @param {object} [options]
 * @returns {Promise<string>} data:image/png;base64,...
 */
export async function generateQrDataUrl(verificationUrl, options = {}) {
  if (!verificationUrl || typeof verificationUrl !== 'string') {
    throw new Error('Verification URL must be a non-empty string.');
  }

  return await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    margin: options.margin !== undefined ? options.margin : 1,
    width: options.width || 300,
  });
}
