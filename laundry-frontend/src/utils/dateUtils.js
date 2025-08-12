// Date and time formatting utility functions
// Convert various date time formats to user-friendly formats

/**
 * Format datetime to "2025-08-10 15:04" format
 * @param {string|Date} dateTime - Input datetime
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  
  let date;
  
  // Handle different input formats
  if (typeof dateTime === 'string') {
    // If already in expected format, return directly
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateTime)) {
      return dateTime;
    }
    
    // If format includes seconds, remove seconds
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTime)) {
      return dateTime.substring(0, 16);
    }
    
    // Handle ISO string or other formats
    date = new Date(dateTime);
  } else {
    date = dateTime;
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date:', dateTime);
    return 'Invalid Date';
  }
  
  // Format as YYYY-MM-DD HH:MM
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * Format date to "2025-08-10" format
 * @param {string|Date} date - Input date
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date:', date);
    return 'Invalid Date';
  }
  
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format time to "15:04" format
 * @param {string|Date} time - Input time
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  let timeObj;
  
  if (typeof time === 'string') {
    // If already in HH:MM format
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }
    
    // If full datetime string, extract time part
    if (time.includes(' ')) {
      const timePart = time.split(' ')[1];
      if (timePart && /^\d{2}:\d{2}/.test(timePart)) {
        return timePart.substring(0, 5);
      }
    }
    
    timeObj = new Date(time);
  } else {
    timeObj = time;
  }
  
  if (isNaN(timeObj.getTime())) {
    console.warn('Invalid time:', time);
    return 'Invalid Time';
  }
  
  const hours = timeObj.getHours().toString().padStart(2, '0');
  const minutes = timeObj.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Convert 12-hour time to 24-hour format
 * @param {string} time12h - 12-hour time (e.g.: "2:00 PM")
 * @returns {string} 24-hour time (e.g.: "14:00")
 */
export const convertTo24Hour = (time12h) => {
  if (!time12h) return '';
  
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  
  if (modifier === 'AM') {
    if (hours === 12) {
      hours = 0; // 12 AM = 00:00
    }
  } else if (modifier === 'PM') {
    if (hours !== 12) {
      hours += 12; // 1 PM = 13:00, but 12 PM = 12:00
    }
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

/**
 * Convert 24-hour time to 12-hour format
 * @param {string} time24h - 24-hour time (e.g.: "14:00")
 * @returns {string} 12-hour time (e.g.: "2:00 PM")
 */
export const convertTo12Hour = (time24h) => {
  if (!time24h) return '';
  
  const [hours, minutes] = time24h.split(':');
  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  
  if (hour === 0) {
    hour = 12; // 00:00 = 12:00 AM
  } else if (hour > 12) {
    hour -= 12; // 13:00 = 1:00 PM
  }
  
  return `${hour}:${minutes} ${ampm}`;
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} Whether it is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Get friendly relative time description
 * @param {string|Date} date - Date time
 * @returns {string} Relative time description (e.g.: "Today", "Tomorrow", "2025-08-15")
 */
export const getRelativeDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  if (dateObj.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (dateObj.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else if (dateObj.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return formatDate(dateObj);
  }
};
