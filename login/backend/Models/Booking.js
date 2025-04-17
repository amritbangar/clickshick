const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // User who made the booking
    photographyType: { type: String, required: true },
    budgetRange: { type: String, required: false }, // Optional field
    formats: { type: String, required: false }, // Optional field
    date: { type: String, required: true },
    contactNumber: { type: String, required: false }, // Optional field
    decision: { type: String, required: false },
    location: { type: String, required: true },
    pinCode: { type: String, required: false }, // PIN code for location filtering
    status: { type: String, default: 'Pending' }, // Pending, Confirmed, Cancelled, Completed
    photographer: { type: String, required: false }, // Name of assigned photographer
    photographerId: { type: String, required: false }, // ID of assigned photographer
    photographerRating: { type: Number, required: false }, // Rating of the photographer
    package: { type: String, required: false }, // Package selected
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);