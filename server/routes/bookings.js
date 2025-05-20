const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookings');

// POST /bookings - Create a new booking
router.post('/bookings', bookingController.createBooking);

// GET /slots?date=YYYY-MM-DD - Get available slots for a specific date
router.get('/slots', bookingController.getAvailableSlots);

// PUT /bookings/:id - Update a booking
router.put('/bookings/:id', bookingController.updateBooking);

// DELETE /bookings/:id - Delete a booking
router.delete('/bookings/:id', bookingController.deleteBooking);

module.exports = router;