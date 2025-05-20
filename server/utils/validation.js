/**
 * Validate booking input data
 * @param {Object} data - Booking data
 * @returns {Object} - Validation result
 */
function validateBookingInput(data) {
  const { roomId, startTime, endTime, user } = data;
  
  // Check required fields
  if (!roomId || !startTime || !endTime || !user) {
    return {
      isValid: false,
      error: 'Missing required fields',
      message: 'roomId, startTime, endTime, and user are all required'
    };
  }
  
  // Parse dates
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  // Validate dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date format',
      message: 'startTime and endTime must be valid ISO date strings'
    };
  }
  
  if (startDate >= endDate) {
    return {
      isValid: false,
      error: 'Invalid time range',
      message: 'Start time must be before end time'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date string
 * @returns {boolean} - True if valid
 */
function validateDateFormat(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
}

module.exports = {
  validateBookingInput,
  validateDateFormat
};