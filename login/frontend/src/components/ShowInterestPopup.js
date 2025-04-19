import React, { useState } from 'react';
import '../styles/ShowInterestPopup.css';

const ShowInterestPopup = ({ booking, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        message: '',
        availability: true,
        expectedPrice: '',
        additionalNotes: ''
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
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <div className="interest-popup-content">
                    <div className="booking-details mb-4">
                        <h4>Booking Details</h4>
                        <p><strong>Type:</strong> {booking.photographyType}</p>
                        <p><strong>Date:</strong> {booking.date}</p>
                        <p><strong>Location:</strong> {booking.location}</p>
                        <p><strong>Budget Range:</strong> {booking.budgetRange}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <label htmlFor="message">Message to Client</label>
                            <textarea
                                id="message"
                                name="message"
                                className="form-control"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Introduce yourself and explain why you're interested in this booking..."
                                required
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label htmlFor="expectedPrice">Expected Price Range</label>
                            <input
                                type="text"
                                id="expectedPrice"
                                name="expectedPrice"
                                className="form-control"
                                value={formData.expectedPrice}
                                onChange={handleChange}
                                placeholder="Enter your expected price range"
                                required
                            />
                        </div>

                        <div className="form-check mb-3">
                            <input
                                type="checkbox"
                                id="availability"
                                name="availability"
                                className="form-check-input"
                                checked={formData.availability}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="availability">
                                I confirm my availability for the specified date
                            </label>
                        </div>

                        <div className="form-group mb-4">
                            <label htmlFor="additionalNotes">Additional Notes (Optional)</label>
                            <textarea
                                id="additionalNotes"
                                name="additionalNotes"
                                className="form-control"
                                value={formData.additionalNotes}
                                onChange={handleChange}
                                placeholder="Any additional information you'd like to share..."
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={!formData.availability || !formData.message || !formData.expectedPrice}
                            >
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