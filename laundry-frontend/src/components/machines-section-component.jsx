import React, { useState, useEffect } from 'react';
import MachineCard from './machine-card-component.jsx';

const MachinesSection = ({ machines, onReserve, selectedSlot, onSlotSelect }) => {
  const [updatedMachines, setUpdatedMachines] = useState(machines);

  useEffect(() => {
    // 更新机器状态的函数
    const updateMachineStatus = () => {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

      const updatedMachines = machines.map(machine => {
        const updatedTimeSlots = machine.timeSlots.map(slot => {
          // 将时间槽的时间转换为24小时制
          const [time, period] = slot.time.split(' ');
          let [hour, minute] = time.split(':');
          hour = parseInt(hour);
          if (period === 'PM' && hour !== 12) hour += 12;
          if (period === 'AM' && hour === 12) hour = 0;
          const slotTime = `${hour.toString().padStart(2, '0')}:${minute}`;

          // 如果当前时间超过了时间槽的时间，标记为不可用
          return {
            ...slot,
            available: slotTime > currentTimeString
          };
        });

        // 检查是否有任何可用的时间槽
        const hasAvailableSlot = updatedTimeSlots.some(slot => slot.available);

        return {
          ...machine,
          timeSlots: updatedTimeSlots,
          status: hasAvailableSlot ? 'available' : 'in-use'
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