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
        
        // Validate PIN code format (6 digits)
        if (!/^\d{6}$/.test(pinCode)) {
            setError('Please enter a valid 6-digit PIN code');
            return;
        }

        // Clear any previous errors
        setError('');
        
        // Submit the PIN code
        onSubmit(pinCode);
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
        <div className="popup-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="popup-content" style={{
                backgroundColor: 'white',
                padding: window.innerWidth <= 480 ? '20px' : '30px',
                borderRadius: window.innerWidth <= 480 ? '10px' : '15px',
                maxWidth: window.innerWidth <= 480 ? '100%' : '400px',
                width: window.innerWidth <= 480 ? 'calc(100% - 40px)' : '90%',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ 
                    marginTop: 0, 
                    marginBottom: window.innerWidth <= 480 ? '15px' : '20px',
                    color: 'var(--primary-color)',
                    fontSize: window.innerWidth <= 480 ? '1.3rem' : '1.5rem'
                }}>
                    <i className="fas fa-map-marker-alt" style={{ marginRight: '10px' }}></i>
                    Enter Your Area PIN Code
                </h2>
                
                <p style={{ 
                    marginBottom: window.innerWidth <= 480 ? '15px' : '20px',
                    color: 'var(--text-color)',
                    fontSize: window.innerWidth <= 480 ? '0.85rem' : '0.9rem'
                }}>
                    This helps us show you relevant photography sessions in your area.
                </p>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        color: 'var(--error-color)',
                        padding: window.innerWidth <= 480 ? '8px 10px' : '10px',
                        borderRadius: '5px',
                        marginBottom: window.innerWidth <= 480 ? '12px' : '15px',
                        fontSize: window.innerWidth <= 480 ? '0.85rem' : '0.9rem'
                    }}>
                        <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit PIN code"
                        style={{
                            width: '100%',
                            padding: window.innerWidth <= 480 ? '10px' : '12px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '5px',
                            marginBottom: window.innerWidth <= 480 ? '12px' : '15px',
                            fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem'
                        }}
                        maxLength={6}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        required
                    />

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: window.innerWidth <= 480 ? '8px' : '10px',
                        flexDirection: window.innerWidth <= 480 ? 'column' : 'row'
                    }}>
                        <button
                            type="button"
                            onClick={handleSkip}
                            style={{
                                padding: window.innerWidth <= 480 ? '8px 15px' : '10px 20px',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                flex: window.innerWidth <= 480 ? 'none' : 1,
                                color: 'var(--text-color)',
                                fontSize: window.innerWidth <= 480 ? '0.85rem' : '0.9rem',
                                width: window.innerWidth <= 480 ? '100%' : 'auto'
                            }}
                        >
                            Skip for Now
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: window.innerWidth <= 480 ? '8px 15px' : '10px 20px',
                                backgroundColor: 'var(--accent-color-1)',
                                color: 'var(--primary-color)',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                flex: window.innerWidth <= 480 ? 'none' : 1,
                                fontWeight: 'bold',
                                fontSize: window.innerWidth <= 480 ? '0.85rem' : '0.9rem',
                                width: window.innerWidth <= 480 ? '100%' : 'auto'
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PinCodePopup; 