import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication status
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('studentId', studentId);
        
        // Update app authentication state
        setIsAuthenticated(true);
        navigate('/home');
      } else {
        setError(data.message || 'Invalid student ID or password');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Top blue banner matching the main app design */}
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
        
        {/* Signup link */}
        <div style={{ 
          marginTop: '15px', 
          textAlign: 'center'
        }}>
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
        
        {/* Demo credentials help text */}
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #0ea5e9',
          borderRadius: '5px',
          fontSize: '0.9rem',
          color: '#0369a1'
        }}>
          <strong>Demo Credentials:</strong><br />
          Student ID: demo<br />
          Password: demo<br />
          <br />
          <em>Or use: 123123 / password</em>
        </div>
      </div>
    </div>
  );
};

export default Login;