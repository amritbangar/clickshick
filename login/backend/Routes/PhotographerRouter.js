const express = require('express');
const router = express.Router();
const Photographer = require('../Models/Photographer'); // Assuming you have a Photographer model
const Message = require('../Models/Message'); // Assuming you have a Message model

// Get messages for a specific photographer
router.get('/:photographerId/messages', async (req, res) => {
    const { photographerId } = req.params;

    try {
        const messages = await Message.find({ photographerId }).populate('userId', 'name email');
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;