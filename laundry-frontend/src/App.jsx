// src/App.jsx
import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import HeroSection from './components/hero-section-component';
import MachinesSection from './components/machines-section-component';
import LostAndFound from './components/lost-and-found-component';
import FAQComponent from './components/faq-component';
import ReservationModal from './components/reservation-modal-component';
import Login from './components/login-component';
import Signup from './components/signup-component';
import { machinesData } from './data/machine-data';
import { api } from './utils/api';
import { todayLocalYMD, toLocalYMD, toSlotLabel } from './utils/dateUtils';
import './App.css';

function App() {
  // ---- global state ----
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [machines, setMachines] = useState(machinesData);

  // reservation modal & current selection
  const [showModal, setShowModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [preSelectedTime, setPreSelectedTime] = useState('');

  // ---- auth bootstrap ----
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
    setIsLoading(false);
  }, []);

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */

  // Normalize API response into an array of reservations
  const normalizeReservations = (result) => {
    if (Array.isArray(result)) return result;
    if (result?.data?.reservations && Array.isArray(result.data.reservations)) {
      return result.data.reservations;
    }
    if (result?.reservations && Array.isArray(result.reservations)) {
      return result.reservations;
    }
    return [];
  };

  // Project server reservations into machine slot availability (LOCAL calendar date)
  const projectAvailability = (prevMachines, reservations) => {
    const today = todayLocalYMD();
    console.log('🔄 projectAvailability called');
    console.log('📅 Today:', today);
    console.log('📋 Reservations to process:', reservations);

    return prevMachines.map(machine => {
      console.log(`🔧 Processing machine ${machine.id} (${machine.name})`);
      
      const timeSlots = machine.timeSlots.map(slot => {
        console.log(`⏰ Checking slot ${slot.time}`);
        
        const isReserved = reservations.some(reservation => {
          // must have a start time; machine_id may be absent if we use machine_no
          if (!reservation?.start_time) {
            console.log('❌ No start_time in reservation:', reservation);
            return false;
          }

          // Local-date normalize: ISO 'T' vs 'YYYY-MM-DD HH:mm:ss'
          const reservationDate = reservation.start_time.includes('T')
            ? toLocalYMD(new Date(reservation.start_time))
            : (reservation.start_time.split(' ')[0] || '');

          // Label that must match UI slot labels exactly
          const reservationTime = toSlotLabel(reservation.start_time);
          console.log(`🔍 Reservation details:`, {
            start_time: reservation.start_time,
            reservationDate,
            reservationTime,
            machine_no: reservation.machine_no,
            machine_id: reservation.machine_id,
            status: reservation.status
          });

          // Prefer machine_no (frontend 1..N) sent by backend; fallback to raw machine_id
          let sameMachine = false;
          
          if (reservation.machine_no != null) {
            // Backend provides machine_no (1-8), which should match frontend machine.id
            sameMachine = (reservation.machine_no === machine.id);
            console.log(`🔢 Using machine_no: ${reservation.machine_no} === ${machine.id} = ${sameMachine}`);
          } else if (reservation.machine_id != null) {
            // Fallback to direct machine_id comparison
            sameMachine = (reservation.machine_id === machine.id);
            console.log(`🔢 Using machine_id: ${reservation.machine_id} === ${machine.id} = ${sameMachine}`);
          }
          
          // Debug the machine mapping
          console.log(`🔧 Machine matching for reservation:`, {
            frontendMachineId: machine.id,
            frontendMachineName: machine.name,
            reservationMachineNo: reservation.machine_no,
            reservationMachineId: reservation.machine_id,
            sameMachine
          });

          const sameDay  = reservationDate === today;
          const sameSlot = reservationTime === slot.time;
          const active   = reservation.status === 'pending' || reservation.status === 'confirmed';

          console.log(`🔍 Match check:`, {
            sameMachine: `${sameMachine} (${reservation.machine_no || reservation.machine_id} === ${machine.id})`,
            sameDay: `${sameDay} (${reservationDate} === ${today})`,
            sameSlot: `${sameSlot} (${reservationTime} === ${slot.time})`,
            active: `${active} (${reservation.status})`
          });

          const matches = sameMachine && sameDay && sameSlot && active;
          if (matches) {
            console.log('✅ MATCH FOUND! Slot will be marked as reserved');
          }

          return matches;
        });

        console.log(`⏰ Slot ${slot.time} - Reserved: ${isReserved}`);
        // Always recompute from truth (avoid chaining with previous availability)
        return { ...slot, available: !isReserved };
      });

      const hasAvailableSlot = timeSlots.some(s => s.available);
      const updatedMachine = {
        ...machine,
        timeSlots,
        status: hasAvailableSlot ? 'available' : 'in-use',
      };
      
      console.log(`🔧 Machine ${machine.id} updated:`, {
        name: machine.name,
        status: updatedMachine.status,
        slots: timeSlots.map(s => `${s.time}:${s.available ? 'available' : 'reserved'}`)
      });
      
      return updatedMachine;
    });
  };

  /* ------------------------------------------------------------------ */
  /* Load reservations on auth -> update availability                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const loadReservations = async () => {
      if (!isAuthenticated) return;
      try {
        const result = await api.get('/api/reservations');
        const reservations = normalizeReservations(result);
        setMachines(prev => projectAvailability(prev, reservations));
      } catch (err) {
        console.error('Failed to load reservations', err);
      }
    };

    loadReservations();
  }, [isAuthenticated]);

  /* ------------------------------------------------------------------ */
  /* Actions                                                            */
  /* ------------------------------------------------------------------ */
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('studentId');
    setIsAuthenticated(false);
  };

  const handleViewMachines = () => {
    const el = document.getElementById('machines');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReserve = (machine) => {
    setSelectedMachine(machine);
    setShowModal(true);
  };

  const handleSlotSelect = (machineId, slotIndex, time) => {
    setSelectedSlot(`${machineId}-${slotIndex}`);
    setPreSelectedTime(time);
    const machine = machines.find(m => m.id === machineId);
    if (machine) {
      setSelectedMachine(machine);
      setShowModal(true);
    }
  };

  // Called after modal confirms creation on the server
  const handleReservationSubmit = async (reservationData) => {
    console.log('🚀 handleReservationSubmit called with:', reservationData);
    
    // Optimistic UI: immediately block the chosen slot by label
    const label = reservationData?.time ?? preSelectedTime;
    console.log('🎯 Marking slot as unavailable:', label, 'for machine:', selectedMachine?.id);
    
    setMachines(prev =>
      prev.map(m =>
        (selectedMachine && m.id === selectedMachine.id)
          ? {
              ...m,
              timeSlots: m.timeSlots.map(s =>
                s.time === label ? { ...s, available: false } : s
              )
            }
          : m
      )
    );

    // Immediately refresh from server to ensure consistency
    console.log('🔄 Refreshing reservations from server...');
    try {
      const result = await api.get('/api/reservations');
      console.log('📋 Server reservations response:', result);
      const reservations = normalizeReservations(result);
      console.log('📋 Normalized reservations:', reservations);
      setMachines(prev => projectAvailability(prev, reservations));
      console.log('✅ Machine states updated from server');
    } catch (e) {
      console.error('❌ Error refreshing reservations:', e);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMachine(null);
    setSelectedSlot(null);
    setPreSelectedTime('');
  };

  /* ------------------------------------------------------------------ */
  /* Routing wrappers                                                    */
  /* ------------------------------------------------------------------ */
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100vh', fontSize: '1.2rem', color: '#2563eb'
        }}>
          Loading...
        </div>
      );
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  const LoginWrapper = () =>
    (isAuthenticated ? <Navigate to="/home" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />);

  const SignupWrapper = () =>
    (isAuthenticated ? <Navigate to="/home" replace /> : <Signup />);

  const MainPage = () => (
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

  const LostAndFoundWrapper = () => <LostAndFound onLogout={handleLogout} />;

  const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/login" replace /> },
    { path: '/login', element: <LoginWrapper /> },
    { path: '/signup', element: <SignupWrapper /> },
    { path: '/home', element: <ProtectedRoute><MainPage /></ProtectedRoute> },
    { path: '/lostandfound', element: <ProtectedRoute><LostAndFoundWrapper /></ProtectedRoute> },
    { path: '/faq', element: <ProtectedRoute><FAQComponent /></ProtectedRoute> },
  ]);

  return (
    <div className="app-container">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
