const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const Message = require('../Models/Message');

// Route to get the list of photographers
router.get('/photographers', async (req, res) => {
    try {
        const photographers = await User.find({ category: 'photographer' });
        res.status(200).json(photographers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to book a photographer
router.post('/photographers/:id/book', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, eventType, eventDate, contactNumber, budget } = req.body;

        // Create a new message indicating the booking
        const newMessage = new Message({
            photographerId: id,
            userId: userId,
            message: `You have been booked for a ${eventType} on ${eventDate}. Contact: ${contactNumber}, Budget: ${budget}`
        });

        await newMessage.save();

        res.status(200).json({ message: 'Photographer booked successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;