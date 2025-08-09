import React from 'react';
// This component displays a single time slot for machine reservations
// Props:
// - time: string showing the time (e.g. "9:00 AM")
// - isAvailable: boolean whether slot is bookable
// - isSelected: boolean whether user selected this slot
// - onClick: function to call when slot is clicked

const TimeSlot = ({ time, isAvailable, isSelected, onClick }) => {
  // Determines which CSS class to apply based on slot status
  const getClassName = () => {
    let className = 'time-slot ';
    
    if (isSelected) {
      className += 'time-slot-selected';
    } else if (isAvailable) {
      className += 'time-slot-available';
    } else {
      className += 'time-slot-unavailable';
    }
    
    return className;
  };

  return (
    <div 
      className={getClassName()}
      onClick={isAvailable ? onClick : undefined} // Only allow clicks on available slots
    >
      {time} {/* Display the time text */}
    </div>
  );
};

export default TimeSlot;