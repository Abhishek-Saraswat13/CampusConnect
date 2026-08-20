import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

const QR_REGION_ID = 'qr-reader';
// How long to ignore a repeat decode of the SAME code, so holding a QR in
// frame for a second doesn't fire onScan a dozen times. This is a UX
// debounce only - it is NOT what prevents duplicate attendance; that
// guarantee comes entirely from the backend's atomic update on the server.
const SAME_CODE_DEBOUNCE_MS = 3000;

/**
 * Wraps html5-qrcode's Html5QrcodeScanner - the library's higher-level,
 * self-contained widget (as opposed to the lower-level Html5Qrcode class).
 * It renders its own "requesting camera permission" state, and if a
 * device has more than one camera it shows a dropdown to pick between
 * them, rather than forcing one specific camera.
 *
 * This matters in practice: an earlier version of this component forced
 * `facingMode: 'environment'` (rear camera), which throws immediately on
 * any laptop that only has a front-facing camera - the scanner region
 * just sat empty with no visible error, which is exactly what "manage
 * attendance isn't working" looks like. Html5QrcodeScanner works with
 * whatever camera the device actually has.
 *
 * Calls onScan(decodedText) once per distinct code read (debounced - see
 * above). Camera/permission errors are shown by the widget itself inside
 * the scanner region, so there's no separate onError prop to wire up.
 */
export default function QRScanner({ onScan }) {
  const lastScanRef = useRef({ text: null, time: 0 });
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan; // always call the latest handler without re-mounting the scanner

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      QR_REGION_ID,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA], // camera only, no "upload a file" tab
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        const now = Date.now();
        if (
          decodedText === lastScanRef.current.text &&
          now - lastScanRef.current.time < SAME_CODE_DEBOUNCE_MS
        ) {
          return;
        }
        lastScanRef.current = { text: decodedText, time: now };
        onScanRef.current(decodedText);
      },
      () => {
        // Per-frame "no code found in this frame" callback - fires
        // continuously while the camera hunts for a code. Not an error.
      }
    );

    return () => {
      scanner.clear().catch(() => {
        // Already cleared / never fully started - safe to ignore.
      });
    };
  }, []);

  return <div id={QR_REGION_ID} />;
}
