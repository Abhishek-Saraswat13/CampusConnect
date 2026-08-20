import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">CampusConnect</Link>
        {user && (
          <div className="navbar-user">
            <span>{user.name}</span>
            <span className="navbar-role-pill">{user.role}</span>
            <button className="navbar-logout" onClick={handleLogout}>Log out</button>
          </div>
        )}
      </div>
    </div>
  );
}
