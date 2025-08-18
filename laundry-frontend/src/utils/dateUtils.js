// src/utils/dateUtils.js
// ==== Existing helpers (kept for backward compatibility) ====

// Format datetime to "YYYY-MM-DD HH:MM"
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  let date;
  if (typeof dateTime === 'string') {
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateTime)) return dateTime;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTime)) return dateTime.substring(0, 16);
    date = new Date(dateTime);
  } else {
    date = dateTime;
  }
  if (isNaN(date.getTime())) return 'Invalid Date';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

// Format date to "YYYY-MM-DD"
export const formatDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Format time to "HH:MM"
export const formatTime = (time) => {
  if (!time) return '';
  let timeObj;
  if (typeof time === 'string') {
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    if (time.includes(' ')) {
      const timePart = time.split(' ')[1];
      if (timePart && /^\d{2}:\d{2}/.test(timePart)) return timePart.substring(0, 5);
    }
    timeObj = new Date(time);
  } else {
    timeObj = time;
  }
  if (isNaN(timeObj.getTime())) return 'Invalid Time';
  const hh = String(timeObj.getHours()).padStart(2, '0');
  const mm = String(timeObj.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

// 12h -> 24h (e.g. "2:00 PM" -> "14:00")
export const convertTo24Hour = (time12h) => {
  if (!time12h) return '';
  const [time, modifier] = time12h.split(' ');
  let [h, m] = time.split(':');
  let hours = parseInt(h, 10);
  if (modifier === 'AM') {
    if (hours === 12) hours = 0;
  } else if (modifier === 'PM') {
    if (hours !== 12) hours += 12;
  }
  return `${String(hours).padStart(2, '0')}:${m}`;
};

// 24h -> 12h (e.g. "14:00" -> "2:00 PM")
export const convertTo12Hour = (time24h) => {
  if (!time24h) return '';
  const [h, m] = time24h.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${m} ${ampm}`;
};

// Is the given date "today" in local time
export const isToday = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

// Friendly relative label
export const getRelativeDate = (date) => {
  if (!date) return '';
  
  // Safely create local date object, avoiding timezone conversion issues
  let dateObj;
  if (typeof date === 'string') {
    // If in "YYYY-MM-DD" format, manually construct local date to avoid UTC parsing
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day); // month is 0-based
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }
  
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  if (dateObj.toDateString() === today.toDateString()) return 'Today';
  if (dateObj.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  if (dateObj.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return formatDate(dateObj);
};

// ==== New helpers we use in App.jsx / ReservationModal ====

// Local "YYYY-MM-DD" for *today* (avoids UTC drift)
export const todayLocalYMD = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Convert Date -> local "YYYY-MM-DD"
export const toLocalYMD = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Convert DB/ISO datetime to a slot label like "6:00 AM" in local time
export const toSlotLabel = (dateTimeString) => {
  if (!dateTimeString || typeof dateTimeString !== 'string') return '';
  try {
    let result = '';
    if (dateTimeString.includes('T')) {
      // ISO string -> Assume database stores local time of the reservation system, but incorrectly labeled as UTC
      // We need to parse the hour part without timezone conversion
      const dt = new Date(dateTimeString);
      // Extract hour directly from ISO string, avoiding timezone conversion
      const isoTime = dateTimeString.split('T')[1]; // Get time part
      const [hours, minutes] = isoTime.split(':');
      const h = parseInt(hours, 10);
      const m = (minutes || '00').padStart(2, '0');
      
      if (h === 0) result = `12:${m} AM`;
      else if (h < 12) result = `${h}:${m} AM`;
      else if (h === 12) result = `12:${m} PM`;
      else result = `${h - 12}:${m} PM`;
      
      console.log(`🕐 toSlotLabel: ${dateTimeString} -> Direct parsing ${h}:${m} -> Final result: "${result}"`);
    } else {
      // "YYYY-MM-DD HH:mm:ss" - Assume this is already local time
      const parts = dateTimeString.split(' ');
      if (parts.length < 2) return '';
      const [hours, minutes] = parts[1].split(':');
      const h24 = parseInt(hours, 10);
      const m = (minutes || '00').padStart(2, '0');
      if (Number.isNaN(h24)) return '';
      
      if (h24 === 0) result = `12:${m} AM`;
      else if (h24 < 12) result = `${h24}:${m} AM`;
      else if (h24 === 12) result = `12:${m} PM`;
      else result = `${h24 - 12}:${m} PM`;
      
      console.log(`🕐 toSlotLabel: ${dateTimeString} -> ${h24}:${m} (24h) -> Final result: "${result}"`);
    }
    
    return result;
  } catch (error) {
    console.error('toSlotLabel conversion error:', error, 'Input:', dateTimeString);
    return '';
  }
};
