import React from 'react';
import TimeSlot from './time-slot-component.jsx';
// This component shows a card for each laundry machine with its details and available time slots

// - machine: object containing machine details
// - onReserve: function to call when reserve button is clicked
// - selectedSlot: currently selected time slot
// - onSlotSelect: function to handle slot selection

const MachineCard = ({ machine, onReserve, selectedSlot, onSlotSelect }) => {
  const getStatusClass = (status) => {
    return status === 'available' ? 'status-available' : 'status-in-use';
  };

  const getStatusStyle = (status) => {
    return {
      color: status === 'available' ? '#10B981' : '#EF4444',
      backgroundColor: status === 'available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '0.875rem',
      fontWeight: '500',
      border: `1px solid ${status === 'available' ? '#10B981' : '#EF4444'}`
    };
  };

  return (
    <div className="machine-card">
      {/* Card header with machine name and status */}
      <div className="machine-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 className="machine-name">{machine.name}</h3>
        </div>
     
         {/* Status badge changes color based on availability */}
        <span className={`machine-status ${getStatusClass(machine.status)}`}>
          {machine.status === 'available' ? 'Available' : 'In Use'}
        </span>
      </div>
      
      <div className="machine-card-body">
        <div className="machine-info">
          <p>
            <i className="fas fa-map-marker-alt"></i>
            Location: {machine.location}
          </p>
        </div>
        
        {/* Time slots availability section */}
        <div className="availability-section">
          <h5 className="availability-title">Today's Availability</h5>
           {/* Grid of available time slots */}
          <div className="time-slots-grid">
            {machine.timeSlots.map((slot, index) => (
              <TimeSlot
                key={index}
                time={slot.time}
                isAvailable={slot.available}
                isSelected={selectedSlot === `${machine.id}-${index}`}
                onClick={() => onSlotSelect(machine.id, index, slot.time)}
              />
            ))}
          </div>
        </div>
        
         {/* Reserve button - appears on all cards */}
        <button 
          onClick={() => onReserve(machine)}
          className="reserve-button"
        >
          Reserve Now
        </button>
      </div>
    </div>
  );
};

export default MachineCard;