import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="navigation-bar">
      <button 
        className={`nav-button ${location.pathname === '/home' ? 'nav-button-active' : ''}`}
        onClick={() => navigate('/home')}
      >
        Homepage
      </button>
      <button 
        className={`nav-button ${location.pathname === '/lostandfound' ? 'nav-button-active' : ''}`}
        onClick={() => navigate('/lostandfound')}
      >
        Lost & Found
      </button>
    </div>
  );
};

export default Navigation;
