import React, { useEffect, useMemo, useState } from 'react';
import { formatDate, getRelativeDate, todayLocalYMD } from '../utils/dateUtils';
import { api } from '../utils/api';

const ReservationModal = ({ isOpen, onClose, selectedMachine, selectedTime, onSubmit }) => {
  // Local form state (will be reset whenever modal opens)
  const [formData, setFormData] = useState({
    date: todayLocalYMD(),
    time: '',
    studentId: localStorage.getItem('studentId') || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Derived machine name (avoid optional chaining spew in JSX)
  const machineName = useMemo(() => selectedMachine?.name || '', [selectedMachine]);

  // Reset state every time the modal is opened or the preselected time/machine changes
  useEffect(() => {
    if (!isOpen) return;
    setShowConfirmation(false);
    setErrorMessage('');
    setIsSubmitting(false);
    setFormData({
      date: todayLocalYMD(),
      time: selectedTime || '',
      studentId: localStorage.getItem('studentId') || ''
    });
  }, [isOpen, selectedTime, selectedMachine?.id]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Unified close
  const close = () => {
    setShowConfirmation(false);
    setErrorMessage('');
    setIsSubmitting(false);
    onClose && onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.studentId) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    if (!selectedMachine?.id) {
      setErrorMessage('Machine is not selected');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await api.post('/api/reservations', {
        student_id: formData.studentId,
        machine_id: selectedMachine.id,
        date: formData.date,
        time: formData.time
      });

      // Persist student id for next time
      localStorage.setItem('studentId', formData.studentId);

      // Show success sheet; parent will be notified when user clicks "Great!"
      setShowConfirmation(true);
    } catch (error) {
      setErrorMessage(error.message || 'Network/Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    // Let parent refresh UI
    onSubmit &&
      onSubmit({
        ...formData,
        machineId: selectedMachine?.id,
        machineName
      });
    close();
  };

  if (!isOpen) return null;

  // Success view
  if (showConfirmation) {
    return (
      <div
        className="modal-overlay"
        style={{ zIndex: 1001 }}
        // Close only when clicking the overlay itself
        onMouseDown={(e) => e.target === e.currentTarget && handleConfirmationClose()}
      >
        <div className="modal-content confirmation-modal">
          <div className="confirmation-header">
            <div className="success-icon">✅</div>
            <h2 className="confirmation-title">Reservation Confirmed!</h2>
          </div>
          <div className="confirmation-body">
            <div className="confirmation-details">
              <p><strong>Machine:</strong> {machineName}</p>
              <p><strong>Date:</strong> {getRelativeDate(formData.date)} ({formatDate(formData.date)})</p>
              <p><strong>Time:</strong> {formData.time}</p>
              <p><strong>Student ID:</strong> {formData.studentId}</p>
            </div>
            <p className="confirmation-message">
              Your laundry slot has been successfully reserved. You will receive a confirmation email shortly.
            </p>
            <button onClick={handleConfirmationClose} className="confirmation-button">Great!</button>
          </div>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div
      className="modal-overlay"
      // Use currentTarget equality — the robust way to detect real backdrop clicks
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Reserve Washer-Dryer</h2>
          <button
            type="button"
            className="modal-close"
            aria-label="Close"
            // mousedown closes before other handlers can interfere
            onMouseDown={(e) => {
              e.stopPropagation();
              close();
            }}
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
                onClick={() => setErrorMessage('')}
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
              value={machineName}
              readOnly
              className="form-input form-input-readonly"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              min={todayLocalYMD()}
              onChange={handleInputChange}
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
