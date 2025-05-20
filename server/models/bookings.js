// In-memory store for bookings
const bookingsStore = new Map();

// Available rooms
const availableRooms = ['A101', 'A102', 'B101', 'B102', 'C101'];

/**
 * Helper function to check if two time slots overlap
 * @param {Date} startA - Start time of first booking
 * @param {Date} endA - End time of first booking
 * @param {Date} startB - Start time of second booking
 * @param {Date} endB - End time of second booking
 * @returns {boolean} - True if there is an overlap
 */
function isOverlapping(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @returns {Object} - Created booking
 */
function createBooking(bookingData) {
  const { roomId, startTime, endTime, user } = bookingData;
  
  // Parse dates
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  // Check for conflicts
  let hasConflict = false;
  let conflictingBookingId = null;
  
  bookingsStore.forEach((booking, id) => {
    // Only check bookings for the same room
    if (booking.roomId === roomId) {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      if (isOverlapping(startDate, endDate, bookingStart, bookingEnd)) {
        hasConflict = true;
        conflictingBookingId = id;
      }
    }
  });
  
  if (hasConflict) {
    const error = new Error('Booking conflict for this room and time.');
    error.statusCode = 409;
    error.conflictingBookingId = conflictingBookingId;
    throw error;
  }
  
  // Generate unique ID
  const id = Date.now().toString();
  
  // Create booking object
  const newBooking = {
    id,
    roomId,
    startTime,
    endTime,
    user,
    createdAt: new Date().toISOString()
  };
  
  // Store booking
  bookingsStore.set(id, newBooking);
  
  return newBooking;
}

/**
 * Get available slots for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object} - Available slots grouped by room
 */
function getAvailableSlots(date) {
  // Define time slots (9 AM to 5 PM in 1-hour intervals)
  const timeSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    const startTime = `${date}T${hour.toString().padStart(2, '0')}:00:00Z`;
    const endTime = `${date}T${(hour + 1).toString().padStart(2, '0')}:00:00Z`;
    timeSlots.push({ startTime, endTime });
  }
  
  // Initialize available slots for each room
  const availableSlots = {};
  availableRooms.forEach(room => {
    availableSlots[room] = [...timeSlots];
  });
  
  // Filter out booked slots
  bookingsStore.forEach(booking => {
    const bookingDate = booking.startTime.split('T')[0];
    
    // Only consider bookings for the requested date
    if (bookingDate === date) {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      const roomId = booking.roomId;
      
      // Skip if room is not in our list
      if (!availableSlots[roomId]) return;
      
      // Remove slots that overlap with this booking
      availableSlots[roomId] = availableSlots[roomId].filter(slot => {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);
        
        // Two time periods don't overlap if one ends before the other starts
        return !(slotStart < bookingEnd && bookingStart < slotEnd);
      });
    }
  });
  
  return { date, availableSlots };
}

/**
 * Get a booking by ID
 * @param {string} id - Booking ID
 * @returns {Object} - Booking object
 */
function getBookingById(id) {
  const booking = bookingsStore.get(id);
  
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }
  
  return booking;
}

/**
 * Update a booking
 * @param {string} id - Booking ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated booking
 */
function updateBooking(id, updateData) {
  const booking = getBookingById(id);
  
  // Create a temporary booking with the new data
  const tempBooking = {
    ...booking,
    ...updateData
  };
  
  // Delete the booking temporarily to avoid conflict with itself
  bookingsStore.delete(id);
  
  try {
    // Check for conflicts with other bookings
    const startDate = new Date(tempBooking.startTime);
    const endDate = new Date(tempBooking.endTime);
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }
    
    if (startDate >= endDate) {
      throw new Error('Start time must be before end time');
    }
    
    // Check for conflicts
    let hasConflict = false;
    let conflictingBookingId = null;
    
    bookingsStore.forEach((otherBooking, otherId) => {
      // Only check bookings for the same room
      if (otherBooking.roomId === tempBooking.roomId) {
        const bookingStart = new Date(otherBooking.startTime);
        const bookingEnd = new Date(otherBooking.endTime);
        
        if (isOverlapping(startDate, endDate, bookingStart, bookingEnd)) {
          hasConflict = true;
          conflictingBookingId = otherId;
        }
      }
    });
    
    if (hasConflict) {
      const error = new Error('Booking conflict for this room and time.');
      error.statusCode = 409;
      error.conflictingBookingId = conflictingBookingId;
      throw error;
    }
    
    // Update the booking
    bookingsStore.set(id, tempBooking);
    
    return tempBooking;
  } catch (error) {
    // Restore the original booking if there was an error
    bookingsStore.set(id, booking);
    throw error;
  }
}

/**
 * Delete a booking
 * @param {string} id - Booking ID
 * @returns {boolean} - True if deleted successfully
 */
function deleteBooking(id) {
  const booking = getBookingById(id);
  
  return bookingsStore.delete(id);
}

/**
 * Check if a room exists
 * @param {string} roomId - Room ID
 * @returns {boolean} - True if room exists
 */
function roomExists(roomId) {
  return availableRooms.includes(roomId);
}

module.exports = {
  createBooking,
  getAvailableSlots,
  getBookingById,
  updateBooking,
  deleteBooking,
  roomExists,
  isOverlapping,
  availableRooms
};