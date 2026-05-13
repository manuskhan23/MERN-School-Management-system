// client/src/components/SuspendedUserPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function SuspendedUserPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#f8d7da', // Light red background for warning
      color: '#721c24', // Dark red text
      padding: '20px'
    }}>
      <h1 style={{ marginBottom: '20px' }}>Account Suspended</h1>
      <p style={{ fontSize: '1.2em', marginBottom: '30px' }}>
        Your account has been suspended. Please contact your principal for assistance.
      </p>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          fontSize: '1em',
          backgroundColor: '#dc3545', // Red button
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}