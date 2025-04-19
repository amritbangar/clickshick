import React from 'react';
import '../styles/QuotationDetails.css';

const QuotationDetails = ({ quotation, photographer, onAccept, onDecline }) => {
    // Add null checks for quotation and photographer
    if (!quotation || !photographer) {
        return (
            <div className="quotation-details loading">
                <div className="text-center p-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading quotation details...</p>
                </div>
            </div>
        );
    }

    // Ensure deliverables exists, if not provide default empty object
    const deliverables = quotation.deliverables || {};

    return (
        <div className="quotation-details">
            <div className="photographer-info mb-4">
                <div className="d-flex align-items-center">
                    <img 
                        src={photographer.profileImage || require('../image/photo1.jpg')} 
                        alt={photographer.name || 'Photographer'}
                        className="photographer-avatar"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = require('../image/photo1.jpg');
                        }}
                    />
                    <div className="ms-3">
                        <h4 className="mb-1">{photographer.name || 'Photographer'}</h4>
                        <div className="rating mb-1">
                            {[...Array(5)].map((_, index) => (
                                <i 
                                    key={index}
                                    className={`fas fa-star ${index < (photographer.rating || 0) ? 'text-warning' : 'text-muted'}`}
                                ></i>
                            ))}
                            <span className="ms-2">({photographer.rating || 'N/A'})</span>
                        </div>
                        <p className="mb-0">
                            <i className="fas fa-map-marker-alt me-2"></i>
                            {photographer.location || 'Location not specified'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="quotation-section mb-4">
                <h5 className="section-title">Package Details</h5>
                <div className="package-info">
                    <div className="detail-row">
                        <span className="label">Package Type:</span>
                        <span className="value">{quotation.packageType || 'Not specified'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Price Quote:</span>
                        <span className="value price">₹{quotation.price || 'Not specified'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Description:</span>
                        <span className="value">{quotation.description || 'No description provided'}</span>
                    </div>
                </div>
            </div>

            <div className="deliverables-section mb-4">
                <h5 className="section-title">Deliverables</h5>
                <div className="deliverables-grid">
                    {deliverables.photos && (
                        <div className="deliverable-item">
                            <i className="fas fa-camera"></i>
                            <span className="count">{deliverables.photos}</span>
                            <span className="label">Photos</span>
                        </div>
                    )}
                    {deliverables.videos && (
                        <div className="deliverable-item">
                            <i className="fas fa-video"></i>
                            <span className="count">{deliverables.videos}</span>
                            <span className="label">Videos</span>
                        </div>
                    )}
                    {deliverables.reels && (
                        <div className="deliverable-item">
                            <i className="fas fa-film"></i>
                            <span className="count">{deliverables.reels}</span>
                            <span className="label">Reels</span>
                        </div>
                    )}
                    {deliverables.editedPhotos && (
                        <div className="deliverable-item">
                            <i className="fas fa-edit"></i>
                            <span className="count">{deliverables.editedPhotos}</span>
                            <span className="label">Edited Photos</span>
                        </div>
                    )}
                    {deliverables.printedPhotos && (
                        <div className="deliverable-item">
                            <i className="fas fa-print"></i>
                            <span className="count">{deliverables.printedPhotos}</span>
                            <span className="label">Printed Photos</span>
                        </div>
                    )}
                    {deliverables.photoAlbum && (
                        <div className="deliverable-item">
                            <i className="fas fa-book"></i>
                            <span className="label">Photo Album</span>
                        </div>
                    )}
                </div>
                {Object.keys(deliverables).length === 0 && (
                    <p className="text-muted text-center">No deliverables specified</p>
                )}
            </div>

            <div className="additional-info mb-4">
                <div className="info-section">
                    <h5 className="section-title">Delivery Timeframe</h5>
                    <p>{quotation.timeframe || 'Not specified'}</p>
                </div>

                {quotation.additionalServices && (
                    <div className="info-section">
                        <h5 className="section-title">Additional Services</h5>
                        <p>{quotation.additionalServices}</p>
                    </div>
                )}

                {quotation.terms && (
                    <div className="info-section">
                        <h5 className="section-title">Terms and Conditions</h5>
                        <p>{quotation.terms}</p>
                    </div>
                )}
            </div>

            <div className="action-buttons">
                <button 
                    className="btn btn-success me-2" 
                    onClick={onAccept}
                >
                    <i className="fas fa-check me-2"></i>
                    Accept Quotation
                </button>
                <button 
                    className="btn btn-danger" 
                    onClick={onDecline}
                >
                    <i className="fas fa-times me-2"></i>
                    Decline
                </button>
            </div>
        </div>
    );
};

export default QuotationDetails; 