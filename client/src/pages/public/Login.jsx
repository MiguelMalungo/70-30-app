import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleMockLogin = (role) => {
    login(role);
    // Role-based redirect
    if (role === 'CLIENT') navigate('/client');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/pro'); // Multi-role default (Master or Apprentice)
  };

  return (
    <div className="placeholder-view">
      <h1>Login & Onboarding</h1>
      <p style={{ marginBottom: '2rem' }}>Choose a persona to simulate authentication and routing:</p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button style={btnStyle} onClick={() => handleMockLogin('CLIENT')}>
          Log in as Client
        </button>
        <button style={btnStyle} onClick={() => handleMockLogin('MASTER')}>
          Log in as Master
        </button>
        <button style={btnStyle} onClick={() => handleMockLogin('APPRENTICE')}>
          Log in as Apprentice
        </button>
        <button style={{ ...btnStyle, backgroundColor: 'var(--color-primary-light)' }} onClick={() => handleMockLogin('ADMIN')}>
          Log in as Admin
        </button>
      </div>
    </div>
  );
};

const btnStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: 'var(--color-accent)',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  fontSize: '1rem'
};

export default Login;
