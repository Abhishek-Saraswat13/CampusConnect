import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function EntryCard({ className, icon, title, desc, onSelect }) {
  return (
    <div
      className={`entry-card ${className}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <div className="entry-card-icon">{icon}</div>
      <div className="entry-card-title">{title}</div>
      <div className="entry-card-desc">{desc}</div>
    </div>
  );
}

export default function Login() {
  const { login, registerAccount } = useAuth();
  const navigate = useNavigate();

  // null = choice screen; 'student' | 'admin' = which login form is showing
  const [entryChoice, setEntryChoice] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' | 'register' - student only, admin has no self sign-up
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function chooseEntry(choice) {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setMode('login');
    setEntryChoice(choice);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (entryChoice === 'student' && mode === 'register') {
        await registerAccount(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // --- Step 1: choose Student or Event Admin ---
  if (!entryChoice) {
    return (
      <div className="center-page">
        <div style={{ width: 420 }}>
          <h1 style={{ fontSize: 22, textAlign: 'center', marginBottom: 4 }}>Welcome to CampusConnect</h1>
          <p className="page-subtitle" style={{ textAlign: 'center', marginBottom: 24 }}>
            Continue as...
          </p>
          <div className="entry-choice">
            <EntryCard
              className="entry-card-student"
              icon="S"
              title="Student"
              desc="Register for events & get your QR ticket"
              onSelect={() => chooseEntry('student')}
            />
            <EntryCard
              className="entry-card-admin"
              icon="A"
              title="Event Admin"
              desc="Create events & scan QR attendance"
              onSelect={() => chooseEntry('admin')}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- Step 2: login (and, for students only, sign up) ---
  const isAdmin = entryChoice === 'admin';

  return (
    <div className="center-page">
      <div className="card card-padded" style={{ width: 380 }}>
        <button type="button" className="back-link" onClick={() => setEntryChoice(null)}>
          &larr; Back
        </button>

        <h1 style={{ fontSize: 20, marginBottom: 4 }}>
          {isAdmin ? 'Event Admin login' : mode === 'login' ? 'Student login' : 'Create student account'}
        </h1>
        <p className="page-subtitle" style={{ marginBottom: 20 }}>
          {isAdmin ? 'Use the admin credentials for this deployment.' : 'CampusConnect event attendance'}
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isAdmin && mode === 'register' && (
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Log in'}
          </button>
        </form>

        {!isAdmin && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 16, textAlign: 'center' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--crimson-600)',
                cursor: 'pointer',
                fontWeight: 500,
                padding: 0,
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        )}

        {isAdmin && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
            Admin accounts. 
          </p>
        )}
      </div>
    </div>
  );
}
