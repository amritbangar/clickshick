const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: false }, // User who receives the notification
    photographerId: { type: String, required: false }, // Photographer who receives the notification
    message: { type: String, required: true },
    bookingId: { type: String, required: false },
    type: { type: String, required: true }, // e.g., 'booking_accepted', 'booking_rejected', 'new_booking'
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    // Add quotation and photographer details
    quotation: {
        packageType: { type: String },
        price: { type: Number },
        description: { type: String },
        deliverables: {
            photos: { type: Number },
            videos: { type: Number },
            reels: { type: Number },
            editedPhotos: { type: Number },
            printedPhotos: { type: Number },
            photoAlbum: { type: Boolean }
        },
        timeframe: { type: String },
        additionalServices: { type: String },
        terms: { type: String }
    },
    photographerDetails: {
        name: { type: String },
        profileImage: { type: String },
        rating: { type: Number },
        location: { type: String }
    }
});

module.exports = mongoose.model('Notification', notificationSchema); 