import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as eventService from '../services/eventService';
import ScannerPanel from '../components/ScannerPanel';
import DashboardPanel from '../components/DashboardPanel';

export default function OrganizerAttendancePage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [tab, setTab] = useState('scanner');

  useEffect(() => {
    eventService.getEvent(eventId).then(setEvent).catch(() => {});
  }, [eventId]);

  return (
    <div className="page container">
      <div className="page-header">
        <h1 className="page-title">{event ? event.title : 'Attendance'}</h1>
        <p className="page-subtitle">{event?.venue}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={tab === 'scanner' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setTab('scanner')}
        >
          Scanner
        </button>
        <button
          className={tab === 'dashboard' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setTab('dashboard')}
        >
          Dashboard
        </button>
      </div>

      {tab === 'scanner' ? (
        <ScannerPanel eventId={eventId} />
      ) : (
        <DashboardPanel eventId={eventId} eventTitle={event?.title} />
      )}
    </div>
  );
}
