// src/components/lost-and-found-component.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './navigation-component';
import './lost-and-found.css';
import { api } from '../utils/api';
import { todayLocalYMD } from '../utils/dateUtils';

/**
 * Lost & Found page
 * Backend:
 *   - List   : GET  /api/lostandfound/reports   -> returns an ARRAY
 *   - Create : POST /api/lostandfound/report
 */
function LostAndFound({ onLogout }) {
  const navigate = useNavigate();

  // Data states
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [locations, setLocations] = useState(['All Locations']);

  // New report form (default date = local today)
  const [newReport, setNewReport] = useState({
    item_name: '',
    description: '',
    location_found: '',
    date_found: todayLocalYMD(),
    // contact_info is optional; add here if your backend expects it
    // contact_info: ''
  });

  /** Format date to show only date part (YYYY-MM-DD) */
  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // If it's ISO format with time, extract date part
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString; // Return original if parsing fails
    }
  };

  /** Load reports on mount */
  useEffect(() => {
    fetchExistingReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Apply search & location filters whenever inputs/data change */
  useEffect(() => {
    const term = (searchTerm || '').toLowerCase();

    const filtered = (reports || []).filter((r) => {
      const name = (r?.item_name ?? '').toLowerCase();
      const desc = (r?.description ?? '').toLowerCase();
      const loc  = (r?.location_found ?? '');

      const matchesSearch = !term || name.includes(term) || desc.includes(term);
      const matchesLocation = locationFilter === 'All Locations' || loc === locationFilter;

      return matchesSearch && matchesLocation;
    });

    setFilteredReports(filtered);
  }, [searchTerm, locationFilter, reports]);

  /** Fetch list from the array-returning endpoint */
  const fetchExistingReports = async () => {
    setErrorMsg('');
    try {
      const data = await api.get('/api/lostandfound/reports');
      const list = Array.isArray(data) ? data : [];

      setReports(list);
      setFilteredReports(list);

      const uniqueLocations = [
        'All Locations',
        ...new Set(list.map(i => i?.location_found).filter(Boolean))
      ];
      setLocations(uniqueLocations);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setErrorMsg(err.message || 'Failed to load lost-and-found items');
    }
  };

  /** Form handlers */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReport((prev) => ({ ...prev, [name]: value }));
  };
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleLocationFilterChange = (e) => setLocationFilter(e.target.value);

  /** Submit new report */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { item_name, description, location_found } = newReport;
    if (!item_name || !description || !location_found) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/lostandfound/report', newReport);

      // Reset form to defaults
      setNewReport({
        item_name: '',
        description: '',
        location_found: '',
        date_found: todayLocalYMD(),
        // contact_info: ''
      });

      await fetchExistingReports();
      alert('Report submitted successfully!');
    } catch (err) {
      console.error('Error submitting report:', err);
      setErrorMsg(err.message || 'Failed to submit the report');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Logout */
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
    <div className="lost-and-found-container">
      {/* Header banner & navigation */}
      <div className="hero-section">
        <Navigation>
          <div className="welcome-container">
            {studentId && <span className="welcome-text">Welcome, {studentId}</span>}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </Navigation>

        <div className="hero-content" style={{ marginTop: '20px' }}>
          <div className="wildcat-logo"><div className="wildcat-icon">N</div></div>
          <h1 className="hero-title">
            <div className="brand-name-wrapper"><span className="brand-name">PurpleWash</span></div>
            <div className="tagline">Campus Community Center</div>
          </h1>
          <p className="hero-subtitle">Report and recover lost items on campus</p>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '40px 20px',
        marginTop: '80px'
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
          {/* Form */}
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--nu-purple)',
            marginBottom: '1.5rem',
            borderBottom: '2px solid var(--nu-purple-30)',
            paddingBottom: '0.75rem'
          }}>
            Report a Lost Item
          </h2>

          {errorMsg && (
            <div className="error-message" style={{ marginBottom: 12 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                name="item_name"
                value={newReport.item_name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="What did you find?"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={newReport.description}
                onChange={handleInputChange}
                className="form-input form-textarea"
                placeholder="Color, brand, distinctive features..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location Found *</label>
              <select
                name="location_found"
                value={newReport.location_found}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={isSubmitting}
              >
                <option value="">Select a location</option>
                <option value="Basement">Basement</option>
                <option value="Dorm A">Dorm A</option>
                <option value="Dorm B">Dorm B</option>
                <option value="Community Center">Community Center</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date Found</label>
              <input
                type="date"
                name="date_found"
                value={newReport.date_found}
                onChange={handleInputChange}
                className="form-input"
                max={todayLocalYMD()}
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>

          {/* Search and Filter Section */}
          <div style={{ marginTop: 32 }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--nu-purple)',
              marginBottom: '1rem',
              borderBottom: '2px solid var(--nu-purple-30)',
              paddingBottom: '0.75rem'
            }}>
              Lost & Found Items
            </h2>
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Search by item name or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="form-input"
                style={{ flex: 2 }}
              />
              <select
                value={locationFilter}
                onChange={handleLocationFilterChange}
                className="form-input"
                style={{ flex: 1 }}
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reports table */}
          <div style={{ marginTop: 16 }}>
            {filteredReports.length === 0 ? (
              <p style={{ color: '#666' }}>No reports found.</p>
            ) : (
              <div className="reports-table-container">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Location</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((r, idx) => (
                      <tr key={r._id ?? idx}>
                        <td>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                            {r.item_name}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {r.description}
                          </div>
                        </td>
                        <td>{r.location_found || 'Unknown location'}</td>
                        <td>{formatDateOnly(r.date_found)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LostAndFound;
