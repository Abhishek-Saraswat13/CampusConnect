import api from './api';

export async function scanAttendance(eventId, attendanceToken) {
  // NOTE: errors (invalid QR, duplicate, wrong event, unauthorized) are
  // thrown as normalized Error objects by the axios interceptor in api.js
  // - callers read err.status and err.message to pick the right UI state.
  const res = await api.post(`/events/${eventId}/attendance/scan`, { attendanceToken });
  return res.data.data;
}

export async function listAttendance(eventId, { status, search } = {}) {
  const res = await api.get(`/events/${eventId}/attendance`, { params: { status, search } });
  return res.data.data;
}

/**
 * Downloads the attendance CSV. Implemented as an authenticated blob fetch
 * rather than a plain <a href="..."> link, because the export route is
 * JWT-protected and a normal browser navigation/link click does not carry
 * our Authorization header - only requests made through the `api` axios
 * instance (which injects it via the interceptor in api.js) do.
 */
export async function downloadAttendanceCsv(eventId, eventTitle) {
  const res = await api.get(`/events/${eventId}/attendance/export`, {
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `attendance-${(eventTitle || 'event').replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
