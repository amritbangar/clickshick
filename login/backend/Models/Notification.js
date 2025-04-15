const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: false }, // User who receives the notification
    photographerId: { type: String, required: false }, // Photographer who receives the notification
    message: { type: String, required: true },
    bookingId: { type: String, required: false },
    type: { type: String, required: true }, // e.g., 'booking_accepted', 'booking_rejected', 'new_booking'
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema); 