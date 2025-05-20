const express = require('express');
const app = express();
const PORT = 5000;
const cli = require('./cli');

// Middleware to parse JSON bodies
app.use(express.json());

// Pretty-print JSON responses
app.set('json spaces', 2);

// Import routes
const bookingRoutes = require('./routes/bookings');

// Use routes
app.use('/', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.statusCode || 500
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  
  // Start the CLI after server is running
  cli.startCLI();
});