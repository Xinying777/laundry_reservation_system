import React, { useState } from 'react';
import { formatDate, getRelativeDate } from '../utils/dateUtils';
// This is the popup modal for making laundry reservations

// - isOpen: boolean to control if modal is visible
// - onClose: function to close the modal
// - selectedMachine: which machine is being reserved
// - selectedTime: pre-selected time slot (from clicking on a time slot)
// - onSubmit: function to handle reservation submission

const ReservationModal = ({ isOpen, onClose, selectedMachine, selectedTime, onSubmit }) => {
  // Form state - tracks date, time, and student ID
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Default to today
    time: selectedTime || '', // Use pre-selected time if available
    studentId: localStorage.getItem('studentId') || '' // Get from localStorage
  });

  // State for API call
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // When form is submitted - call the actual API
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submitted with data:', formData);
    
    if (!formData.date || !formData.time || !formData.studentId) {
      console.log('❌ Validation failed - missing fields:', {
        date: formData.date,
        time: formData.time,
        studentId: formData.studentId
      });
      alert('Please fill in all fields');
      return;
    }

    console.log('✅ Validation passed, starting submission...');
    setIsSubmitting(true);

    try {
      console.log('Submitting reservation:', {
        student_id: formData.studentId,
        machine_id: selectedMachine.id,
        date: formData.date,
        time: formData.time
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: formData.studentId,
          machine_id: selectedMachine.id,
          date: formData.date,
          time: formData.time
        }),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (result.success) {
        // Show confirmation popup
        console.log('✅ Reservation successful, showing confirmation modal...');
        console.log('🔄 Setting showConfirmation to true...');
        setShowConfirmation(true);
        console.log('🔄 showConfirmation state should now be true');
        
        // Save student ID to localStorage for next time
        localStorage.setItem('studentId', formData.studentId);
        
        // Store reservation data for later use
        window.reservationData = {
          ...formData,
          machineId: selectedMachine.id,
          machineName: selectedMachine.name
        };
        
        // DON'T call parent onSubmit immediately - let confirmation modal show first
        console.log('🎯 Delaying parent onSubmit call to show confirmation first');
      } else {
        console.log('❌ API returned error:', result);
        // Use modal error instead of alert
        setErrorMessage(result.message || 'Database error. Please try again.');
        // Still allow closing the modal even on error
      }
    } catch (error) {
      console.error('❌ Network error making reservation:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      console.log('🔄 Resetting submission state...');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle confirmation popup close
  const handleConfirmationClose = () => {
    console.log('🔄 Closing confirmation modal and resetting form...');
    setShowConfirmation(false);
    setIsSubmitting(false); // Ensure submission state is reset
    
    // NOW call parent component's onSubmit to update UI
    if (window.reservationData) {
      console.log('🎯 Now calling parent onSubmit with stored data...');
      onSubmit(window.reservationData);
      delete window.reservationData; // Clean up
      console.log('🎯 Parent onSubmit call completed');
    }
    
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      time: '', 
      studentId: localStorage.getItem('studentId') || ''
    });
    onClose(); // Close entire modal
  };

  // Test function to trigger confirmation modal manually
  const testConfirmationModal = () => {
    console.log('🧪 Testing confirmation modal display...');
    // Store test data
    window.reservationData = {
      date: '2025-08-20',
      time: '6:00 AM',
      studentId: 'demo',
      machineId: selectedMachine?.id || 1,
      machineName: selectedMachine?.name || 'Test Machine'
    };
    setShowConfirmation(true);
  };

  // Add test function to window for manual testing
  React.useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      window.testConfirmationModal = testConfirmationModal;
      console.log('🧪 Test function available: window.testConfirmationModal()');
    }
  }, [isOpen]);

  // Update form when selectedTime changes
  React.useEffect(() => {
    if (selectedTime) {
      setFormData(prev => ({ ...prev, time: selectedTime }));
    }
  }, [selectedTime]);

  // Enhanced close handler to properly reset all states
  const handleModalClose = () => {
    setShowConfirmation(false);
    setIsSubmitting(false);
    setErrorMessage("");
    
    // Call the parent component's onClose function
    onClose();
  };
  
  // Reset confirmation state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
      setIsSubmitting(false);
      setErrorMessage("");
    }
  }, [isOpen]);

  // Monitor showConfirmation state changes
  React.useEffect(() => {
    console.log('🔄 showConfirmation state changed to:', showConfirmation);
  }, [showConfirmation]);
  
  // Add ESC key listener to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        handleModalClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  if (!isOpen) return null;

  console.log('🔍 Modal render state:', { isOpen, showConfirmation, selectedMachine: selectedMachine?.name, isSubmitting });
  
  // Handle click on overlay to close
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      handleModalClose();
    }
  };

  // Show confirmation popup after successful reservation
  if (showConfirmation) {
    console.log('🎉 Rendering confirmation modal with data:', { selectedMachine, formData });
    return (
      <div className="modal-overlay" style={{ zIndex: 1001 }} onClick={handleOverlayClick}>
        <div className="modal-content confirmation-modal">
          <div className="confirmation-header">
            <div className="success-icon">✅</div>
            <h2 className="confirmation-title">Reservation Confirmed!</h2>
          </div>
          
          <div className="confirmation-body">
            <div className="confirmation-details">
              <p><strong>Machine:</strong> {selectedMachine?.name}</p>
              <p><strong>Date:</strong> {getRelativeDate(formData.date)} ({formatDate(formData.date)})</p>
              <p><strong>Time:</strong> {formData.time}</p>
              <p><strong>Student ID:</strong> {formData.studentId}</p>
            </div>
            <p className="confirmation-message">
              Your laundry slot has been successfully reserved. You will receive a confirmation email shortly.
            </p>
            <button 
              onClick={handleConfirmationClose}
              className="confirmation-button"
            >
              Great!
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('📝 Rendering reservation form');
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Reserve Washer-Dryer</h2>
          <button 
            onClick={handleModalClose}
            className="modal-close"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {errorMessage && (
            <div className="error-message">
              <p>{errorMessage}</p>
              <button 
                type="button" 
                onClick={() => setErrorMessage("")}
                className="error-dismiss"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Machine</label>
            <input 
              type="text" 
              value={selectedMachine?.name || ''} 
              readOnly
              className="form-input form-input-readonly"
            />
          </div>
          
           {/* Date picker - defaults to today */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Time Slot</label>
            <select 
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="form-select"
            >
              {/* Time slot selection */}
              <option value="">Select a time</option>
              <option value="6:00 AM">6:00 AM - 8:00 AM</option>
              <option value="8:00 AM">8:00 AM - 10:00 AM</option>
              <option value="10:00 AM">10:00 AM - 12:00 PM</option>
              <option value="12:00 PM">12:00 PM - 2:00 PM</option>
              <option value="2:00 PM">2:00 PM - 4:00 PM</option>
              <option value="4:00 PM">4:00 PM - 6:00 PM</option>
              <option value="6:00 PM">6:00 PM - 8:00 PM</option>
              <option value="8:00 PM">8:00 PM - 10:00 PM</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input 
              type="text" 
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`confirm-button ${isSubmitting ? 'submitting' : ''}`}
          >
            {isSubmitting ? 'Reserving...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;