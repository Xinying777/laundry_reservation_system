import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Valid credentials for demo purposes
  const validCredentials = [
    { id: '123123', password: 'password' },
    { id: '456789', password: 'student123' },
    { id: 'demo', password: 'demo' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Check if credentials are valid
      const isValid = validCredentials.some(
        cred => cred.id === studentId && cred.password === password
      );

      if (isValid) {
        // Store authentication status
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('studentId', studentId);
        
        // Update app authentication state
        setIsAuthenticated(true);
        navigate('/home');
      } else {
        setError('Invalid student ID or password. Try: demo/demo');
      }
      
      setIsLoading(false);
    }, 1000);
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