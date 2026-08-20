import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as eventService from '../services/eventService';

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registeringId, setRegisteringId] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    eventService
      .listEvents()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleRegister(eventId) {
    setRegisteringId(eventId);
    setNotice('');
    try {
      await eventService.registerForEvent(eventId);
      navigate(`/events/${eventId}/ticket`);
    } catch (err) {
      if (err.status === 409) {
        // Already registered - just take them to their existing ticket.
        navigate(`/events/${eventId}/ticket`);
      } else {
        setNotice(err.message);
      }
    } finally {
      setRegisteringId(null);
    }
  }

  return (
    <div className="page container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Upcoming events</h1>
          <p className="page-subtitle">
            {user.role === 'student'
              ? 'Register for an event to get your QR entry ticket.'
              : 'Manage attendance for the events you organize.'}
          </p>
        </div>
        {user.role === 'admin' && (
          <Link to="/events/new" className="btn btn-primary">+ Create event</Link>
        )}
      </div>

      {notice && <div className="form-error">{notice}</div>}
      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <div className="card empty-state">No events yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {events.map((ev) => (
            <div key={ev._id} className="card card-padded" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 4 }}>{ev.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  {ev.venue} &middot; {formatDateTime(ev.startDate)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {user.role === 'student' ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/events/${ev._id}/ticket`)}
                    >
                      View ticket
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={registeringId === ev._id}
                      onClick={() => handleRegister(ev._id)}
                    >
                      {registeringId === ev._id ? 'Registering...' : 'Register'}
                    </button>
                  </>
                ) : (
                  <Link to={`/admin/events/${ev._id}/attendance`} className="btn btn-primary">
                    Manage attendance
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
