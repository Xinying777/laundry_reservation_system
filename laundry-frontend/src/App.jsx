import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
  const handleReservationSubmit = (reservationData) => {
    // In a real app, this would send data to a backend
    console.log('Reservation submitted:', {
      machine: selectedMachine,
      ...reservationData
    });
    
    // Update machine availability (simplified logic)
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
          return { ...machine, timeSlots: updatedTimeSlots };
        }
        return machine;
      })
    );
    
    // Close modal and reset state
    setShowModal(false);
    setSelectedMachine(null);
    setSelectedSlot(null);
    setPreSelectedTime('');
    
    alert('Reservation confirmed! You will receive a confirmation email shortly.');
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

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Default route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login page */}
          <Route path="/login" element={<LoginWrapper />} />

          {/* Signup page */}
          <Route path="/signup" element={<SignupWrapper />} />

          {/* Protected main application page */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            } 
          />

          {/* Lost & Found 独立页面 */}
          <Route 
            path="/lostandfound" 
            element={
              <ProtectedRoute>
                <LostAndFoundWrapper />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;