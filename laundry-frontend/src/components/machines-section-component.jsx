import React, { useState, useEffect } from 'react';
import MachineCard from './machine-card-component.jsx';

const MachinesSection = ({ machines, onReserve, selectedSlot, onSlotSelect }) => {
  const [updatedMachines, setUpdatedMachines] = useState(machines);

  useEffect(() => {
    // Function to update machine status
    const updateMachineStatus = () => {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      
      const updatedMachines = machines.map(machine => {
        const updatedTimeSlots = machine.timeSlots.map(slot => {
          // Convert time slot time to 24-hour format
          const [time, period] = slot.time.split(' ');
          let [hour] = time.split(':');
          hour = parseInt(hour);
          if (period === 'PM' && hour !== 12) hour += 12;
          if (period === 'AM' && hour === 12) hour = 0;

          // Check if time slot is within working hours (6 AM - 10 PM)
          const isWithinWorkingHours = hour >= 6 && hour < 22;
          
          // Check if current time has passed this time slot's start time
          const isPastSlotTime = currentHour > hour || (currentHour === hour);
          
          // Only set as unavailable based on time when outside working hours or time has passed
          // But preserve unavailable status caused by user reservations
          let timeBasedAvailable = true;
          if (!isWithinWorkingHours || isPastSlotTime) {
            timeBasedAvailable = false;
          }

          return {
            ...slot,
            // If slot is already unavailable due to reservations, keep it unavailable
            // If slot is available but time factors don't allow, set as unavailable
            available: slot.available && timeBasedAvailable
          };
        });

        return {
          ...machine,
          timeSlots: updatedTimeSlots
        };
      });

      setUpdatedMachines(updatedMachines);
    };

    // Initial update
    updateMachineStatus();

    // Update every minute
    const interval = setInterval(updateMachineStatus, 60000);

    // Cleanup function
    return () => clearInterval(interval);
  }, [machines]);
  // Group machines by location
  const groupMachinesByLocation = () => {
    const groupedMachines = {};
    
    updatedMachines.forEach(machine => {
      if (!groupedMachines[machine.location]) {
        groupedMachines[machine.location] = [];
      }
      groupedMachines[machine.location].push(machine);
    });
    
    return groupedMachines;
  };
  
  const groupedMachines = groupMachinesByLocation();
  const locations = Object.keys(groupedMachines);
  
  return (
    <div className="machines-section" id="machines">
      {/* Section header */}
      <h2 className="machines-title">Our Machines</h2>
      
      {/* Display machines grouped by location */}
      {locations.map(location => (
        <div key={location} className="location-section">
          <h3 className="location-title">{location}</h3>
          <div className="machines-grid">
            {groupedMachines[location].map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onReserve={onReserve}
                selectedSlot={selectedSlot}
                onSlotSelect={onSlotSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MachinesSection;