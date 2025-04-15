const express = require('express');
const router = express.Router();
const Notification = require('../Models/Notification');

// Get notifications for a specific user or photographer
router.get('/', async (req, res) => {
    try {
        const { userId, photographerId } = req.query;
        
        let query = {};
        if (userId) {
            query.userId = userId;
        } else if (photographerId) {
            query.photographerId = photographerId;
        } else {
            return res.status(400).json({ message: 'Either userId or photographerId is required' });
        }
        
        const notifications = await Notification.find(query).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
});

// Create a new notification
router.post('/', async (req, res) => {
    try {
        const { userId, photographerId, message, bookingId, type } = req.body;
        
        if (!message || !type) {
            return res.status(400).json({ message: 'Message and type are required' });
        }
        
        if (!userId && !photographerId) {
            return res.status(400).json({ message: 'Either userId or photographerId is required' });
        }
        
        const notification = new Notification({
            userId,
            photographerId,
            message,
            bookingId,
            type,
            isRead: false,
            createdAt: new Date()
        });
        
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Failed to create notification', error: error.message });
    }
});

// Mark a notification as read
router.put('/:notificationId', async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { isRead } = req.body;
        
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.status(200).json(notification);
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Failed to update notification', error: error.message });
    }
});

// Mark all notifications as read for a user or photographer
router.put('/read-all/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const query = { userId, isRead: false };
        
        const result = await Notification.updateMany(query, { isRead: true });
        
        res.status(200).json({ message: `Marked ${result.modifiedCount} notifications as read` });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
    }
});

// Delete a notification
router.delete('/:notificationId', async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const notification = await Notification.findByIdAndDelete(notificationId);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
});

module.exports = router; 