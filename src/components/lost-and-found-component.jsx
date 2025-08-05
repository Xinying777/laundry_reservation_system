import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './navigation-component';

// This component handles lost & found reports for laundry machines
// Shows a form to submit reports and displays existing ones

const LostAndFound = ({ onLogout }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  
  // Logout function
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
  // State for the new comment being typed
  const [newComment, setNewComment] = useState({
    machine: '',
    comment: ''
  });

  // Handles changes in the form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComment({
      ...newComment, // Keep existing values
      [name]: value // Update the changed field
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.machine || !newComment.comment) {
      alert('Please select a machine and enter your comment');
      return;
    }

    setComments([...comments, {
      ...newComment,
      id: Date.now(),
      date: new Date().toLocaleString()
    }]);

    // Reset form after submission
    setNewComment({
      machine: '',
      comment: ''
    });
  };

  return (
    <div>
      {/* 顶部蓝色横幅，与主界面一致 */}
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
          <p className="hero-subtitle">Found something in a washer or dryer? Let us know!</p>
        </div>
      </div>

      {/* 内容居中，风格统一 */}
      <div className="lost-and-found-section">
        {/* Submission form */}
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="form-group">
            <label className="form-label">Machine</label>
            <select
              name="machine"
              value={newComment.machine}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select a machine</option>
              <option value="Washer-Dryer #1">Washer-Dryer #1</option>
              <option value="Washer-Dryer #2">Washer-Dryer #2</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Comment</label>
            <textarea
              name="comment"
              value={newComment.comment}
              onChange={handleInputChange}
              className="form-input"
              rows="3"
              placeholder="Describe what you found..."
            ></textarea>
          </div>

          <button type="submit" className="submit-button">
            Add Report
          </button>
        </form>

        {/* List of existing reports */}
        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <span className="machine-badge">{comment.machine}</span>
                  <span className="comment-date">{comment.date}</span>
                </div>
                <p className="comment-text">{comment.comment}</p>
              </div>
            ))
          ) : (
            <p className="no-comments">No lost items reported yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LostAndFound;