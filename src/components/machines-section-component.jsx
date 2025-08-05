import React from 'react';
import MachineCard from './machine-card-component.jsx';
// This component displays all laundry machines in a grid layout

const MachinesSection = ({ machines, onReserve, selectedSlot, onSlotSelect }) => {
  return (
    <div className="machines-section" id="machines">
      {/* Section header */}
      <h2 className="machines-title">Our Machines</h2>
      
       {/* Grid layout for all machine cards */}
      <div className="machines-grid">
        {machines.map((machine) => (
          <MachineCard
            key={machine.id} // Unique key for React's rendering
            machine={machine} // Pass all machine data
            onReserve={onReserve} // Reservation handler
            selectedSlot={selectedSlot} // Currently selected slot
            onSlotSelect={onSlotSelect} // Slot selection handler
          />
        ))}
      </div>
    </div>
  );
};

export default MachinesSection;