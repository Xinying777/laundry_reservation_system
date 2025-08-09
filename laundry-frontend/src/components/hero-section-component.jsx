import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './navigation-component';

const HeroSection = ({ onViewMachines, onLogout }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback if onLogout is not provided
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('studentId');
    }
    navigate('/login');
  };

  const studentId = localStorage.getItem('studentId');

  return (
    <div className="hero-section">
      <div className="hero-overlay"></div>
      <Navigation />
      <div className="hero-content">
        {/* Logout button and welcome message */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px' 
        }}>
          {studentId && (
            <span style={{ color: 'white', fontSize: '0.9rem' }}>
              Welcome, {studentId}
            </span>
          )}
          <button 
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid white',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Logout
          </button>
        </div>
        
        <h1 className="hero-title">Northwestern Campus Laundry Hub</h1>
        <p className="hero-subtitle">Reserve your washer-dryer in advance for a stress-free laundry day</p>
        <button 
          onClick={onViewMachines}
          className="hero-button"
        >
          View Machines
        </button>
      </div>
    </div>
  );
};

export default HeroSection;

