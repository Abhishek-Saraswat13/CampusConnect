import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as eventService from '../services/eventService';
import StatusBadge from '../components/StatusBadge';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventTicket() {
  const { eventId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    eventService
      .getTicket(eventId)
      .then(setTicket)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return <div className="page container">Loading ticket...</div>;
  }

  if (error) {
    return (
      <div className="page container" style={{ maxWidth: 480 }}>
        <div className="card card-padded empty-state">
          <p style={{ marginBottom: 16 }}>{error}</p>
          <Link to="/" className="btn btn-primary">Back to events</Link>
        </div>
      </div>
    );
  }

  const isAttended = ticket.attendanceStatus === 'attended';

  return (
    <div className="page container" style={{ maxWidth: 620 }}>
      <div className="page-header">
        <h1 className="page-title">Your ticket</h1>
        <p className="page-subtitle">Show this QR code at the entrance to be scanned in.</p>
      </div>

      <div className="ticket">
        {isAttended && (
          <div className="ticket-attended-banner" style={{ gridColumn: '1 / -1' }}>
            Attendance Marked {'\u2713'}
          </div>
        )}
        <div className="ticket-details">
          <h2 className="ticket-event-name">{ticket.event.title}</h2>
          <p className="ticket-venue">{ticket.event.venue}</p>

          <div className="ticket-row">
            <span className="ticket-row-label">Student</span>
            <span className="ticket-row-value">{ticket.student.name}</span>
          </div>
          <div className="ticket-row">
            <span className="ticket-row-label">Registration ID</span>
            <span className="ticket-row-value ticket-reg-id">{ticket.registrationId}</span>
          </div>
          <div className="ticket-row">
            <span className="ticket-row-label">Date &amp; time</span>
            <span className="ticket-row-value">{formatDateTime(ticket.event.startDate)}</span>
          </div>
          <div className="ticket-row">
            <span className="ticket-row-label">Status</span>
            <span className="ticket-row-value">
              <StatusBadge
                registrationStatus={ticket.registrationStatus}
                attendanceStatus={ticket.attendanceStatus}
              />
            </span>
          </div>
        </div>

        <div className="ticket-stub">
          <div className="ticket-qr">
            <img src={ticket.qrCodeDataUrl} alt="Entry QR code" />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            Scan at entry
          </span>
        </div>
      </div>
    </div>
  );
}
