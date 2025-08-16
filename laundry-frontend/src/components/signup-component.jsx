import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.student_id || !formData.password || !formData.name || !formData.email) {
      setError('Student ID, password, name, and email are required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: formData.student_id,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Show success modal
        setShowSuccessModal(true);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  return (
    <div>
      {/* Top blue banner */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Northwestern Campus Laundry Hub</h1>
          <p className="hero-subtitle">Create your student account</p>
        </div>
      </div>

      {/* Signup form */}
      <div className="login-container">
        <h2>Student Registration</h2>
        
        {error && <p className="error-text">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="student_id">Student ID *</label>
          <input
            type="text"
            id="student_id"
            name="student_id"
            value={formData.student_id}
            onChange={handleInputChange}
            placeholder="Enter your student ID"
            required
            disabled={isLoading}
          />

          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            disabled={isLoading}
          />

          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            required
            disabled={isLoading}
          />

          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number (optional)"
            disabled={isLoading}
          />

          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a password"
            required
            disabled={isLoading}
          />

          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
            disabled={isLoading}
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        {/* Back to login link */}
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center'
        }}>
          <span style={{ color: '#666' }}>Already have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 'inherit'
            }}
          >
            Log in here
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '3rem',
              color: '#4E2A84', // Northwestern purple
              marginBottom: '20px'
            }}>
              ✅
            </div>
            <h3 style={{
              color: '#4E2A84', // Northwestern purple
              marginBottom: '15px'
            }}>
              Registration Successful!
            </h3>
            <p style={{
              color: '#666',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              Your account has been created successfully. You can now log in with your Northwestern student ID and password.
            </p>
            <button
              onClick={handleSuccessModalClose}
              style={{
                backgroundColor: '#4E2A84', // Northwestern purple
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1rem',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#401F68'} // Darker purple on hover
              onMouseOut={(e) => e.target.style.backgroundColor = '#4E2A84'} // Return to normal
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
