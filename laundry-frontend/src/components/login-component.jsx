// src/components/login-component.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('studentId');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await api.post('/api/auth/login', {
        student_id: studentId,
        password
      });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('studentId', studentId);
      setIsAuthenticated?.(true);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Invalid student ID or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Top banner */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Northwestern Campus Laundry Hub</h1>
          <p className="hero-subtitle">Please log in with your student credentials</p>
        </div>
      </div>

      {/* Login form */}
      <div className="login-container">
        <h2>Student Login</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleLogin}>
          <label htmlFor="studentId">Student ID</label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter your student ID"
            required
            disabled={isLoading}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Sign up redirect */}
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <span style={{ color: '#666' }}>Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 'inherit'
            }}
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
