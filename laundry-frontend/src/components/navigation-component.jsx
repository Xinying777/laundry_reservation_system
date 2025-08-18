import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="navigation-bar">
      <div className="nav-links">
        <button 
          className={`nav-button ${location.pathname === '/home' ? 'nav-button-active' : ''}`}
          onClick={() => navigate('/home')}
          aria-label="Go to Homepage"
        >
          <span className="nav-icon">N</span>
          Homepage
        </button>
        <button 
          className={`nav-button ${location.pathname === '/lostandfound' ? 'nav-button-active' : ''}`}
          onClick={() => navigate('/lostandfound')}
          aria-label="Go to Lost & Found"
        >
          <span className="nav-icon">N</span>
          Lost & Found
        </button>
        <button 
          className={`nav-button ${location.pathname === '/faq' ? 'nav-button-active' : ''}`}
          onClick={() => navigate('/faq')}
          aria-label="Go to FAQ"
        >
          <span className="nav-icon">N</span>
          WildHelp
        </button>
      </div>
      
      {/* Render received child elements here */}
      {children}
    </div>
  );
};

export default Navigation;
