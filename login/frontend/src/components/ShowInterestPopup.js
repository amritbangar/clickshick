import React, { useState } from 'react';
import '../styles/ShowInterestPopup.css';

const ShowInterestPopup = ({ booking, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        message: '',
        expectedPrice: '',
        availability: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="interest-popup-overlay">
            <div className="interest-popup">
                <div className="interest-popup-header">
                    <h3>Show Interest in Booking</h3>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                <div className="interest-popup-content">
                    <div className="booking-details">
                        <h4>Booking Information</h4>
                        <p><strong>Type:</strong> {booking.photographyType}</p>
                        <p><strong>Date:</strong> {booking.date}</p>
                        <p><strong>Location:</strong> {booking.location}</p>
                        <p><strong>Budget Range:</strong> {booking.budgetRange}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Message to Client*</label>
                            <textarea
                                className="form-control"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Introduce yourself and describe your photography style..."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Expected Price*</label>
                            <input
                                type="text"
                                className="form-control"
                                name="expectedPrice"
                                value={formData.expectedPrice}
                                onChange={handleChange}
                                placeholder="Enter your expected price"
                                required
                            />
                        </div>

                        <div className="form-check mb-3">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                name="availability"
                                checked={formData.availability}
                                onChange={handleChange}
                                required
                                id="availabilityCheck"
                            />
                            <label className="form-check-label" htmlFor="availabilityCheck">
                                I confirm my availability for this booking*
                            </label>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Submit Interest
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShowInterestPopup; 