import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as eventService from '../services/eventService';

const initialForm = {
  title: '',
  description: '',
  venue: '',
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  capacity: 100,
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const event = await eventService.createEvent({
        ...form,
        capacity: Number(form.capacity),
      });
      navigate(`/admin/events/${event._id}/attendance`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page container" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <h1 className="page-title">Create event</h1>
      </div>

      <div className="card card-padded">
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <input id="description" value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="venue">Venue</label>
            <input id="venue" value={form.venue} onChange={(e) => update('venue', e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="startDate">Start date &amp; time</label>
            <input
              id="startDate"
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="endDate">End date &amp; time</label>
            <input
              id="endDate"
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => update('endDate', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="registrationDeadline">Registration deadline</label>
            <input
              id="registrationDeadline"
              type="datetime-local"
              value={form.registrationDeadline}
              onChange={(e) => update('registrationDeadline', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="capacity">Capacity</label>
            <input
              id="capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => update('capacity', e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create event'}
          </button>
        </form>
      </div>
    </div>
  );
}
