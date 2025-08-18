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
      <Navigation>
        {/* Pass welcome info and logout button as children to Navigation */}
        <div className="welcome-container">
          {studentId && (
            <span className="welcome-text">
              Welcome, {studentId}
            </span>
          )}
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </Navigation>
      
      <div className="hero-content">
        <div className="wildcat-logo">
          <div className="wildcat-icon">N</div>
        </div>
        <h1 className="hero-title">
          <div className="brand-name-wrapper">
            <span className="brand-name">PurpleWash</span>
          </div>
          <div className="tagline">Northwestern Campus Laundry Hub</div>
        </h1>
        <p className="hero-subtitle">Simplify your campus life with easy laundry scheduling</p>
        <button 
          onClick={onViewMachines}
          className="hero-button"
        >
          View Machines
        </button>
      </div>
      <div className="campus-elements">
        <div className="campus-element arch-element"></div>
        <div className="campus-element library-element"></div>
      </div>
    </div>
  );
};

export default HeroSection;

