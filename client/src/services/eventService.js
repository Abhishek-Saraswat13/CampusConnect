import api from './api';

export async function listEvents() {
  const res = await api.get('/events');
  return res.data.data;
}

export async function getEvent(eventId) {
  const res = await api.get(`/events/${eventId}`);
  return res.data.data;
}

export async function createEvent(payload) {
  const res = await api.post('/events', payload);
  return res.data.data;
}

export async function registerForEvent(eventId) {
  const res = await api.post(`/events/${eventId}/register`);
  return res.data.data;
}

export async function getTicket(eventId) {
  const res = await api.get(`/events/${eventId}/ticket`);
  return res.data.data;
}

export async function getEventStats(eventId) {
  const res = await api.get(`/events/${eventId}/stats`);
  return res.data.data;
}
