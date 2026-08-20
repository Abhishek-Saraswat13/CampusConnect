import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="center-page">
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Page not found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary">Back home</Link>
      </div>
    </div>
  );
}
