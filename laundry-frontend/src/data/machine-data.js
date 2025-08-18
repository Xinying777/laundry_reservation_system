// Sample machine data
export const machinesData = [
  // Basement Machines
  {
    id: 1,
    name: 'Washer-Dryer #1',
    location: 'Basement',
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
    location: 'Basement',
    nextAvailable: 'Now',
    status: 'available',
    timeSlots: [
      { time: '6:00 AM', available: false },
      { time: '8:00 AM', available: true },
      { time: '10:00 AM', available: true },
      { time: '12:00 PM', available: true },
      { time: '2:00 PM', available: true },
      { time: '4:00 PM', available: true },
      { time: '6:00 PM', available: true },
      { time: '8:00 PM', available: true }
    ]
  },
  // Dorm A Machines
  {
    id: 3,
    name: 'Washer-Dryer #3',
    location: 'Dorm A',
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
    id: 4,
    name: 'Washer-Dryer #4',
    location: 'Dorm A',
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
  // Dorm B Machines
  {
    id: 5,
    name: 'Washer-Dryer #5',
    location: 'Dorm B',
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
    id: 6,
    name: 'Washer-Dryer #6',
    location: 'Dorm B',
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
  // Community Center Machines
  {
    id: 7,
    name: 'Washer-Dryer #7',
    location: 'Community Center',
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
    id: 8,
    name: 'Washer-Dryer #8',
    location: 'Community Center',
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
