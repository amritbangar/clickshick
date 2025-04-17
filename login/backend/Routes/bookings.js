const express = require('express');
const router = express.Router();
const Booking = require('../Models/Booking'); // Ensure the Booking model is imported correctly

// Save a new booking
router.post('/', async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Log the request body
        const booking = new Booking(req.body);
        await booking.save();
        console.log('Booking saved successfully:', booking); // Log the saved booking
        res.status(201).json({ message: 'Booking saved successfully!' });
    } catch (error) {
        console.error('Error saving booking:', error); // Log the full error
        res.status(500).json({ message: 'Failed to save booking.', error: error.message });
    }
});

// Get all bookings - with optional filtering by userId
router.get('/', async (req, res) => {
    try {
        let query = {};
        
        // Filter by userId if provided
        if (req.query.userId) {
            query.userId = req.query.userId;
            console.log(`Fetching bookings for user: ${req.query.userId}`);
        }
        
        // Filter by photographerId if provided
        if (req.query.photographerId) {
            query.photographerId = req.query.photographerId;
            console.log(`Fetching bookings for photographer: ${req.query.photographerId}`);
        }
        
        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }
        
        // Filter by pinCode if provided
        if (req.query.pinCode) {
            query.pinCode = req.query.pinCode;
            console.log(`Fetching bookings for pinCode: ${req.query.pinCode}`);
        }
        
        console.log('Query:', query);
        const bookings = await Booking.find(query);
        console.log(`Fetched ${bookings.length} bookings:`, bookings); // Log the fetched bookings
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings.', error: error.message });
    }
});

// Get a specific booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Failed to fetch booking.', error: error.message });
    }
});

// Update a booking
router.put('/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const updateData = req.body;
        console.log(`Updating booking ${bookingId} with:`, updateData);
        
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId, 
            updateData, 
            { new: true } // Return the updated document
        );
        
        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        console.log('Booking updated successfully:', updatedBooking);
        res.status(200).json({ message: 'Booking updated successfully', booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Failed to update booking.', error: error.message });
    }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        console.log('Booking deleted successfully');
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Failed to delete booking.', error: error.message });
    }
});

module.exports = router;