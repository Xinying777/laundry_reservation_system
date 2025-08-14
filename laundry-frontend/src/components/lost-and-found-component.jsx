import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './navigation-component';

const LostAndFound = ({ onLogout }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for the new report being typed
  const [newReport, setNewReport] = useState({
    item_name: '',
    description: '',
    location_found: '',
    date_found: new Date().toISOString().split('T')[0] // Default to today
  });

  // Load existing reports when page loads
  useEffect(() => {
    console.log('🚀 Lost and Found component mounted, fetching initial reports...');
    fetchExistingReports();
  }, []);

  // Function to fetch existing reports
  const fetchExistingReports = async () => {
    try {
      console.log('🔄 Fetching reports...');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/lostandfound/reports`);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Fetched reports:', data.length, 'reports');
        console.log('📋 First report:', data[0]);
        setReports(data);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };  // Handles changes in the form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReport.item_name || !newReport.description || !newReport.location_found) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/lostandfound/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport)
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const data = await response.json();
      console.log('✅ Report submitted successfully:', data);

      // Reset form
      setNewReport({
        item_name: '',
        description: '',
        location_found: '',
        date_found: new Date().toISOString().split('T')[0]
      });

      // Refresh the reports list to include the new report
      console.log('🔄 Refreshing reports list...');
      await fetchExistingReports();
      console.log('✅ Reports list refreshed');

      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout function
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('studentId');
    }
    navigate('/login');
  };

  const studentId = localStorage.getItem('studentId');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top blue banner, consistent with main interface */}
      <div className="hero-section">
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
          
          <h1 className="hero-title">Lost & Found</h1>
          <p className="hero-subtitle">Found something? Let others know!</p>
        </div>
      </div>

      {/* Content centered, unified style */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'center', 
        backgroundColor: '#f5f5f5', 
        padding: '40px 20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '30px',
          margin: '0 auto'
        }}>
          {/* Submission form */}
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '1rem',
                fontWeight: '500',
                color: '#1f2937'
              }}>Item Name *</label>
              <input
                type="text"
                name="item_name"
                value={newReport.item_name}
                onChange={handleInputChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '1rem',
                  width: '100%',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  ':focus': {
                    borderColor: '#2563eb',
                    boxShadow: '0 0 0 2px rgba(37,99,235,0.2)'
                  }
                }}
                placeholder="What did you find?"
                required
                disabled={isSubmitting}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '1rem',
                fontWeight: '500',
                color: '#1f2937'
              }}>Description *</label>
              <textarea
                name="description"
                value={newReport.description}
                onChange={handleInputChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '1rem',
                  width: '100%',
                  minHeight: '120px',
                  resize: 'vertical',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  ':focus': {
                    borderColor: '#2563eb',
                    boxShadow: '0 0 0 2px rgba(37,99,235,0.2)'
                  }
                }}
                placeholder="Provide details about the item..."
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '1rem',
                fontWeight: '500',
                color: '#1f2937'
              }}>Location Found *</label>
              <input
                type="text"
                name="location_found"
                value={newReport.location_found}
                onChange={handleInputChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '1rem',
                  width: '100%',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  ':focus': {
                    borderColor: '#2563eb',
                    boxShadow: '0 0 0 2px rgba(37,99,235,0.2)'
                  }
                }}
                placeholder="Where did you find it?"
                required
                disabled={isSubmitting}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '1rem',
                fontWeight: '500',
                color: '#1f2937'
              }}>Date Found</label>
              <input
                type="date"
                name="date_found"
                value={newReport.date_found}
                onChange={handleInputChange}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '1rem',
                  width: '100%',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  ':focus': {
                    borderColor: '#2563eb',
                    boxShadow: '0 0 0 2px rgba(37,99,235,0.2)'
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                disabled={isSubmitting}
              />
            </div>
            
            <button 
              type="submit" 
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isSubmitting ? 0.7 : 1,
                ':hover': {
                  backgroundColor: '#1d4ed8'
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Add Report'}
            </button>
          </form>
          
          {/* List of existing reports */}
          <div style={{
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '20px'
            }}>Recent Reports</h2>
            
            {reports.length > 0 ? (
              reports.map((report) => (
                <div 
                  key={report._id || report.id} 
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>{report.item_name}</span>
                    <span style={{
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      {new Date(report.date || report.date_found).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '1rem',
                    color: '#1f2937',
                    marginBottom: '12px',
                    lineHeight: '1.5'
                  }}>{report.description}</p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}>
                    <strong>Location:</strong> {report.location_found}
                  </p>
                </div>
              ))
            ) : (
              <p style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '1rem',
                padding: '40px 0'
              }}>No lost items reported yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostAndFound;