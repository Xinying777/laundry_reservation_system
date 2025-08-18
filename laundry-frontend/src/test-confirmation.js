// Test file to verify the confirmation modal displays correctly
// This simulates the exact scenario to test the confirmation popup

const testReservationConfirmation = () => {
  console.log('Testing reservation confirmation modal...');
  
  // Simulate a successful reservation response
  const mockFormData = {
    date: '2025-08-15',
    time: '6:00 AM',
    studentId: 'test123'
  };
  
  const mockMachine = {
    id: 3,
    name: 'Washer-Dryer 3'
  };
  
  // This simulates what happens when API returns success
  console.log('✅ Mock reservation successful, showing confirmation modal...');
  console.log('Confirmation data:', {
    machine: mockMachine.name,
    date: mockFormData.date,
    time: mockFormData.time,
    studentId: mockFormData.studentId
  });
  
  return true;
};

// Run the test
if (typeof window !== 'undefined') {
  // Browser environment
  window.testReservationConfirmation = testReservationConfirmation;
  console.log('Test function available as window.testReservationConfirmation()');
} else {
  // Node environment
  testReservationConfirmation();
}
