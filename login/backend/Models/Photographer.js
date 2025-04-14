const mongoose = require('mongoose');
const Photographer = require('../Models/Photographer');

const photographerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    category: { type: String, default: 'photographer' },
});

module.exports = mongoose.model('Photographer', photographerSchema);