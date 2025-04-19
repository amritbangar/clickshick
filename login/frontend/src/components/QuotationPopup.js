import React, { useState } from 'react';
import '../styles/QuotationPopup.css';

const QuotationPopup = ({ booking, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        packageType: 'Basic', // Basic, Standard, Premium
        price: '',
        description: '',
        deliverables: {
            photos: '',
            videos: '',
            reels: '',
            printedPhotos: '',
            photoAlbum: false,
            editedPhotos: ''
        },
        timeframe: '',
        additionalServices: '',
        terms: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="quotation-popup-overlay">
            <div className="quotation-popup">
                <div className="quotation-popup-header">
                    <h3>Submit Quotation</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <div className="quotation-popup-content">
                    <div className="booking-details mb-4">
                        <h4>Booking Details</h4>
                        <p><strong>Type:</strong> {booking.photographyType}</p>
                        <p><strong>Date:</strong> {booking.date}</p>
                        <p><strong>Location:</strong> {booking.location}</p>
                        <p><strong>Budget Range:</strong> {booking.budgetRange}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-3">
                            <label>Package Type</label>
                            <select 
                                name="packageType" 
                                value={formData.packageType}
                                onChange={handleChange}
                                className="form-control"
                                required
                            >
                                <option value="Basic">Basic Package</option>
                                <option value="Standard">Standard Package</option>
                                <option value="Premium">Premium Package</option>
                            </select>
                        </div>

                        <div className="form-group mb-3">
                            <label>Price Quote (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter your price quote"
                                required
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label>Package Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Describe your package offering"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="deliverables-section mb-3">
                            <h5>Deliverables</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Number of Photos</label>
                                        <input
                                            type="number"
                                            name="deliverables.photos"
                                            value={formData.deliverables.photos}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="e.g., 100"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Number of Videos</label>
                                        <input
                                            type="number"
                                            name="deliverables.videos"
                                            value={formData.deliverables.videos}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="e.g., 2"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Number of Reels</label>
                                        <input
                                            type="number"
                                            name="deliverables.reels"
                                            value={formData.deliverables.reels}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="e.g., 3"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Printed Photos</label>
                                        <input
                                            type="number"
                                            name="deliverables.printedPhotos"
                                            value={formData.deliverables.printedPhotos}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="e.g., 20"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-check mb-2">
                                <input
                                    type="checkbox"
                                    name="deliverables.photoAlbum"
                                    checked={formData.deliverables.photoAlbum}
                                    onChange={handleChange}
                                    className="form-check-input"
                                />
                                <label className="form-check-label">Include Photo Album</label>
                            </div>
                            <div className="form-group">
                                <label>Number of Edited Photos</label>
                                <input
                                    type="number"
                                    name="deliverables.editedPhotos"
                                    value={formData.deliverables.editedPhotos}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="e.g., 50"
                                />
                            </div>
                        </div>

                        <div className="form-group mb-3">
                            <label>Delivery Timeframe</label>
                            <input
                                type="text"
                                name="timeframe"
                                value={formData.timeframe}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="e.g., 2 weeks after the event"
                                required
                            />
                        </div>

                        <div className="form-group mb-3">
                            <label>Additional Services</label>
                            <textarea
                                name="additionalServices"
                                value={formData.additionalServices}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Any additional services included in the package"
                                rows="2"
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label>Terms and Conditions</label>
                            <textarea
                                name="terms"
                                value={formData.terms}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Any specific terms or conditions"
                                rows="2"
                            />
                        </div>

                        <div className="d-flex justify-content-end">
                            <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Submit Quotation
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuotationPopup; 