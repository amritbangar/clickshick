require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./Routes/AuthRouter'); // User-related routes
const bookingRoutes = require('./Routes/bookings'); // Booking-related routes
const notificationRoutes = require('./Routes/notifications'); // Notification-related routes

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes); // Register user-related routes
app.use('/api/bookings', bookingRoutes); // Register booking-related routes
app.use('/api/notifications', notificationRoutes); // Add notifications routes

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_CONN, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));