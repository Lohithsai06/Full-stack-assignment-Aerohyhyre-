const inquirer = require('inquirer');
const chalk = require('chalk');
const axios = require('axios');
const { format } = require('date-fns');

// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000';

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return format(date, 'yyyy-MM-dd hh:mm a');
}

// Format time slot for display
function formatTimeSlot(slot) {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  return `${format(start, 'hh:mm a')} - ${format(end, 'hh:mm a')}`;
}

// Main menu
async function showMainMenu() {
  console.clear();
  console.log(chalk.blue.bold('\n=== Conference Room Booking System ===\n'));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'View Available Slots', value: 'viewSlots' },
        { name: 'Book a Room', value: 'bookRoom' },
        { name: 'Reschedule Booking', value: 'rescheduleBooking' },
        { name: 'Cancel Booking', value: 'cancelBooking' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  switch (action) {
    case 'viewSlots':
      await viewAvailableSlots();
      break;
    case 'bookRoom':
      await bookRoom();
      break;
    case 'rescheduleBooking':
      await rescheduleBooking();
      break;
    case 'cancelBooking':
      await cancelBooking();
      break;
    case 'exit':
      console.log(chalk.yellow('Exiting application...'));
      process.exit(0);
  }

  // Return to main menu after action completes
  await showMainMenu();
}

// View available slots
async function viewAvailableSlots() {
  try {
    // Ask for date
    const { date } = await inquirer.prompt([
      {
        type: 'input',
        name: 'date',
        message: 'Enter date (YYYY-MM-DD) or press Enter for today:',
        default: format(new Date(), 'yyyy-MM-dd'),
        validate: function(input) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(input)) {
            return true;
          }
          return 'Please enter a valid date in YYYY-MM-DD format';
        }
      }
    ]);

    console.log(chalk.yellow(`Fetching available slots for ${date}...`));
    
    // Call API to get available slots
    const response = await axios.get(`${API_BASE_URL}/slots?date=${date}`);
    const data = response.data;
    
    console.log(chalk.green.bold(`\nAvailable Slots for ${date}:\n`));
    
    // Display available slots by room
    const rooms = Object.keys(data.availableSlots);
    
    if (rooms.length === 0) {
      console.log(chalk.red('No rooms available for this date.'));
      return;
    }
    
    for (const room of rooms) {
      console.log(chalk.blue.bold(`Room ${room}:`));
      const slots = data.availableSlots[room];
      
      if (slots.length === 0) {
        console.log(chalk.red('  No available slots for this room.'));
      } else {
        slots.forEach((slot, index) => {
          console.log(`  ${index + 1}. ${formatTimeSlot(slot)}`);
        });
      }
      console.log('');
    }
    
    // Wait for user to press Enter to continue
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to return to main menu...',
      }
    ]);
    
  } catch (error) {
    console.error(chalk.red('Error fetching available slots:'));
    console.error(chalk.red(error.response?.data?.error || error.message));
    
    // Wait for user to press Enter to continue
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to return to main menu...',
      }
    ]);
  }
}

// Book a room
async function bookRoom() {
  try {
    // Ask for date
    const { date } = await inquirer.prompt([
      {
        type: 'input',
        name: 'date',
        message: 'Enter date for booking (YYYY-MM-DD):',
        default: format(new Date(), 'yyyy-MM-dd'),
        validate: function(input) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(input)) {
            return true;
          }
          return 'Please enter a valid date in YYYY-MM-DD format';
        }
      }
    ]);
    
    // Fetch available slots for the selected date
    const response = await axios.get(`${API_BASE_URL}/slots?date=${date}`);
    const data = response.data;
    
    // Get rooms with available slots
    const availableRooms = Object.keys(data.availableSlots).filter(
      room => data.availableSlots[room].length > 0
    );
    
    if (availableRooms.length === 0) {
      console.log(chalk.red(`No available slots for ${date}.`));
      return;
    }
    
    // Ask user to select a room
    const { roomId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'roomId',
        message: 'Select a room:',
        choices: availableRooms
      }
    ]);
    
    // Get available slots for the selected room
    const availableSlots = data.availableSlots[roomId];
    
    // Ask user to select a time slot
    const { slotIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'slotIndex',
        message: 'Select a time slot:',
        choices: availableSlots.map((slot, index) => ({
          name: formatTimeSlot(slot),
          value: index
        }))
      }
    ]);
    
    const selectedSlot = availableSlots[slotIndex];
    
    // Ask for user name
    const { user } = await inquirer.prompt([
      {
        type: 'input',
        name: 'user',
        message: 'Enter your name:',
        validate: function(input) {
          if (input.trim()) {
            return true;
          }
          return 'Name is required';
        }
      }
    ]);
    
    // Confirm booking
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Confirm booking for Room ${roomId} on ${date} at ${formatTimeSlot(selectedSlot)}?`,
        default: true
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Booking cancelled.'));
      return;
    }
    
    // Create booking
    const bookingData = {
      roomId,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      user
    };
    
    const bookingResponse = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
    const booking = bookingResponse.data;
    
    console.log(chalk.green.bold('\nBooking Confirmed:'));
    console.log(chalk.green(`Room: ${booking.roomId}`));
    console.log(chalk.green(`Time: ${formatTimeSlot({
      startTime: booking.startTime,
      endTime: booking.endTime
    })}`));
    console.log(chalk.green(`User: ${booking.user}`));
    console.log(chalk.green(`Booking ID: ${booking.id}`));
    
    // Wait for user to press Enter to continue
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to return to main menu...',
      }
    ]);
    
  } catch (error) {
    console.error(chalk.red('Error creating booking:'));
    console.error(chalk.red(error.response?.data?.error || error.message));
    
    // Wait for user to press Enter to continue
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to return to main menu...',
      }
    ]);
  }
}

// Helper function to get all bookings
async function getAllBookings() {
  // This is a workaround since we don't have a direct endpoint to get all bookings
  // In a real application, you would add a GET /bookings endpoint to the API
  
  // For now, we'll use a hardcoded date range to fetch bookings
  const today = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(today.getMonth() + 1);
  
  const startDate = format(today, 'yyyy-MM-dd');
  const endDate = format(oneMonthFromNow, 'yyyy-MM-dd');
  
  // We'll use the slots endpoint to infer bookings
  // This is not ideal but works for demonstration
  try {
    const response = await axios.get(`${API_BASE_URL}/slots?date=${startDate}`);
    
    // Since we don't have a direct way to get bookings, we'll return an empty array
    // In a real application, you would implement a proper endpoint
    return [];
  } catch (error) {
    console.error(chalk.red('Error fetching bookings:'));
    console.error(chalk.red(error.response?.data?.error || error.message));
    return [];
  }
}

// Reschedule a booking
async function rescheduleBooking() {
  try {
    // In a real application, you would fetch all bookings
    // For now, we'll ask the user to enter a booking ID
    const { bookingId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'bookingId',
        message: 'Enter the booking ID to reschedule:',
        validate: function(input) {
          if (input.trim()) {
            return true;
          }
          return 'Booking ID is required';
        }
      }
    ]);
    
    // Ask for date
    const { date } = await inquirer.prompt([
      {
        type: 'input',
        name: 'date',
        message: 'Enter new date for booking (YYYY-MM-DD):',
        default: format(new Date(), 'yyyy-MM-dd'),
        validate: function(input) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(input)) {
            return true;
          }
          return 'Please enter a valid date in YYYY-MM-DD format';
        }
      }
    ]);
    
    // Fetch available slots for the selected date
    const response = await axios.get(`${API_BASE_URL}/slots?date=${date}`);
    const data = response.data;
    
    // Get rooms with available slots
    const availableRooms = Object.keys(data.availableSlots).filter(
      room => data.availableSlots[room].length > 0
    );
    
    if (availableRooms.length === 0) {
      console.log(chalk.red(`No available slots for ${date}.`));
      return;
    }
    
    // Ask user to select a room
    const { roomId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'roomId',
        message: 'Select a new room:',
        choices: availableRooms
      }
    ]);
    
    // Get available slots for the selected room
    const availableSlots = data.availableSlots[roomId];
    
    // Ask user to select a time slot
    const { slotIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'slotIndex',
        message: 'Select a new time slot:',
        choices: availableSlots.map((slot, index) => ({
          name: formatTimeSlot(slot),
          value: index
        }))
      }
    ]);
    
    const selectedSlot = availableSlots[slotIndex];
    
    // Confirm rescheduling
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Confirm rescheduling to Room ${roomId} on ${date} at ${formatTimeSlot(selectedSlot)}?`,
        default: true
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Rescheduling cancelled.'));
      return;
    }
    
    // Update booking
    const updateData = {
      roomId,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/bookings/${bookingId}`, updateData);
    const updatedBooking = updateResponse.data;
    
    console.log(chalk.green.bold('\nBooking Rescheduled:'));
    console.log(chalk.green(`Room: ${updatedBooking.roomId}`));
    console.log(chalk.green(`Time: ${formatTimeSlot({
      startTime: updatedBooking.startTime,
      endTime: updatedBooking.endTime
    })}`));
    console.log(chalk.green(`User: ${updatedBooking.user}`));
    console.log(chalk.green(`Booking ID: ${updatedBooking.id}`));
    
    // Wait for user to press Enter to continue
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to return to main menu...',
      }
    ]);
    
  } catch (error) {
    console.error(chalk.red('Error rescheduling booking:'));
    console.error(chalk.red(error.response?.data?.error || error.message));
    
    // Wait for user to press Enter to continue
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to return to main menu...',
      }
    ]);
  }
}

// Cancel a booking
async function cancelBooking() {
  try {
    // In a real application, you would fetch all bookings
    // For now, we'll ask the user to enter a booking ID
    const { bookingId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'bookingId',
        message: 'Enter the booking ID to cancel:',
        validate: function(input) {
          if (input.trim()) {
            return true;
          }
          return 'Booking ID is required';
        }
      }
    ]);
    
    // Confirm cancellation
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to cancel booking ${bookingId}?`,
        default: false
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Cancellation aborted.'));
      return;
    }
    
    // Cancel booking
    const response = await axios.delete(`${API_BASE_URL}/bookings/${bookingId}`);
    
    console.log(chalk.green.bold('\nBooking Cancelled:'));
    console.log(chalk.green(`Booking ID: ${bookingId}`));
    
    // Wait for user to press Enter to continue
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to return to main menu...',
      }
    ]);
    
  } catch (error) {
    console.error(chalk.red('Error cancelling booking:'));
    console.error(chalk.red(error.response?.data?.error || error.message));
    
    // Wait for user to press Enter to continue
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to return to main menu...',
      }
    ]);
  }
}

// Start the CLI
function startCLI() {
  console.log(chalk.green('Starting CLI interface...'));
  showMainMenu();
}

module.exports = { startCLI };