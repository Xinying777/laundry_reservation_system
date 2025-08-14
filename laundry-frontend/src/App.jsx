import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import HeroSection from './components/hero-section-component';
import MachinesSection from './components/machines-section-component';
import LostAndFound from './components/lost-and-found-component';
import ReservationModal from './components/reservation-modal-component';
import Login from './components/login-component';
import Signup from './components/signup-component';
import { machinesData } from './data/machine-data';
import './App.css';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for machines data
  const [machines, setMachines] = useState(machinesData);
  
  // State for reservation modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [preSelectedTime, setPreSelectedTime] = useState('');

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(authStatus === 'true');
      setIsLoading(false);
    };
    
    // Simulate checking authentication (in real app, this might be an API call)
    setTimeout(checkAuth, 100);
  }, []);

  // Load existing reservations and update machine availability
  useEffect(() => {
    const loadReservations = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/reservations`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.reservations) {
          const reservations = result.data.reservations;
          const today = new Date().toISOString().split('T')[0];
          
          // Update machine availability based on existing reservations
          setMachines(prevMachines => 
            prevMachines.map(machine => {
              const updatedTimeSlots = machine.timeSlots.map(slot => {
                // Check if this time slot is reserved today
                const isReserved = reservations.some(reservation => {
                  // Add safety checks for reservation data
                  if (!reservation || !reservation.start_time || !reservation.machine_id) {
                    console.warn('Invalid reservation data:', reservation);
                    return false;
                  }
                  
                  try {
                    // Handle both local and UTC ISO date formats
                    let reservationDate;
                    
                    if (reservation.start_time.includes('T') && reservation.start_time.includes('Z')) {
                      // UTC ISO format - convert to local date
                      const dateObj = new Date(reservation.start_time);
                      reservationDate = dateObj.toISOString().split('T')[0];
                    } else {
                      // Local format - extract date part
                      const reservationDateParts = reservation.start_time.split(' ');
                      if (reservationDateParts.length < 1) {
                        console.warn('Invalid start_time format:', reservation.start_time);
                        return false;
                      }
                      reservationDate = reservationDateParts[0];
                    }
                    
                    const reservationTime = convertTimeToSlotFormat(reservation.start_time);
                    
                    return reservation.machine_id === machine.id && 
                           reservationDate === today &&
                           reservationTime === slot.time &&
                           (reservation.status === 'pending' || reservation.status === 'confirmed');
                  } catch (error) {
                    console.error('Error processing reservation:', error, reservation);
                    return false;
                  }
                });
                
                return {
                  ...slot,
                  available: slot.available && !isReserved
                };
              });

              // Check if machine still has available slots
              const hasAvailableSlot = updatedTimeSlots.some(slot => slot.available);
              
              return {
                ...machine,
                timeSlots: updatedTimeSlots,
                status: hasAvailableSlot ? 'available' : 'in-use'
              };
            })
          );
        }
      } catch (error) {
        console.error('Error loading reservations:', error);
      }
    };

    loadReservations();
  }, [isAuthenticated]);

  // Helper function to convert database time to slot format
  const convertTimeToSlotFormat = (dateTimeString) => {
    // Check if dateTimeString is valid
    if (!dateTimeString || typeof dateTimeString !== 'string') {
      console.warn('Invalid dateTimeString passed to convertTimeToSlotFormat:', dateTimeString);
      return '';
    }
    
    try {
      // Handle both local format (YYYY-MM-DD HH:MM:SS) and UTC ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)
      let dateTime;
      
      if (dateTimeString.includes('T') && dateTimeString.includes('Z')) {
        // UTC ISO format - convert to local time
        dateTime = new Date(dateTimeString);
        const hours = dateTime.getHours();
        const minutes = dateTime.getMinutes();
        
        if (hours === 0) return '12:00 AM';
        if (hours < 12) return `${hours}:${minutes.toString().padStart(2, '0')} AM`;
        if (hours === 12) return `12:${minutes.toString().padStart(2, '0')} PM`;
        return `${hours - 12}:${minutes.toString().padStart(2, '0')} PM`;
      } else {
        // Local format - use existing logic
        const parts = dateTimeString.split(' ');
        if (parts.length < 2) {
          console.warn('Invalid datetime format:', dateTimeString);
          return '';
        }
        
        const time = parts[1];
        const timeParts = time.split(':');
        if (timeParts.length < 2) {
          console.warn('Invalid time format:', time);
          return '';
        }
        
        const [hours, minutes] = timeParts;
        const hour24 = parseInt(hours);
        
        if (isNaN(hour24)) {
          console.warn('Invalid hour format:', hours);
          return '';
        }
        
        if (hour24 === 0) return '12:00 AM';
        if (hour24 < 12) return `${hour24}:${minutes} AM`;
        if (hour24 === 12) return `12:${minutes} PM`;
        return `${hour24 - 12}:${minutes} PM`;
      }
    } catch (error) {
      console.error('Error converting time format:', error, dateTimeString);
      return '';
    }
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#2563eb'
        }}>
          Loading...
        </div>
      );
    }
    
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('studentId');
    setIsAuthenticated(false);
  };

  // Login wrapper that handles authentication
  const LoginWrapper = () => {
    if (isAuthenticated) {
      return <Navigate to="/home" replace />;
    }
    return <Login setIsAuthenticated={setIsAuthenticated} />;
  };

  // Signup wrapper that redirects if authenticated
  const SignupWrapper = () => {
    if (isAuthenticated) {
      return <Navigate to="/home" replace />;
    }
    return <Signup />;
  };

  // Scroll to machines section when "View Machines" is clicked
  const handleViewMachines = () => {
    const machinesSection = document.getElementById('machines');
    if (machinesSection) {
      machinesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle machine reservation
  const handleReserve = (machine) => {
    setSelectedMachine(machine);
    setShowModal(true);
  };

  // Handle time slot selection
  const handleSlotSelect = (machineId, slotIndex, time) => {
    const slotKey = `${machineId}-${slotIndex}`;
    setSelectedSlot(slotKey);
    setPreSelectedTime(time);
    
    // Find the machine and open reservation modal
    const machine = machines.find(m => m.id === machineId);
    if (machine) {
      setSelectedMachine(machine);
      setShowModal(true);
    }
  };

  // Handle reservation submission
  const handleReservationSubmit = async (reservationData) => {
    console.log('🎯 Parent received reservation submission:', {
      machine: selectedMachine,
      ...reservationData
    });
    
    // Update machine availability - mark the selected time slot as unavailable
    setMachines(prevMachines => 
      prevMachines.map(machine => {
        if (machine.id === selectedMachine.id) {
          // Mark the selected time slot as unavailable
          const updatedTimeSlots = machine.timeSlots.map(slot => {
            if (slot.time === reservationData.time) {
              return { ...slot, available: false };
            }
            return slot;
          });
          
          return { 
            ...machine, 
            timeSlots: updatedTimeSlots
            // Remove status setting - let MachineCard component calculate it
          };
        }
        return machine;
      })
    );
    
    // DON'T reset modal states here - let the ReservationModal component handle it
    // The confirmation dialog will close the modal when user clicks "Great!"
    console.log('🎯 Parent: Machine availability updated, letting modal handle confirmation');
    
    // Reset selected slot for future use, but keep modal open for confirmation
    setSelectedSlot(null);
    setPreSelectedTime('');
    
    // Delay reload of reservation data to ensure database is updated
    setTimeout(async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/reservations`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.reservations) {
            const reservations = result.data.reservations;
            const today = new Date().toISOString().split('T')[0];
            
            // Recalculate machine availability
            setMachines(currentMachines => 
              currentMachines.map(machine => {
                const updatedTimeSlots = machine.timeSlots.map(slot => {
                  const isReserved = reservations.some(reservation => {
                    if (!reservation || !reservation.start_time || !reservation.machine_id) {
                      return false;
                    }
                    
                    try {
                      let reservationDate;
                      if (reservation.start_time.includes('T') && reservation.start_time.includes('Z')) {
                        const dateObj = new Date(reservation.start_time);
                        reservationDate = dateObj.toISOString().split('T')[0];
                      } else {
                        const reservationDateParts = reservation.start_time.split(' ');
                        if (reservationDateParts.length < 1) return false;
                        reservationDate = reservationDateParts[0];
                      }
                      
                      const reservationTime = convertTimeToSlotFormat(reservation.start_time);
                      
                      return reservation.machine_id === machine.id && 
                             reservationDate === today &&
                             reservationTime === slot.time &&
                             (reservation.status === 'pending' || reservation.status === 'confirmed');
                    } catch (error) {
                      console.error('Error processing reservation:', error);
                      return false;
                    }
                  });
                  
                  return {
                    ...slot,
                    available: !isReserved
                  };
                });
                
                return {
                  ...machine,
                  timeSlots: updatedTimeSlots
                };
              })
            );
          }
        }
      } catch (error) {
        console.error('Error refreshing reservations:', error);
      }
    }, 500); // Wait 500ms to ensure database update is complete
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMachine(null);
    setSelectedSlot(null);
    setPreSelectedTime('');
  };

  // Main page component
  const MainPage = () => {
    return (
      <>
        <HeroSection onViewMachines={handleViewMachines} onLogout={handleLogout} />
        <MachinesSection 
          machines={machines}
          onReserve={handleReserve}
          selectedSlot={selectedSlot}
          onSlotSelect={handleSlotSelect}
        />
        <ReservationModal
          isOpen={showModal}
          onClose={handleCloseModal}
          selectedMachine={selectedMachine}
          selectedTime={preSelectedTime}
          onSubmit={handleReservationSubmit}
        />
      </>
    );
  };

  // Lost & Found wrapper
  const LostAndFoundWrapper = () => {
    return <LostAndFound onLogout={handleLogout} />;
  };

  // Define the router configuration
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/login" replace />
    },
    {
      path: "/login",
      element: <LoginWrapper />
    },
    {
      path: "/signup",
      element: <SignupWrapper />
    },
    {
      path: "/home",
      element: <ProtectedRoute><MainPage /></ProtectedRoute>
    },
    {
      path: "/lostandfound",
      element: <ProtectedRoute><LostAndFoundWrapper /></ProtectedRoute>
    }
  ]);

  return (
    <div className="app-container">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;