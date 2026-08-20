import React, { useRef, useState } from 'react';
import QRScanner from './QRScanner';
import * as attendanceService from '../services/attendanceService';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const IDLE = { state: 'idle' };

export default function ScannerPanel({ eventId }) {
  const [result, setResult] = useState(IDLE);
  const [log, setLog] = useState([]);
  const processingRef = useRef(false); // guards against overlapping scan requests

  async function handleScan(token) {
    if (processingRef.current) return;
    processingRef.current = true;
    setResult({ state: 'processing' });

    try {
      const data = await attendanceService.scanAttendance(eventId, token);
      setResult({ state: 'success', ...data });
      setLog((prev) => [
        { key: `${data.registrationId}-${data.attendedAt}`, ...data, outcome: 'success' },
        ...prev,
      ].slice(0, 15));
    } catch (err) {
      if (err.status === 409 && err.message === 'Attendance already marked') {
        setResult({ state: 'duplicate', ...err.data });
      } else if (err.status === 409) {
        setResult({ state: 'wrong-event', message: err.message });
      } else if (err.status === 404) {
        setResult({ state: 'invalid', message: err.message });
      } else if (err.status === 403 || err.status === 401) {
        setResult({ state: 'unauthorized', message: err.message });
      } else if (!err.status) {
        setResult({ state: 'network-error', message: err.message });
      } else {
        setResult({ state: 'invalid', message: err.message });
      }
    } finally {
      processingRef.current = false;
    }
  }

  const panelClass = {
    idle: 'scan-result-idle',
    processing: 'scan-result-idle',
    success: 'scan-result-success',
    duplicate: 'scan-result-duplicate',
    'wrong-event': 'scan-result-error',
    invalid: 'scan-result-error',
    unauthorized: 'scan-result-error',
    'network-error': 'scan-result-error',
  }[result.state];

  return (
    <div className="scanner-layout">
      <div>
        <QRScanner onScan={handleScan} />
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10, textAlign: 'center' }}>
          Point the camera at a student's ticket QR code.
        </p>
      </div>

      <div>
        <div className={`scan-result ${panelClass}`}>
          {result.state === 'idle' && (
            <div className="scan-result-title" style={{ color: 'var(--text-secondary)' }}>
              Waiting for a scan...
            </div>
          )}
          {result.state === 'processing' && (
            <div className="scan-result-title" style={{ color: 'var(--text-secondary)' }}>
              Verifying...
            </div>
          )}
          {result.state === 'success' && (
            <>
              <div className="scan-result-title">Attendance marked successfully.</div>
              <div className="scan-result-meta">
                <span><strong>{result.studentName}</strong></span>
                <span>Registration ID: {result.registrationId}</span>
                <span>Event: {result.eventName}</span>
                <span>Time: {formatTime(result.attendedAt)}</span>
              </div>
            </>
          )}
          {result.state === 'duplicate' && (
            <>
              <div className="scan-result-title">Attendance already marked.</div>
              <div className="scan-result-meta">
                <span><strong>{result.studentName}</strong></span>
                <span>Registration ID: {result.registrationId}</span>
                <span>Originally marked at: {formatTime(result.attendedAt)}</span>
              </div>
            </>
          )}
          {result.state === 'wrong-event' && (
            <div className="scan-result-title">This registration does not belong to this event.</div>
          )}
          {result.state === 'invalid' && (
            <div className="scan-result-title">Invalid or unrecognized QR code.</div>
          )}
          {result.state === 'unauthorized' && (
            <div className="scan-result-title">You're not authorized to scan for this event.</div>
          )}
          {result.state === 'network-error' && (
            <div className="scan-result-title">Network error - couldn't reach the server.</div>
          )}
        </div>

        {log.length > 0 && (
          <div className="scan-log">
            <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Recent scans</h3>
            {log.map((item) => (
              <div key={item.key} className="scan-log-item">
                <span>{item.studentName} &middot; {item.registrationId}</span>
                <span>{formatTime(item.attendedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
