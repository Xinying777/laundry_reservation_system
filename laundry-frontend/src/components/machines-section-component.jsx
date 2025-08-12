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
          
          // 检查当前时间是否已经过了这个时间槽的开始时间
          const isPastSlotTime = currentHour > hour || (currentHour === hour);
          
          // 只有在工作时间外或时间已过的情况下，基于时间设置为不可用
          // 但要保留用户预约造成的不可用状态
          let timeBasedAvailable = true;
          if (!isWithinWorkingHours || isPastSlotTime) {
            timeBasedAvailable = false;
          }

          return {
            ...slot,
            // 如果slot已经因为预约而不可用，保持不可用
            // 如果slot可用但时间因素不允许，则设为不可用
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

    // 初始更新
    updateMachineStatus();

    // 每分钟更新一次
    const interval = setInterval(updateMachineStatus, 60000);

    // 清理函数
    return () => clearInterval(interval);
  }, [machines]);
  return (
    <div className="machines-section" id="machines">
      {/* Section header */}
      <h2 className="machines-title">Our Machines</h2>
      
       {/* Grid layout for all machine cards */}
      <div className="machines-grid">
        {updatedMachines.map((machine) => (
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
  );
};

export default MachinesSection;