import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as eventService from '../services/eventService';
import * as attendanceService from '../services/attendanceService';
import StatusBadge from './StatusBadge';

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardPanel({ eventId, eventTitle }) {
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      eventService.getEventStats(eventId),
      attendanceService.listAttendance(eventId, {
        status: status === 'all' ? undefined : status,
        search: search || undefined,
      }),
    ])
      .then(([statsData, rowsData]) => {
        setStats(statsData);
        setRows(rowsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId, status, search]);

  // Debounce search typing so we're not firing a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function handleExport() {
    setExporting(true);
    try {
      await attendanceService.downloadAttendanceCsv(eventId, eventTitle);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  const chartData = stats
    ? [
        { name: 'Registered', count: stats.totalRegistrations },
        { name: 'Attended', count: stats.totalAttended },
      ]
    : [];

  return (
    <div>
      {error && <div className="form-error">{error}</div>}

      {stats && (
        <div className="stat-grid">
          <div className="card stat-card">
            <div className="stat-label">Total registrations</div>
            <div className="stat-value">{stats.totalRegistrations}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Total attendees</div>
            <div className="stat-value">{stats.totalAttended}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Attendance %</div>
            <div className="stat-value">{stats.attendancePercentage}%</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
        </div>
      )}

      <div className="card card-padded" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>Registered vs Attended</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" allowDecimals={false} stroke="var(--text-secondary)" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={12} width={90} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--navy-800)" radius={[0, 4, 4, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card card-padded">
        <div className="toolbar">
          <input
            placeholder="Search by name, email, or reg. ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 240 }}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="attended">Attended</option>
            <option value="not_attended">Pending</option>
          </select>
          <div className="spacer" />
          <button className="btn btn-secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : rows.length === 0 ? (
          <div className="empty-state">No matching registrations.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Registration ID</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.registrationId}>
                  <td>{r.studentName}</td>
                  <td className="ticket-reg-id">{r.registrationId}</td>
                  <td>
                    <StatusBadge registrationStatus="confirmed" attendanceStatus={r.attendanceStatus} />
                  </td>
                  <td>{formatTime(r.attendedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
