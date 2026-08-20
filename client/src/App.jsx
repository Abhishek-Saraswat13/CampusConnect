import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import EventTicket from './pages/EventTicket';
import OrganizerAttendancePage from './pages/OrganizerAttendancePage';
import NotFound from './pages/NotFound';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-page">Loading...</div>;
  }

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:eventId/ticket"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <EventTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/events/:eventId/attendance"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OrganizerAttendancePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
