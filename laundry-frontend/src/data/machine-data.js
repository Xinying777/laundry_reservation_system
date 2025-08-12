// Sample machine data
export const machinesData = [
  {
    id: 1,
    name: 'Washer-Dryer #1',
    location: 'Dorm A, Ground Floor',
    nextAvailable: 'Now',
    status: 'available',
    timeSlots: [
      { time: '6:00 AM', available: true },
      { time: '8:00 AM', available: true },
      { time: '10:00 AM', available: true },
      { time: '12:00 PM', available: true },
      { time: '2:00 PM', available: true },
      { time: '4:00 PM', available: true },
      { time: '6:00 PM', available: true },
      { time: '8:00 PM', available: true }
    ]
  },
  {
    id: 2,
    name: 'Washer-Dryer #2',
    location: 'Dorm A, Ground Floor',
    nextAvailable: 'Now',
    status: 'available',
    timeSlots: [
      { time: '6:00 AM', available: true },
      { time: '8:00 AM', available: true },
      { time: '10:00 AM', available: true },
      { time: '12:00 PM', available: true },
      { time: '2:00 PM', available: true },
      { time: '4:00 PM', available: true },
      { time: '6:00 PM', available: true },
      { time: '8:00 PM', available: true }
    ]
  }
];

// machinesData is a washing machine simulation data set containing details of multiple washing machines.
// Each washing machine data includes: machine ID, name, location, next available time, current state, and availability array for time period.
