import React from 'react';
import TimeSlot from './time-slot-component.jsx';
// This component shows a card for each laundry machine with its details and available time slots

// - machine: object containing machine details
// - onReserve: function to call when reserve button is clicked
// - selectedSlot: currently selected time slot
// - onSlotSelect: function to handle slot selection

const MachineCard = ({ machine, onReserve, selectedSlot, onSlotSelect }) => {
  // Determine machine status based on available time slots and current time
  const getMachineStatus = () => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    // Check if any time slots are available
    const hasAvailableSlots = machine.timeSlots.some(slot => slot.available);
    
    // Check if current time is within working hours (6 AM to 10 PM)
    const isWithinWorkingHours = currentHour >= 6 && currentHour < 22;
    
    if (!isWithinWorkingHours) {
      return 'closed';
    } else if (hasAvailableSlots) {
      return 'available';
    } else {
      return 'in-use';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'in-use':
        return 'status-in-use';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-available';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'in-use':
        return 'In Use';
      case 'closed':
        return 'Closed';
      default:
        return 'Available';
    }
  };

  const getStatusStyle = (status) => {
    const colors = {
      available: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981' },
      'in-use': { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444' },
      closed: { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)', border: '#6B7280' }
    };
    
    const colorScheme = colors[status] || colors.available;
    
    return {
      color: colorScheme.color,
      backgroundColor: colorScheme.bg,
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '0.875rem',
      fontWeight: '500',
      border: `1px solid ${colorScheme.border}`
    };
  };

  const currentStatus = getMachineStatus();

  return (
    <div className="machine-card">
      {/* Card header with machine name and status */}
      <div className="machine-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 className="machine-name">{machine.name}</h3>
        </div>
     
         {/* Status badge changes color based on availability */}
        <span 
          className={`machine-status ${getStatusClass(currentStatus)}`}
          style={getStatusStyle(currentStatus)}
        >
          {getStatusText(currentStatus)}
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
            {machine.timeSlots.map((slot, index) => {
              console.log(`🎨 Machine ${machine.id} time slot ${slot.time}: available=${slot.available}`);
              return (
                <TimeSlot
                  key={index}
                  time={slot.time}
                  isAvailable={slot.available}
                  isSelected={selectedSlot === `${machine.id}-${index}`}
                  onClick={() => onSlotSelect(machine.id, index, slot.time)}
                />
              );
            })}
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