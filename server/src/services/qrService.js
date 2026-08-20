const QRCode = require('qrcode');

/**
 * Generates a QR code for a registration as a base64 PNG data URL.
 *
 * Why the `qrcode` npm package:
 *  - Zero native dependencies (pure JS), so it installs cleanly on
 *    Vercel/Render build environments without extra build steps.
 *  - Produces a data URL directly (`toDataURL`), so the image can be sent
 *    straight to the frontend and rendered in an <img> tag with no extra
 *    file storage or static hosting required.
 *  - Actively maintained, ~/40M weekly downloads, sits well inside the
 *    "boring and reliable" category that's the right choice for a QR code
 *    - a part of the system where correctness matters far more than
 *    features.
 *
 * The QR encodes ONLY the attendance token - never the student's name,
 * email, or any other identifying data. The token is meaningless to
 * anyone who doesn't have backend access to resolve it against the
 * Registration collection.
 */
async function generateQrDataUrl(attendanceToken) {
  return QRCode.toDataURL(attendanceToken, {
    errorCorrectionLevel: 'M', // tolerates partial smudging/glare on phone screens
    margin: 2,
    width: 300,
  });
}

module.exports = { generateQrDataUrl };
