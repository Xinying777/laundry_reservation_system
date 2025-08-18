import React, { useState } from 'react';
import Navigation from './navigation-component';

const FAQComponent = () => {
  // State to track which FAQ section is expanded
  const [expandedSection, setExpandedSection] = useState('getting-started');
  // State to track which questions are expanded
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Toggle a section's expanded state
  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Toggle a question's expanded state
  const toggleQuestion = (questionId) => {
    setExpandedQuestions({
      ...expandedQuestions,
      [questionId]: !expandedQuestions[questionId]
    });
  };

  return (
    <div className="faq-page">
      <Navigation>
        <div className="logout-container">
          <span className="welcome-message">Welcome to WildcatWash!</span>
          <button className="logout-button" onClick={() => window.location.href = '/'}>
            Logout
          </button>
        </div>
      </Navigation>

      <div className="faq-hero">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about the WildcatWash laundry reservation system</p>
      </div>

      <div className="faq-container">
        {/* FAQ Section Navigation */}
        <div className="faq-nav">
          <button 
            className={`faq-nav-button ${expandedSection === 'getting-started' ? 'active' : ''}`}
            onClick={() => toggleSection('getting-started')}
          >
            <span className="nav-icon">N</span>
            Getting Started
          </button>
          <button 
            className={`faq-nav-button ${expandedSection === 'booking' ? 'active' : ''}`}
            onClick={() => toggleSection('booking')}
          >
            <span className="nav-icon">N</span>
            Booking & Reservations
          </button>
          <button 
            className={`faq-nav-button ${expandedSection === 'issues' ? 'active' : ''}`}
            onClick={() => toggleSection('issues')}
          >
            <span className="nav-icon">N</span>
            Machine Issues & Problems
          </button>
        </div>

        {/* FAQ Content */}
        <div className="faq-content">
          {/* Getting Started Section */}
          <div className={`faq-section ${expandedSection === 'getting-started' ? 'active' : ''}`}>
            <div className="faq-section-header">
              <h2>🏠 Getting Started</h2>
            </div>
            <div className="faq-questions">
              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q1'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q1')}
                >
                  <h3>How do I create an account?</h3>
                  <span className="faq-toggle">{expandedQuestions['q1'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q1'] && (
                  <div className="faq-answer">
                    <p>Click "Sign Up" on the homepage, enter your Northwestern email address, create a password, and verify your email. Only @northwestern.edu emails are accepted.</p>
                  </div>
                )}
              </div>

              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q2'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q2')}
                >
                  <h3>How do I log in to the system?</h3>
                  <span className="faq-toggle">{expandedQuestions['q2'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q2'] && (
                  <div className="faq-answer">
                    <p>Simply use your Northwestern student ID and password on the login page to access the laundry reservation system.</p>
                  </div>
                )}
              </div>

              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q3'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q3')}
                >
                  <h3>Do I need to download an app?</h3>
                  <span className="faq-toggle">{expandedQuestions['q3'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q3'] && (
                  <div className="faq-answer">
                    <p>No! WildcatWash works directly in your web browser on any device - phone, tablet, or computer.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking & Reservations Section */}
          <div className={`faq-section ${expandedSection === 'booking' ? 'active' : ''}`}>
            <div className="faq-section-header">
              <h2>📅 Booking & Reservations</h2>
            </div>
            <div className="faq-questions">
              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q4'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q4')}
                >
                  <h3>How do I reserve a machine?</h3>
                  <span className="faq-toggle">{expandedQuestions['q4'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q4'] && (
                  <div className="faq-answer">
                    <p>Browse available machines, select your preferred time slot, and click "Reserve Now" to book the machine.</p>
                  </div>
                )}
              </div>

              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q5'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q5')}
                >
                  <h3>What do the different machine statuses mean?</h3>
                  <span className="faq-toggle">{expandedQuestions['q5'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q5'] && (
                  <div className="faq-answer">
                    <p>Machine status indicators show if a machine is "Available" (green), "In Use" (red), or temporarily unavailable for other reasons.</p>
                  </div>
                )}
              </div>

              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q6'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q6')}
                >
                  <h3>Where can I find machines in my dorm?</h3>
                  <span className="faq-toggle">{expandedQuestions['q6'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q6'] && (
                  <div className="faq-answer">
                    <p>Machines are organized by location. Browse through sections like "Basement", "Dorm A", "Dorm B", and "Community Center" to find machines near you.</p>
                  </div>
                )}
              </div>

              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q7'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q7')}
                >
                  <h3>When are the time slots available?</h3>
                  <span className="faq-toggle">{expandedQuestions['q7'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q7'] && (
                  <div className="faq-answer">
                    <p>Time slots are available from 6:00 AM to 8:00 PM daily, in two-hour blocks. Each machine shows its available time slots for the current day.</p>
                  </div>
                )}
              </div>

              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q8'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q8')}
                >
                  <h3>How do I access the "Lost and Found" section?</h3>
                  <span className="faq-toggle">{expandedQuestions['q8'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q8'] && (
                  <div className="faq-answer">
                    <p>Click on the "Lost & Found" option in the navigation bar to report lost items or check if someone has found your belongings.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Machine Issues & Problems Section */}
          <div className={`faq-section ${expandedSection === 'issues' ? 'active' : ''}`}>
            <div className="faq-section-header">
              <h2>🔧 Machine Issues & Problems</h2>
            </div>
            <div className="faq-questions">
              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q9'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q9')}
                >
                  <h3>How do I report a problem with a machine?</h3>
                  <span className="faq-toggle">{expandedQuestions['q9'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q9'] && (
                  <div className="faq-answer">
                    <p>If you encounter an issue with a machine, you can report it in the Lost & Found section or contact the dorm administration.</p>
                  </div>
                )}
              </div>

              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q10'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q10')}
                >
                  <h3>What should I do if I find someone else's belongings?</h3>
                  <span className="faq-toggle">{expandedQuestions['q10'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q10'] && (
                  <div className="faq-answer">
                    <p>You can report found items in the Lost & Found section by providing details about what you found and where you found it.</p>
                  </div>
                )}
              </div>

              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q11'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q11')}
                >
                  <h3>What information should I include when reporting lost items?</h3>
                  <span className="faq-toggle">{expandedQuestions['q11'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q11'] && (
                  <div className="faq-answer">
                    <p>When reporting lost items, include a detailed description, the date and location where you last saw the item, and your contact information.</p>
                  </div>
                )}
              </div>

              <div className="faq-item">
                <div 
                  className={`faq-question ${expandedQuestions['q12'] ? 'expanded' : ''}`}
                  onClick={() => toggleQuestion('q12')}
                >
                  <h3>How long are lost items kept before being discarded?</h3>
                  <span className="faq-toggle">{expandedQuestions['q12'] ? '−' : '+'}</span>
                </div>
                {expandedQuestions['q12'] && (
                  <div className="faq-answer">
                    <p>Lost items are typically kept for 30 days. After that, unclaimed items may be donated or disposed of according to Northwestern University policy.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Northwestern campus decoration at the bottom */}
      <div className="nu-campus-decoration">
        <div className="campus-icon arch"></div>
        <div className="campus-icon university-hall"></div>
        <div className="campus-icon tech-institute"></div>
      </div>
    </div>
  );
};

export default FAQComponent;
