import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Guards a route behind login, and optionally behind a set of roles.
 * This is a UX convenience only - it hides pages the user shouldn't see
 * and redirects them cleanly. It is NOT a security boundary; the backend
 * enforces every permission independently and would reject the request
 * even if someone bypassed this component entirely.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-page">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
