import React, { useState, useEffect } from 'react';

const PinCodePopup = ({ isOpen, onClose, onSubmit }) => {
    const [pinCode, setPinCode] = useState('');
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [popularPinCodes, setPopularPinCodes] = useState([
        // Major cities
        { code: '110001', area: 'New Delhi (Connaught Place)' },
        { code: '110020', area: 'New Delhi (Hauz Khas)' },
        { code: '110030', area: 'New Delhi (Mehrauli)' },
        { code: '110065', area: 'New Delhi (Dwarka)' },
        { code: '110092', area: 'New Delhi (Shahdara)' },
        
        { code: '400001', area: 'Mumbai (Fort)' },
        { code: '400050', area: 'Mumbai (Bandra West)' },
        { code: '400076', area: 'Mumbai (Powai)' },
        { code: '400097', area: 'Mumbai (Borivali)' },
        
        { code: '600001', area: 'Chennai (George Town)' },
        { code: '600040', area: 'Chennai (T Nagar)' },
        { code: '600096', area: 'Chennai (Sholinganallur)' },
        
        { code: '700001', area: 'Kolkata (BBD Bagh)' },
        { code: '700019', area: 'Kolkata (Ballygunge)' },
        { code: '700091', area: 'Kolkata (Salt Lake)' },
        
        { code: '560001', area: 'Bangalore (MG Road)' },
        { code: '560034', area: 'Bangalore (JP Nagar)' },
        { code: '560066', area: 'Bangalore (Whitefield)' },
        { code: '560103', area: 'Bangalore (Electronic City)' },
        
        // Other major cities
        { code: '380001', area: 'Ahmedabad (City Center)' },
        { code: '500001', area: 'Hyderabad (Charminar)' },
        { code: '500081', area: 'Hyderabad (Hitech City)' },
        { code: '411001', area: 'Pune (Camp)' },
        { code: '411057', area: 'Pune (Hinjewadi)' },
        { code: '201301', area: 'Noida (Sector 1)' },
        { code: '122001', area: 'Gurgaon (Old City)' },
        { code: '122003', area: 'Gurgaon (DLF Phase 3)' },
        { code: '302001', area: 'Jaipur (City Center)' },
        { code: '226001', area: 'Lucknow (Hazratganj)' },
        { code: '440001', area: 'Nagpur (City Center)' }
    ]);

    // Default PIN code for testing
    const DEFAULT_PIN_CODE = '110001';

    useEffect(() => {
        // Handle body scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            
            // Log debugging info when popup opens
            console.log('PinCodePopup opened');
            console.log('Available pin codes:', popularPinCodes.map(p => p.code));
            
            // Check if there's a pincode in localStorage 
            const savedPinCode = localStorage.getItem('pinCode');
            if (savedPinCode) {
                console.log(`Found saved pin code: ${savedPinCode}`);
                setPinCode(savedPinCode);
            } else {
                // Set default PIN code for easier testing
                console.log(`Setting default PIN code: ${DEFAULT_PIN_CODE}`);
                setPinCode(DEFAULT_PIN_CODE);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, popularPinCodes]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!pinCode || pinCode.length < 6) {
            setError('Please enter a valid 6-digit PIN code');
            return;
        }
        
        // Log before submitting
        console.log(`Submitting pin code: ${pinCode}`);
        
        // Check if the pin code is in our list
        const matchedPinCode = popularPinCodes.find(p => p.code === pinCode);
        if (matchedPinCode) {
            console.log(`Pin code matched in our database: ${matchedPinCode.area}`);
        } else {
            console.log('Pin code not in our predefined list, but accepting it anyway');
        }
        
        // Pass the pin code back to parent component
        if (typeof onSubmit === 'function') {
            onSubmit(pinCode);
        } else {
            console.error('onSubmit is not a function');
        }
        
        // Clear state
        setError('');
        setSearchTerm('');
        // Note: Don't clear the pinCode as it will cause a visual flicker before the modal closes
    };

    const handlePinCodeSelect = (code) => {
        console.log(`Selected pin code: ${code}`);
        setPinCode(code);
        setError('');
    };

    // Add a skip pin code handler
    const handleSkip = () => {
        console.log('Skipping pin code selection');
        // Use default PIN code when skipping
        const skipPinCode = DEFAULT_PIN_CODE; 
        console.log(`Using default PIN code: ${skipPinCode}`);
        
        if (typeof onSubmit === 'function') {
            // Still submit the default PIN code
            onSubmit(skipPinCode);
        } else if (typeof onClose === 'function') {
            onClose();
        } else {
            console.error('Neither onSubmit nor onClose are functions');
        }
    };
    
    // Filter pin codes based on search term
    const filteredPinCodes = popularPinCodes.filter(item => 
        item.code.includes(searchTerm) || 
        item.area.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If not open, don't render anything
    if (!isOpen) return null;

    return (
        <div className="pin-code-modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div className="pin-code-modal" style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                width: '90%',
                maxWidth: '450px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
            }}>
                <div className="pin-code-header" style={{
                    background: 'var(--primary-color)',
                    color: 'var(--accent-color-2)',
                    padding: '20px',
                    textAlign: 'center',
                }}>
                    <h3 style={{ margin: 0, fontWeight: 'bold' }}>Select Your PIN Code</h3>
                    <p style={{ margin: '10px 0 0' }}>We'll show photographers available in your area</p>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 'bold',
                            color: 'var(--primary-color)'
                        }}>
                            Enter PIN Code:
                        </label>
                        <input 
                            type="text" 
                            value={pinCode}
                            onChange={(e) => {
                                // Allow only numbers and limit to 6 digits
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setPinCode(value);
                                setError('');
                            }}
                            placeholder="Enter 6-digit PIN code"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                fontSize: '16px',
                                border: `1px solid ${error ? 'var(--error-color)' : 'var(--border-color)'}`,
                                borderRadius: '5px',
                                boxSizing: 'border-box'
                            }}
                        />
                        {error && (
                            <div style={{ color: 'var(--error-color)', fontSize: '14px', marginTop: '5px' }}>
                                {error}
                            </div>
                        )}
                        
                        <div style={{ fontSize: '12px', marginTop: '5px', color: 'var(--text-light)' }}>
                            <i className="fas fa-info-circle me-1"></i>
                            Used to match you with photographers in your area
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '10px' }}>
                            Search Pin Codes:
                        </p>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by area or pin code"
                            style={{
                                width: '100%',
                                padding: '10px 15px',
                                fontSize: '14px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '5px',
                                boxSizing: 'border-box',
                                marginBottom: '10px'
                            }}
                        />
                        
                        <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '10px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            padding: '5px'
                        }}>
                            {filteredPinCodes.map((item, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handlePinCodeSelect(item.code)}
                                    style={{
                                        backgroundColor: pinCode === item.code ? 'var(--primary-color)' : '#f0f0f0',
                                        color: pinCode === item.code ? 'var(--accent-color-2)' : 'var(--text-dark)',
                                        border: 'none',
                                        padding: '8px 15px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.2s',
                                        fontWeight: pinCode === item.code ? 'bold' : 'normal',
                                    }}
                                >
                                    {item.code} - {item.area}
                                </button>
                            ))}
                            
                            {filteredPinCodes.length === 0 && (
                                <div style={{ padding: '10px', color: 'var(--text-light)', width: '100%', textAlign: 'center' }}>
                                    No matching PIN codes found
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginTop: '20px' 
                    }}>
                        <button
                            type="button"
                            onClick={handleSkip}
                            style={{
                                backgroundColor: '#f8f9fa',
                                color: 'var(--text-light)',
                                border: '1px solid var(--border-color)',
                                padding: '10px 15px',
                                borderRadius: '5px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.backgroundColor = '#e2e6ea';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                        >
                            Skip for Now
                        </button>
                        
                        <button
                            type="submit"
                            style={{
                                backgroundColor: 'var(--primary-color)',
                                color: 'var(--accent-color-2)',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.opacity = 0.9;
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.opacity = 1;
                            }}
                        >
                            Confirm PIN Code
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PinCodePopup; 