// Sample machine data
export const machinesData = [
  {
    id: 1,
    name: 'Washer-Dryer #1',
    location: 'Dorm A, Ground Floor',
    nextAvailable: 'Now',
    status: 'available',
    timeSlots: [
      { time: '9:00 AM', available: true },
      { time: '11:00 AM', available: true },
      { time: '1:00 PM', available: false },
      { time: '3:00 PM', available: true },
      { time: '5:00 PM', available: true },
      { time: '7:00 PM', available: false }
    ]
  },
  {
    id: 2,
    name: 'Washer-Dryer #2',
    location: 'Dorm A, Ground Floor',
    nextAvailable: '2:30 PM',
    status: 'in-use',
    timeSlots: [
      { time: '9:00 AM', available: false },
      { time: '11:00 AM', available: false },
      { time: '1:00 PM', available: true },
      { time: '3:00 PM', available: true },
      { time: '5:00 PM', available: true },
      { time: '7:00 PM', available: true }
    ]
  }
];

// machinesData is a washing machine simulation data set containing details of multiple washing machines.
// Each washing machine data includes: machine ID, name, location, next available time, current state, and availability array for time period.