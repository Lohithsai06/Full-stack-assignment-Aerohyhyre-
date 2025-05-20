const bookingModel = require('../models/bookings');
const validation = require('../utils/validation');

/**
 * Create a new booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function createBooking(req, res, next) {
  try {
    const bookingData = req.body;
    
    // Validate input
    const validationResult = validation.validateBookingInput(bookingData);
    if (!validationResult.isValid) {
      const error = new Error(validationResult.message);
      error.statusCode = 400;
      throw error;
    }
    
    // Check if room exists
    if (!bookingModel.roomExists(bookingData.roomId)) {
      const error = new Error(`Room ${bookingData.roomId} does not exist`);
      error.statusCode = 404;
      throw error;
    }
    
    // Create booking
    const newBooking = bookingModel.createBooking(bookingData);
    
    // Return success with booking object
    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
}

/**
 * Get available slots for a specific date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function getAvailableSlots(req, res, next) {
  try {
    const { date } = req.query;
    
    // Validate date parameter
    if (!date) {
      const error = new Error('Date parameter is required');
      error.statusCode = 400;
      throw error;
    }
    
    // Validate date format
    if (!validation.validateDateFormat(date)) {
      const error = new Error('Invalid date format. Use YYYY-MM-DD');
      error.statusCode = 400;
      throw error;
    }
    
    // Get available slots
    const availableSlots = bookingModel.getAvailableSlots(date);
    
    // Set content type to ensure proper JSON formatting
    res.setHeader('Content-Type', 'application/json');
    res.json(availableSlots);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function updateBooking(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate input if time is being updated
    if (updateData.startTime || updateData.endTime) {
      // Get current booking to merge with update data for validation
      const currentBooking = bookingModel.getBookingById(id);
      const bookingToValidate = {
        ...currentBooking,
        ...updateData
      };
      
      const validationResult = validation.validateBookingInput(bookingToValidate);
      if (!validationResult.isValid) {
        const error = new Error(validationResult.message);
        error.statusCode = 400;
        throw error;
      }
    }
    
    // Check if room exists if being updated
    if (updateData.roomId && !bookingModel.roomExists(updateData.roomId)) {
      const error = new Error(`Room ${updateData.roomId} does not exist`);
      error.statusCode = 404;
      throw error;
    }
    
    // Update booking
    const updatedBooking = bookingModel.updateBooking(id, updateData);
    
    // Return success with updated booking
    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function deleteBooking(req, res, next) {
  try {
    const { id } = req.params;
    
    // Delete booking
    bookingModel.deleteBooking(id);
    
    // Return success
    res.json({
      message: 'Booking deleted successfully',
      id
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getAvailableSlots,
  updateBooking,
  deleteBooking
};