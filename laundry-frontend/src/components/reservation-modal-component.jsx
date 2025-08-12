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

  // When form is submitted - call the actual API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.studentId) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting reservation:', {
        student_id: formData.studentId,
        machine_id: selectedMachine.id,
        date: formData.date,
        time: formData.time
      });

      const response = await fetch('http://localhost:3000/api/reservations', {
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
        setShowConfirmation(true);
        // Call parent component's onSubmit to update UI
        onSubmit({
          ...formData,
          machineId: selectedMachine.id,
          machineName: selectedMachine.name
        });
        // Save student ID to localStorage for next time
        localStorage.setItem('studentId', formData.studentId);
      } else {
        alert(result.message || 'Reservation failed. Please try again.');
      }
    } catch (error) {
      console.error('Error making reservation:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
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
    setShowConfirmation(false);
    setIsSubmitting(false); // Ensure submission state is reset
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      time: '', 
      studentId: localStorage.getItem('studentId') || ''
    });
    onClose(); // Close entire modal
  };

  // Update form when selectedTime changes
  React.useEffect(() => {
    if (selectedTime) {
      setFormData(prev => ({ ...prev, time: selectedTime }));
    }
  }, [selectedTime]);

  if (!isOpen) return null;

  // Show confirmation popup after successful reservation
  if (showConfirmation) {
    return (
      <div className="modal-overlay">
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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Reserve Washer-Dryer</h2>
          <button 
            onClick={onClose}
            className="modal-close"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`confirm-button ${isSubmitting ? 'submitting' : ''}`}
          >
            {isSubmitting ? 'Reserving...' : 'Confirm Reservation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;